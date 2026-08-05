import { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { supabase } from '../../supabase';
import type { Table, Order, OrderItem } from '../../types/pos';
import type { Product, Category } from '../../types/admin';

interface TableDetailModalProps {
  table: Table;
  orders: Order[];
  orderItems: OrderItem[];
  categories: Category[];
  products: Product[];
  restaurant: any;
  restaurantAddress?: string;
  menuUrl: string;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Bekliyor',      color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  preparing:  { label: 'Hazırlanıyor',  color: 'bg-orange-100 text-orange-800 border-orange-300' },
  ready:      { label: 'Hazır',         color: 'bg-green-100 text-green-800 border-green-300' },
  delivered:  { label: 'Teslim Edildi', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  cancelled:  { label: 'İptal',        color: 'bg-red-100 text-red-800 border-red-300' },
};

// No longer need NEXT_STATUS for direct delivery

export function TableDetailModal({
  table, orders, orderItems, categories: _categories, products: _products, restaurant, restaurantAddress, menuUrl, onClose, showToast
}: TableDetailModalProps) {
  const [activeSection, setActiveSection] = useState<'orders' | 'qr'>('orders');
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [editLabelValue, setEditLabelValue] = useState(table.label || '');

  useEffect(() => {
    setEditLabelValue(table.label || '');
    setIsEditingLabel(false);
  }, [table]);

  const handleSaveLabel = async () => {
    const newLabel = editLabelValue.trim() === '' ? null : editLabelValue.trim();
    const { error } = await supabase.from('tables').update({ label: newLabel }).eq('id', table.id);
    if (error) {
      showToast('İsim güncellenemedi: ' + error.message, 'error');
    } else {
      showToast('Masa ismi güncellendi!');
      setIsEditingLabel(false);
    }
  };

  const tableOrders = orders.filter(o => o.table_id === table.id);
  const tableItems = orderItems.filter(i => tableOrders.some(o => o.id === i.order_id));

  const totalAmount = tableItems
    .filter(i => i.status !== 'cancelled')
    .reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  const handleItemStatusChange = async (item: OrderItem) => {
    const { error } = await supabase.from('order_items').update({ status: 'delivered' }).eq('id', item.id);
    if (error) showToast('Durum güncellenemedi: ' + error.message, 'error');
  };

  const handleResolveWaiter = async () => {
    const { error } = await supabase.from('tables').update({ needs_waiter: false }).eq('id', table.id);
    if (error) showToast('Garson çağrısı kapatılamadı: ' + error.message, 'error');
    else showToast('Garson çağrısı kapatıldı.');
  };

  const handleMarkPaid = async () => {
    for (const order of tableOrders) {
      await supabase.from('orders').update({ status: 'paid', updated_at: new Date().toISOString() }).eq('id', order.id);
    }
    await supabase.from('tables').update({ status: 'empty' }).eq('id', table.id);
    showToast('Hesap kapatıldı!');
    onClose();
  };

  const qrUrl = `${menuUrl}?table=${table.id}`;

  const qrRef = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (activeSection === 'qr' && qrRef.current) {
      const dotColor = restaurant?.qr_dot_color || restaurant?.primary_color || '#8B5A2B';
      const bgColor = restaurant?.qr_bg_color || '#FFFFFF';
      
      const options = {
        width: 250,
        height: 250,
        data: qrUrl,
        dotsOptions: {
          color: dotColor,
          type: (restaurant?.qr_dot_style || 'rounded') as any
        },
        cornersSquareOptions: {
          type: (restaurant?.qr_corner_style || 'square') as any
        },
        backgroundOptions: {
          color: bgColor
        },
        image: restaurant?.qr_use_logo && restaurant?.logo_url ? restaurant.logo_url : undefined,
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 10
        }
      };

      if (!qrInstance.current) {
        qrInstance.current = new QRCodeStyling(options);
        qrRef.current.innerHTML = '';
        qrInstance.current.append(qrRef.current);
      } else {
        qrInstance.current.update(options);
      }
    }
  }, [activeSection, qrUrl, restaurant]);

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-end backdrop-blur-sm" onClick={onClose}>
      <div
        className="h-full w-full max-w-lg bg-surface border-l-4 border-brand-dark shadow-2xl overflow-y-auto animate-slide-in-right"
        onClick={e => e.stopPropagation()}
      >
        {/* Başlık */}
        <div className="sticky top-0 bg-[#F4E4C1] border-b-4 border-brand-dark p-5 z-10">
          <div className="flex items-center justify-between">
            <div>
              {isEditingLabel ? (
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="text"
                    value={editLabelValue}
                    onChange={(e) => setEditLabelValue(e.target.value)}
                    placeholder={`Masa ${table.table_number}`}
                    className="border-2 border-brand-dark px-2 py-1 text-2xl font-bold bg-white focus:outline-none w-48"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveLabel();
                      if (e.key === 'Escape') setIsEditingLabel(false);
                    }}
                  />
                  <button onClick={handleSaveLabel} className="bg-brand text-surface px-3 py-1 font-bold border-2 border-brand-dark hover:bg-brand-light hover:text-brand-dark text-xl">✓</button>
                  <button onClick={() => setIsEditingLabel(false)} className="bg-white text-brand-dark px-3 py-1 font-bold border-2 border-brand-dark hover:bg-gray-100 text-xl">✕</button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold text-brand-dark">
                    {table.label || `Masa ${table.table_number}`}
                  </h2>
                  <button onClick={() => setIsEditingLabel(true)} className="text-brand-dark/50 hover:text-brand-dark text-lg p-1" title="İsmi Düzenle">
                    ✎
                  </button>
                </div>
              )}
              <p className="text-sm font-bold text-brand-dark/50 mt-1">
                {table.capacity} kişilik · {tableOrders.length} aktif sipariş
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-black/5 active:scale-95 transition-all" title="Kapat (ESC)">
              <span className="text-3xl font-bold text-brand-dark">✕</span>
            </button>
          </div>

          {/* Garson Çağrısı Banner */}
          {table.needs_waiter && (
            <div className="mt-4 bg-red-100 border-2 border-red-500 p-3 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2 text-red-700 font-bold">
                <span className="text-xl">🔔</span>
                <span>Bu masa garson çağırdı!</span>
              </div>
              <button 
                onClick={handleResolveWaiter}
                className="bg-red-500 text-white px-3 py-1 text-sm font-bold border-2 border-red-700 hover:bg-red-600 active:scale-95 transition-all"
              >
                İlgilenildi (Kapat)
              </button>
            </div>
          )}

          {/* Tab seçici */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveSection('orders')}
              className={`flex-1 py-2 border-2 border-brand-dark font-bold text-sm transition-colors ${activeSection === 'orders' ? 'bg-brand text-surface' : 'bg-white text-brand-dark hover:bg-brand-light'}`}
            >
              Siparişler
            </button>
            <button
              onClick={() => setActiveSection('qr')}
              className={`flex-1 py-2 border-2 border-brand-dark font-bold text-sm transition-colors ${activeSection === 'qr' ? 'bg-brand text-surface' : 'bg-white text-brand-dark hover:bg-brand-light'}`}
            >
              QR Kod
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {activeSection === 'orders' && (
            <>
              {tableOrders.length === 0 ? (
                <div className="text-center py-16 text-brand-dark/40 font-bold">
                  <p className="text-5xl mb-4">🍽️</p>
                  <p className="text-lg">Bu masada aktif sipariş yok</p>
                </div>
              ) : (
                <>
                  {tableOrders.map(order => {
                    const items = orderItems.filter(i => i.order_id === order.id);
                    const orderTotal = items.filter(i => i.status !== 'cancelled').reduce((s, i) => s + i.unit_price * i.quantity, 0);
                    const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.pending;

                    return (
                      <div key={order.id} className="border-2 border-brand-dark bg-white">
                        {/* Sipariş başlığı */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-brand-dark/20 bg-gray-50">
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold px-2 py-1 border ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                            <span className="text-xs text-brand-dark/40 font-bold">
                              {order.created_at ? new Date(order.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          <span className="font-bold text-brand-dark">₺{orderTotal.toFixed(0)}</span>
                        </div>

                        {/* Sipariş kalemleri */}
                        <div className="divide-y divide-brand-dark/10">
                          {items.map(item => {
                            const canAdvance = item.status !== 'delivered' && item.status !== 'cancelled';
                            return (
                              <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                                <div className="flex-1 min-w-0">
                                  <p className={`font-bold ${item.status === 'cancelled' ? 'line-through opacity-40' : 'text-brand-dark'}`}>
                                    {item.quantity}x {item.product_name}
                                  </p>
                                  {item.selected_options && item.selected_options.length > 0 && (
                                    <p className="text-xs text-brand-dark/70 font-bold mt-0.5">
                                      {item.selected_options.map((o: any) => o.choiceName).join(', ')}
                                    </p>
                                  )}
                                  {item.note && <p className="text-xs text-brand-dark/50 italic mt-0.5 font-bold">"{item.note}"</p>}
                                </div>
                                <span className="text-sm font-bold text-brand-dark/60 shrink-0">
                                  ₺{(item.unit_price * item.quantity).toFixed(0)}
                                </span>
                                {canAdvance && (
                                  <button
                                    onClick={() => handleItemStatusChange(item)}
                                    className={`text-xs font-bold px-3 py-1.5 border-2 transition-colors hover:scale-105 bg-green-100 text-green-700 border-green-500`}
                                    title={`Teslim Edildi olarak işaretle`}
                                  >
                                    ✓
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Sipariş notu */}
                        {order.note && (
                          <div className="px-4 py-2 border-t border-brand-dark/10 bg-yellow-50 text-sm italic font-bold text-yellow-800">
                            Not: {order.note}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Toplam ve hesap kapat */}
                  <div className="border-4 border-brand-dark bg-[#F4E4C1] p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-brand-dark uppercase">Toplam</span>
                      <span className="text-3xl font-bold text-brand-dark">₺{totalAmount.toFixed(0)}</span>
                    </div>
                    <button
                      onClick={handleMarkPaid}
                      className="w-full py-4 bg-[#8fb38a] text-brand-dark border-2 border-brand-dark font-bold text-lg hover:bg-[#a3c79e] shadow-pixel transition-all active:translate-y-0.5"
                    >
                      Hesabı Kapat ✓
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {activeSection === 'qr' && (
            <div className="flex flex-col items-center gap-6 py-8">
              <div className="bg-white border-4 border-brand-dark p-6 shadow-pixel">
                <div ref={qrRef} className="w-[250px] h-[250px]" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-brand-dark">Masa {table.table_number}</p>
                {restaurantAddress && (
                  <p className="text-sm font-bold text-brand-dark/50 max-w-xs">{restaurantAddress}</p>
                )}
              </div>
              <p className="text-xs font-bold text-brand-dark/30 break-all text-center max-w-xs">{qrUrl}</p>
              
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => qrInstance.current?.download({ name: `masa-${table.table_number}-qr`, extension: 'png' })}
                  className="px-4 py-2 bg-[#8fb38a] text-brand-dark border-2 border-brand-dark font-bold text-sm shadow-pixel-sm hover:bg-[#a3c79e] active:translate-y-0.5"
                >
                  PNG İndir
                </button>
                <button
                  onClick={() => qrInstance.current?.download({ name: `masa-${table.table_number}-qr`, extension: 'svg' })}
                  className="px-4 py-2 bg-white text-brand-dark border-2 border-brand-dark font-bold text-sm shadow-pixel-sm hover:bg-gray-100 active:translate-y-0.5"
                >
                  SVG İndir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
