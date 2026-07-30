import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useRealtimeOrders } from '../hooks/useRealtimeOrders';
import { TableCard } from '../components/pos/TableCard';
import { TableDetailModal } from '../components/pos/TableDetailModal';
import { PriorityOrdersModal } from '../components/pos/PriorityOrdersModal';
import type { Table } from '../types/pos';
import type { Category, Product } from '../types/admin';

export default function ManagementDashboard() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [restaurantName, setRestaurantName] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showAddTable, setShowAddTable] = useState(false);
  const [newTableCount, setNewTableCount] = useState('1');
  const [showPriorityOrders, setShowPriorityOrders] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { tables, orders, orderItems, loading } = useRealtimeOrders(restaurantId);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Restoran bilgilerini çek
  useEffect(() => {
    const load = async () => {
      if (!restaurantId) return;
      const { data: rest } = await supabase.from('restaurants').select('*').eq('id', restaurantId).single();
      if (rest) {
        setRestaurant(rest);
        setRestaurantName(rest.name);
      }
      const { data: catData } = await supabase.from('categories').select('*').eq('restaurant_id', restaurantId);
      if (catData && catData.length > 0) {
        setCategories(catData);
        const catIds = catData.map(c => c.id);
        const { data: prodData } = await supabase.from('products').select('*').in('category_id', catIds);
        if (prodData) setProducts(prodData);
      }
    };
    load();
  }, [restaurantId]);

  // Toplu masa ekle
  const handleAddTables = async () => {
    if (!restaurantId) return;
    setAddLoading(true);

    const count = parseInt(newTableCount);
    if (isNaN(count) || count < 1) {
      showToast('Lütfen geçerli bir masa sayısı girin', 'error');
      setAddLoading(false);
      return;
    }
    
    const existingNumbers = new Set(tables.map(t => t.table_number));
    const tablesToInsert = [];
    for (let i = 1; i <= count; i++) {
      if (!existingNumbers.has(i)) {
        tablesToInsert.push({
          restaurant_id: restaurantId,
          table_number: i,
          capacity: 4
        });
      }
    }

    if (tablesToInsert.length === 0) {
      showToast(`1 ile ${count} arasındaki masalar zaten mevcut.`, 'error');
      setAddLoading(false);
      return;
    }

    const { error } = await supabase.from('tables').insert(tablesToInsert);

    if (error) {
      showToast('Masalar eklenirken bir hata oluştu: ' + error.message, 'error');
    } else {
      showToast(`${tablesToInsert.length} adet masa başarıyla eklendi!`);
      setNewTableCount('1');
      setShowAddTable(false);
    }
    setAddLoading(false);
  };

  // İstatistikler
  const occupiedCount = tables.filter(t => {
    const hasOrders = orders.some(o => o.table_id === t.id);
    return hasOrders || t.status === 'occupied';
  }).length;
  const pendingItems = orderItems.filter(i => 
    i.status === 'pending' && orders.some(o => o.id === i.order_id)
  );
  const pendingOrders = pendingItems.length;
  
  const totalRevenue = orders.reduce((sum, o) => {
    const items = orderItems.filter(i => i.order_id === o.id && i.status !== 'cancelled');
    return sum + items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  }, 0);

  const menuUrl = restaurant ? `${window.location.origin}/menu/${restaurant.slug || restaurant.id}` : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-surface font-pixel flex items-center justify-center text-2xl text-brand-dark">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-pixel text-ink">

      {/* ÜST BAR */}
      <header className="sticky top-0 z-40 bg-[#F4E4C1] border-b-4 border-brand-dark px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 border-2 border-brand-dark bg-white font-bold text-sm hover:bg-brand-light transition-colors"
            >
              ← Panele Dön
            </button>
            <div>
              <h1 className="text-2xl font-bold text-brand-dark uppercase">{restaurantName}</h1>
              <p className="text-sm font-bold text-brand-dark/50">Masa & Sipariş Yönetimi</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPriorityOrders(true)}
              className="relative px-5 py-2 bg-yellow-100 text-yellow-800 border-2 border-yellow-500 font-bold hover:bg-yellow-200 shadow-pixel-sm transition-all active:translate-y-0.5"
            >
              Öncelikli Siparişler
              {pendingOrders > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full border border-black animate-bounce">
                  {pendingOrders}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowAddTable(true)}
              className="px-5 py-2 bg-[#8fb38a] text-brand-dark border-2 border-brand-dark font-bold hover:bg-[#a3c79e] shadow-pixel-sm transition-all active:translate-y-0.5"
            >
              + Masa Ekle
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* İSTATİSTİK KARTLARI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-brand-dark p-4 text-center">
            <p className="text-3xl font-bold text-brand-dark">{tables.length}</p>
            <p className="text-sm font-bold text-brand-dark/50 uppercase mt-1">Toplam Masa</p>
          </div>
          <div className="bg-amber-50 border-2 border-amber-400 p-4 text-center">
            <p className="text-3xl font-bold text-amber-700">{occupiedCount}</p>
            <p className="text-sm font-bold text-amber-600/60 uppercase mt-1">Dolu Masa</p>
          </div>
          <div className="bg-yellow-50 border-2 border-yellow-400 p-4 text-center">
            <p className="text-3xl font-bold text-yellow-700">{pendingOrders}</p>
            <p className="text-sm font-bold text-yellow-600/60 uppercase mt-1">Bekleyen Sipariş</p>
          </div>
          <div className="bg-green-50 border-2 border-green-400 p-4 text-center">
            <p className="text-3xl font-bold text-green-700">₺{totalRevenue.toFixed(0)}</p>
            <p className="text-sm font-bold text-green-600/60 uppercase mt-1">Açık Hesap</p>
          </div>
        </div>

        {/* MASA GRID'İ */}
        {tables.length === 0 ? (
          <div className="bg-white border-4 border-dashed border-brand-dark/30 p-16 text-center">
            <p className="text-5xl mb-4">🪑</p>
            <p className="text-xl font-bold text-brand-dark/40 mb-4">Henüz masa eklenmemiş</p>
            <button
              onClick={() => setShowAddTable(true)}
              className="px-6 py-3 bg-[#8fb38a] text-brand-dark border-2 border-brand-dark font-bold hover:bg-[#a3c79e] shadow-pixel-sm"
            >
              İlk Masayı Ekle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {tables.map(table => (
              <TableCard
                key={table.id}
                table={table}
                orders={orders}
                orderItems={orderItems}
                onClick={setSelectedTable}
              />
            ))}
          </div>
        )}
      </div>

      {/* MASA DETAY MODALı */}
      {selectedTable && (
        <TableDetailModal
          table={selectedTable}
          orders={orders}
          orderItems={orderItems}
          categories={categories}
          products={products}
          restaurant={restaurant}
          menuUrl={menuUrl}
          onClose={() => setSelectedTable(null)}
          showToast={showToast}
        />
      )}

      {/* MASA EKLEME MODAL */}
      {showAddTable && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border-4 border-brand-dark p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold text-brand-dark mb-4">Toplu Masa Oluştur</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-brand-dark/70 mb-1">Kaç Masa Oluşturulacak?</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newTableCount}
                  onChange={e => setNewTableCount(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-brand-dark bg-white font-bold text-lg"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddTable(false)}
                  className="flex-1 px-4 py-2 border-2 border-brand-dark font-bold hover:bg-black/5 transition-colors"
                  disabled={addLoading}
                >
                  İptal
                </button>
                <button
                  onClick={handleAddTables}
                  disabled={addLoading}
                  className="flex-1 px-4 py-2 bg-brand-dark text-white font-bold border-2 border-brand-dark hover:bg-black transition-colors disabled:opacity-50"
                >
                  {addLoading ? 'Ekleniyor...' : 'Ekle'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Öncelikli Siparişler Modalı */}
      {showPriorityOrders && (
        <PriorityOrdersModal
          orders={orders}
          orderItems={orderItems}
          tables={tables}
          onClose={() => setShowPriorityOrders(false)}
          showToast={showToast}
        />
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
          <div className={`px-6 py-4 border-4 shadow-pixel font-bold text-lg text-white flex items-center gap-3 ${toast.type === 'success' ? 'bg-[#8fb38a] border-[#5b7a57]' : 'bg-[#d97777] border-[#8a3c3c]'}`}>
            <span>{toast.type === 'success' ? '✓' : '✕'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
