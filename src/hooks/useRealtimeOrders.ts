import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import type { Table, Order, OrderItem } from '../types/pos';

export function useRealtimeOrders(restaurantId: string | undefined) {
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // İlk yükleme
  const fetchAll = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);

    const [tablesRes, ordersRes] = await Promise.all([
      supabase.from('tables').select('*').eq('restaurant_id', restaurantId).order('table_number'),
      supabase.from('orders').select('*').eq('restaurant_id', restaurantId)
        .not('status', 'in', '("paid","cancelled")').order('created_at', { ascending: false }),
    ]);

    if (tablesRes.data) setTables(tablesRes.data);
    if (ordersRes.data) {
      setOrders(ordersRes.data);
      // Aktif siparişlerin kalemlerini çek
      const activeOrderIds = ordersRes.data.map(o => o.id);
      if (activeOrderIds.length > 0) {
        const { data: itemsData } = await supabase.from('order_items').select('*').in('order_id', activeOrderIds);
        if (itemsData) setOrderItems(itemsData);
      }
    }
    setLoading(false);
  }, [restaurantId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Realtime dinle
  useEffect(() => {
    if (!restaurantId) return;

    const channel = supabase
      .channel(`pos-${restaurantId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables', filter: `restaurant_id=eq.${restaurantId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTables(prev => [...prev, payload.new as Table].sort((a, b) => a.table_number - b.table_number));
          } else if (payload.eventType === 'UPDATE') {
            setTables(prev => prev.map(t => t.id === (payload.new as Table).id ? payload.new as Table : t));
          } else if (payload.eventType === 'DELETE') {
            setTables(prev => prev.filter(t => t.id !== (payload.old as any).id));
          }
        }
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurantId}` },
        (payload) => {
          const newOrder = payload.new as Order;
          if (payload.eventType === 'INSERT') {
            setOrders(prev => [newOrder, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            if (newOrder.status === 'paid' || newOrder.status === 'cancelled') {
              setOrders(prev => prev.filter(o => o.id !== newOrder.id));
              setOrderItems(prev => prev.filter(item => item.order_id !== newOrder.id));
            } else {
              setOrders(prev => prev.map(o => o.id === newOrder.id ? newOrder : o));
            }
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(o => o.id !== (payload.old as any).id));
          }
        }
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as OrderItem;
            // Sadece bu restoranın siparişlerine ait ise ekle
            setOrderItems(prev => [...prev, newItem]);
          } else if (payload.eventType === 'UPDATE') {
            setOrderItems(prev => prev.map(i => i.id === (payload.new as OrderItem).id ? payload.new as OrderItem : i));
          } else if (payload.eventType === 'DELETE') {
            setOrderItems(prev => prev.filter(i => i.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  return { tables, setTables, orders, setOrders, orderItems, setOrderItems, loading, refetch: fetchAll };
}
