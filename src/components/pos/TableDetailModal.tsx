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
  staffRole?: 'admin' | 'waiter' | 'chef' | null;
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
  table, orders, orderItems, categories: _categories, products: _products, restaurant, restaurantAddress, menuUrl, onClose, showToast, staffRole
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
      setIsEditingLabel(false);
      showToast('Masa ismi güncellendi!');
    }
  };

  const handleDeleteTable = async () => {
    const hasActiveOrders = orders.some(o => o.table_id === table.id);
    if (hasActiveOrders) {
      if (!window.confirm("Bu masada aktif siparişler var! Yine de masayı silmek istiyor musunuz?")) return;
    } else {
      if (!window.confirm("Bu masayı silmek istediğinize emin misiniz?")) return;
    }

    const { error } = await supabase.from('tables').delete().eq('id', table.id);
    if (error) {
      showToast('Masa silinemedi: ' + error.message, 'error');
    } else {
      showToast('Masa başarıyla silindi.');
      onClose();
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

  const handleResolveBill = async () => {
    const { error } = await supabase.from('tables').update({ wants_bill: null }).eq('id', table.id);
    if (error) showToast('Hesap isteği kapatılamadı: ' + error.message, 'error');
    else showToast('Hesap isteği kapatıldı.');
  };

  const handleMarkPaid = async () => {
    if (staffRole === 'chef') {
      showToast('Şefler hesap kapatamaz.', 'error');
      return;
    }
    for (const order of tableOrders) {
      await supabase.from('orders').update({ status: 'paid', updated_at: new Date().toISOString() }).eq('id', order.id);
    }
    await supabase.from('tables').update({ status: 'empty', needs_waiter: false, wants_bill: null }).eq('id', table.id);
    showToast('Hesap kapatıldı ve masa boşaltıldı.');
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
                  {staffRole === 'admin' && (
                    <button onClick={() => setIsEditingLabel(true)} className="text-brand-dark/50 hover:text-brand-dark text-lg p-1" title="İsmi Düzenle">
                      ✎
                    </button>
                  )}
                  {staffRole === 'admin' && (
                    <button onClick={handleDeleteTable} className="text-red-500/50 hover:text-red-600 text-lg p-1" title="Masayı Sil">
                      🗑️
                    </button>
                  )}
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

          {/* Hesap İsteği Banner */}
          {table.wants_bill && (
            <div className="mt-4 bg-amber-100 border-2 border-amber-500 p-3 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2 text-amber-700 font-bold">
                <span className="text-xl">🧾</span>
                <span>Bu masa {table.wants_bill === 'cash' ? 'NAKİT' : 'KART'} ile hesap istedi!</span>
              </div>
              <button 
                onClick={handleResolveBill}
                className="px-3 py-1 bg-white border-2 border-amber-500 text-amber-700 text-sm font-bold hover:bg-amber-50"
              >
                Kapat
              </button>
            </div>
          )}

          {/* Garson Çağrısı Banner */}
          {table.needs_waiter && !table.wants_bill && (
            <div className="mt-4 bg-red-100 border-2 border-red-500 p-3 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2 text-red-700 font-bold">
                <span className="text-xl">🔔</span>
                <span>Bu masa garson çağırdı!</span>
              </div>
              <button 
                onClick={handleResolveWaiter}
                className="px-3 py-1 bg-white border-2 border-red-500 text-red-700 text-sm font-bold hover:bg-red-50"
              >
                Kapat
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
                <div className="flex flex-col gap-4">
                  {/* ADİSYON / FİŞ TASARIMI */}
                  <div className="bg-[#fdfbf7] p-6 border-2 border-brand-dark font-mono text-sm leading-relaxed text-[#1a1a1a] shadow-md relative overflow-hidden">
                    {/* Tırtıklı üst kenar efekti (basit) */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQsOCA4LDAiIGZpbGw9IiNmNGU0YzEiLz48L3N2Zz4=')] bg-repeat-x"></div>
                    
                    <div className="text-center mb-6 mt-2 border-b-2 border-dashed border-[#1a1a1a]/30 pb-4">
                      <h3 className="font-bold text-2xl tracking-widest mb-1">ADİSYON</h3>
                      <p className="text-xs opacity-70">Tarih: {new Date().toLocaleDateString('tr-TR')}</p>
                    </div>

                    <div className="space-y-6">
                      {tableOrders.map(order => {
                        const items = orderItems.filter(i => i.order_id === order.id);
                        const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.pending;

                        return (
                          <div key={order.id} className="space-y-3">
                            {/* Sipariş Zamanı ve Durumu */}
                            <div className="flex items-center justify-between text-xs opacity-60 border-b border-dashed border-[#1a1a1a]/20 pb-1">
                              <span>Sipariş: {order.created_at ? new Date(order.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                              <span className="uppercase font-bold">{statusInfo.label}</span>
                            </div>

                            {/* Kalemler */}
                            <div className="space-y-3">
                              {items.map(item => {
                                const canAdvance = item.status !== 'delivered' && item.status !== 'cancelled' && (staffRole === 'admin' || (staffRole === 'waiter' && item.status === 'ready'));
                                return (
                                  <div key={item.id} className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className={`font-bold ${item.status === 'cancelled' ? 'line-through opacity-40' : ''}`}>
                                        {item.quantity}x {item.product_name}
                                        {item.status === 'preparing' && <span className="ml-2 text-[10px] bg-orange-100 text-orange-700 px-1 py-0.5 border border-orange-300 font-sans">Hazırlanıyor</span>}
                                        {item.status === 'ready' && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1 py-0.5 border border-green-300 font-sans">Hazır</span>}
                                      </p>
                                      {item.selected_options && item.selected_options.length > 0 && (
                                        <p className="text-xs opacity-70 mt-0.5 pl-4">
                                          - {item.selected_options.map((o: any) => o.choiceName).join(', ')}
                                        </p>
                                      )}
                                      {item.note && <p className="text-xs opacity-70 italic mt-0.5 pl-4 font-bold">"{item.note}"</p>}
                                      
                                      {canAdvance && (
                                        <button
                                          onClick={() => handleItemStatusChange(item)}
                                          className={`mt-1 text-[10px] font-sans font-bold px-2 py-1 transition-colors hover:scale-105 bg-green-100 text-green-700 border border-green-500 rounded`}
                                          title={`Teslim Edildi olarak işaretle`}
                                        >
                                          ✓ Teslim Edildi
                                        </button>
                                      )}
                                    </div>
                                    <span className="font-bold shrink-0">
                                      ₺{(item.unit_price * item.quantity).toFixed(0)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Sipariş Notu */}
                            {order.note && (
                              <div className="mt-2 text-xs italic font-bold border border-dashed border-[#1a1a1a]/30 p-2 bg-black/5">
                                Not: {order.note}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Fiş Altı - Toplam */}
                    <div className="mt-8 pt-4 border-t-2 border-dashed border-[#1a1a1a] flex justify-between items-center text-xl font-bold tracking-wider">
                      <span>TOPLAM</span>
                      <span>₺{totalAmount.toFixed(0)}</span>
                    </div>
                  </div>

                  {/* Hesap Kapat Butonu */}
                  <button
                    onClick={handleMarkPaid}
                    className="w-full py-4 bg-[#8fb38a] text-brand-dark border-4 border-brand-dark font-bold text-xl hover:bg-[#a3c79e] shadow-pixel transition-all active:translate-y-0.5 uppercase tracking-wider"
                  >
                    Hesabı Kapat ✓
                  </button>
                </div>
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
              <a href={qrUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-brand hover:underline break-all text-center max-w-xs">{qrUrl}</a>
              
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
