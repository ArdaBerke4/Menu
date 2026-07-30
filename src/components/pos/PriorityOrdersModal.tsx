import { supabase } from '../../supabase';
import type { Table, Order, OrderItem } from '../../types/pos';

interface PriorityOrdersModalProps {
  orders: Order[];
  orderItems: OrderItem[];
  tables: Table[];
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export function PriorityOrdersModal({
  orders, orderItems, tables, onClose, showToast
}: PriorityOrdersModalProps) {
  
  // Sadece aktif siparişlerdeki bekleyen ürünleri al (eski/hayalet siparişleri filtrele)
  const pendingItems = orderItems.filter(i => 
    i.status === 'pending' && orders.some(o => o.id === i.order_id)
  );
  
  // En eskiden en yeniye sırala
  const sortedItems = [...pendingItems].sort((a, b) => {
    return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
  });

  const handleDeliver = async (item: OrderItem) => {
    const { error } = await supabase.from('order_items').update({ status: 'delivered' }).eq('id', item.id);
    if (error) {
      showToast('Hata: ' + error.message, 'error');
    } else {
      showToast('Sipariş teslim edildi!', 'success');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end backdrop-blur-sm" onClick={onClose}>
      <div
        className="h-full w-full max-w-md bg-surface border-l-4 border-brand-dark shadow-2xl overflow-y-auto animate-slide-in-right flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Başlık */}
        <div className="sticky top-0 bg-yellow-100 border-b-4 border-brand-dark p-5 z-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-yellow-900 uppercase">Öncelikli Siparişler</h2>
            <p className="text-sm font-bold text-yellow-700/70 mt-1">
              {sortedItems.length} bekleyen ürün
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 active:scale-95 transition-all" title="Kapat (ESC)">
            <span className="text-3xl font-bold text-brand-dark">✕</span>
          </button>
        </div>

        {/* Liste */}
        <div className="flex-1 p-5 space-y-4">
          {sortedItems.length === 0 ? (
            <div className="text-center py-10 opacity-50 font-bold">
              <p className="text-4xl mb-4">✨</p>
              <p>Bekleyen sipariş yok!</p>
            </div>
          ) : (
            sortedItems.map(item => {
              const order = orders.find(o => o.id === item.order_id);
              const table = tables.find(t => t.id === order?.table_id);
              const timeString = item.created_at ? new Date(item.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '';
              
              return (
                <div key={item.id} className="bg-white border-2 border-brand-dark p-4 flex flex-col gap-3 shadow-pixel-sm">
                  <div className="flex items-start justify-between border-b-2 border-brand-dark/10 pb-2">
                    <div>
                      <span className="bg-brand-dark text-white text-xs px-2 py-1 font-bold">
                        {table?.label || `Masa ${table?.table_number}`}
                      </span>
                      <span className="text-brand-dark/50 text-xs font-bold ml-2">
                        {timeString}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg text-brand-dark">
                        {item.quantity}x {item.product_name}
                      </p>
                      {item.note && <p className="text-xs text-brand-dark/60 italic">Not: {item.note}</p>}
                    </div>
                    
                    <button
                      onClick={() => handleDeliver(item)}
                      className="bg-green-100 text-green-700 border-2 border-green-500 font-bold px-4 py-2 hover:bg-green-200 active:scale-95 transition-all"
                    >
                      ✓ Teslim Et
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
