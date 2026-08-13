import { useMemo, useState } from 'react';
import { supabase } from '../../supabase';
import type { Order, OrderItem, Table } from '../../types/pos';
import { ChangePasswordModal } from './ChangePasswordModal';

interface ChefDashboardProps {
  orders: Order[];
  orderItems: OrderItem[];
  tables: Table[];
  staffRole?: string;
  staffId?: string | null;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  onLogout: () => void;
}

export function ChefDashboard({ orders, orderItems, tables, showToast, onLogout, staffId }: ChefDashboardProps) {
  const [showChangePassword, setShowChangePassword] = useState(false);
  // Sadece bekleyen (pending) ve hazırlanan (preparing) sipariş kalemleri
  const activeItems = useMemo(() => {
    return orderItems.filter(item => item.status === 'pending' || item.status === 'preparing');
  }, [orderItems]);

  // Kalemleri sipariş bazında grupla
  const groupedOrders = useMemo(() => {
    const map = new Map<string, { order: Order, items: OrderItem[], table: Table | undefined }>();
    
    activeItems.forEach(item => {
      if (!map.has(item.order_id)) {
        const order = orders.find(o => o.id === item.order_id);
        if (order) {
          const table = tables.find(t => t.id === order.table_id);
          map.set(item.order_id, { order, items: [], table });
        }
      }
      map.get(item.order_id)?.items.push(item);
    });

    // En eskiler (ilk verilen siparişler) en üstte olsun
    return Array.from(map.values()).sort((a, b) => {
      const timeA = new Date(a.order.created_at || 0).getTime();
      const timeB = new Date(b.order.created_at || 0).getTime();
      return timeA - timeB; // Eskiden yeniye
    });
  }, [activeItems, orders, tables]);

  const handleStatusChange = async (item: OrderItem, newStatus: 'preparing' | 'ready') => {
    const { error } = await supabase.from('order_items').update({ status: newStatus }).eq('id', item.id);
    if (error) {
      showToast('Durum güncellenemedi: ' + error.message, 'error');
    } else {
      showToast(`Sipariş durumu "${newStatus === 'preparing' ? 'Hazırlanıyor' : 'Hazır'}" yapıldı.`);
      // Eğer siparişteki tüm ürünler hazırlandıysa, ana siparişin durumunu da ready yapabiliriz, 
      // ancak basitlik adına bunu order_items üzerinden yöneteceğiz.
    }
  };

  return (
    <div className="min-h-screen bg-surface font-pixel text-ink">
      <header className="sticky top-0 z-40 bg-[#F4E4C1] border-b-4 border-brand-dark px-6 py-4 flex justify-between items-center shadow-pixel-sm">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark uppercase">Mutfak (KDS)</h1>
          <p className="text-sm font-bold text-brand-dark/50">Sadece aktif siparişleri görüyorsunuz.</p>
        </div>
        <div className="flex gap-2">
          {staffId && (
            <button 
              onClick={() => setShowChangePassword(true)}
              className="px-4 py-2 border-2 border-slate-500 bg-slate-100 text-slate-800 font-bold hover:bg-slate-200 transition-colors"
            >
              Şifre Değiştir
            </button>
          )}
          <button 
            onClick={onLogout}
            className="px-4 py-2 border-2 border-brand-dark bg-white text-brand-dark font-bold hover:bg-red-100 hover:text-red-700 transition-colors"
          >
            Çıkış Yap
          </button>
        </div>
      </header>

      {showChangePassword && staffId && (
        <ChangePasswordModal 
          staffId={staffId} 
          onClose={() => setShowChangePassword(false)} 
        />
      )}

      <div className="max-w-7xl mx-auto p-6">
        {groupedOrders.length === 0 ? (
          <div className="bg-white border-4 border-dashed border-brand-dark/30 p-16 text-center mt-10">
            <p className="text-6xl mb-4">🍳</p>
            <p className="text-2xl font-bold text-brand-dark/50">Şu an mutfakta bekleyen sipariş yok.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {groupedOrders.map(group => {
              const timeString = group.order.created_at ? new Date(group.order.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '';
              
              return (
                <div key={group.order.id} className="bg-white border-4 border-brand-dark shadow-pixel flex flex-col">
                  {/* Başlık */}
                  <div className="bg-brand-dark text-white p-3 border-b-4 border-brand-dark flex justify-between items-center">
                    <div>
                      <span className="font-bold text-xl">{group.table?.label || `Masa ${group.table?.table_number}`}</span>
                      <p className="text-xs opacity-70 font-bold">{timeString}</p>
                    </div>
                    <span className="text-3xl">🧾</span>
                  </div>

                  {/* Kalemler */}
                  <div className="flex-1 p-3 flex flex-col gap-3">
                    {group.items.map(item => (
                      <div key={item.id} className={`p-3 border-2 ${item.status === 'preparing' ? 'bg-orange-50 border-orange-400' : 'bg-gray-50 border-gray-300'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-lg leading-tight">
                            <span className="text-brand mr-1">{item.quantity}x</span> 
                            {item.product_name}
                          </p>
                        </div>
                        
                        {item.selected_options && item.selected_options.length > 0 && (
                          <div className="text-sm font-bold text-brand-dark/70 mb-1">
                            {item.selected_options.map((o: any) => o.choiceName).join(', ')}
                          </div>
                        )}
                        
                        {item.note && (
                          <p className="text-sm italic font-bold text-red-600 bg-red-100 p-1 border border-red-300 mb-2">
                            "{item.note}"
                          </p>
                        )}

                        <div className="flex gap-2 mt-3">
                          {item.status === 'pending' && (
                            <button 
                              onClick={() => handleStatusChange(item, 'preparing')}
                              className="flex-1 py-1.5 bg-orange-100 text-orange-800 border-2 border-orange-400 font-bold text-sm hover:bg-orange-200 active:translate-y-0.5"
                            >
                              Başla
                            </button>
                          )}
                          <button 
                            onClick={() => handleStatusChange(item, 'ready')}
                            className={`flex-1 py-1.5 font-bold text-sm border-2 active:translate-y-0.5 ${item.status === 'preparing' ? 'bg-green-100 text-green-800 border-green-500 hover:bg-green-200' : 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200'}`}
                          >
                            Hazır ✓
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sipariş Notu */}
                  {group.order.note && (
                    <div className="p-3 bg-yellow-100 border-t-4 border-brand-dark text-yellow-800 font-bold text-sm italic">
                      Genel Not: {group.order.note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
