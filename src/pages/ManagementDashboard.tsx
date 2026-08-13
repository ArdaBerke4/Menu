import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useRealtimeOrders } from '../hooks/useRealtimeOrders';
import { TableCard } from '../components/pos/TableCard';
import { TableDetailModal } from '../components/pos/TableDetailModal';
import { PriorityOrdersModal } from '../components/pos/PriorityOrdersModal';
import { StatisticsModal } from '../components/pos/StatisticsModal';
import { ChefDashboard } from '../components/pos/ChefDashboard';
import QRCodeStyling from 'qr-code-styling';
import { useRef } from 'react';
import type { Table } from '../types/pos';
import type { Category, Product } from '../types/admin';
import { getStaffToken, getStaffSession, clearStaffSession } from '../utils/auth';
import { ChangePasswordModal } from '../components/pos/ChangePasswordModal';

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
  const [showStatistics, setShowStatistics] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [staffRole, setStaffRole] = useState<'admin' | 'waiter' | 'chef' | null>(null);
  const [staffId, setStaffId] = useState<string | null>(null);
  const [showStaffQR, setShowStaffQR] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const waiterQrRef = useRef<HTMLDivElement>(null);
  const chefQrRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { tables, orders, orderItems, loading } = useRealtimeOrders(restaurantId);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Rol Kontrolü
  useEffect(() => {
    const session = getStaffSession(restaurantId!);
    if (session && (session.role === 'waiter' || session.role === 'chef')) {
      setStaffRole(session.role as 'waiter' | 'chef');
      setStaffId(session.id);
    } else {
      // Fallback for admin
      const legacyRole = localStorage.getItem(`staff_role_${restaurantId}`);
      if (legacyRole === 'waiter' || legacyRole === 'chef') {
        setStaffRole(legacyRole as 'waiter' | 'chef');
      } else {
        supabase.auth.getUser().then(({ data }) => {
          if (data.user) setStaffRole('admin');
          else navigate('/auth');
        });
      }
    }
  }, [restaurantId, navigate]);

  // Aktif masanın güncel kalmasını sağla (İsim değişimi vb. realtime güncellemeler için)
  useEffect(() => {
    if (selectedTable) {
      const updatedTable = tables.find(t => t.id === selectedTable.id);
      if (updatedTable && updatedTable.label !== selectedTable.label) {
        setSelectedTable(updatedTable);
      }
    }
  }, [tables, selectedTable]);

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

  // QR Kodları Oluştur
  useEffect(() => {
    if (showStaffQR && restaurantId) {
      const baseUrl = window.location.origin;
      const token = getStaffToken(restaurantId);
      const waiterUrl = `${baseUrl}/staff/${restaurantId}?role=waiter&token=${token}`;
      const chefUrl = `${baseUrl}/staff/${restaurantId}?role=chef&token=${token}`;

      const options = {
        width: 200, height: 200,
        dotsOptions: { color: '#000', type: 'rounded' as any },
        backgroundOptions: { color: '#fff' }
      };

      if (waiterQrRef.current) {
        waiterQrRef.current.innerHTML = '';
        new QRCodeStyling({ ...options, data: waiterUrl }).append(waiterQrRef.current);
      }
      if (chefQrRef.current) {
        chefQrRef.current.innerHTML = '';
        new QRCodeStyling({ ...options, data: chefUrl }).append(chefQrRef.current);
      }
    }
  }, [showStaffQR, restaurantId]);

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

  if (staffRole === null) return null;

  if (staffRole === 'chef') {
    return (
      <ChefDashboard 
        orders={orders}
        orderItems={orderItems}
        tables={tables}
        showToast={showToast}
        staffRole={staffRole}
        staffId={staffId}
        onLogout={() => {
          clearStaffSession(restaurantId!);
          navigate(`/menu/${restaurant?.slug || restaurantId}`);
        }}
      />
    );
  }

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
            {staffRole === 'admin' && (
              <button
                onClick={() => setShowStaffQR(true)}
                className="px-4 py-2 bg-purple-100 text-purple-800 border-2 border-purple-500 font-bold hover:bg-purple-200 shadow-pixel-sm active:translate-y-0.5"
              >
                QR Personel
              </button>
            )}
            
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
            {staffRole === 'admin' && (
              <button
                onClick={() => setShowStatistics(true)}
                className="px-5 py-2 bg-blue-100 text-blue-800 border-2 border-blue-500 font-bold hover:bg-blue-200 shadow-pixel-sm transition-all active:translate-y-0.5"
              >
                📊 İstatistikler
              </button>
            )}
            {staffRole === 'admin' && (
              <button
                onClick={() => setShowAddTable(true)}
                className="px-5 py-2 bg-[#8fb38a] text-brand-dark border-2 border-brand-dark font-bold hover:bg-[#a3c79e] shadow-pixel-sm transition-all active:translate-y-0.5"
              >
                + Masa Ekle
              </button>
            )}
            {staffRole === 'waiter' && (
              <>
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="px-4 py-2 bg-slate-100 text-slate-800 border-2 border-slate-500 font-bold hover:bg-slate-200 shadow-pixel-sm active:translate-y-0.5"
                >
                  Şifre Değiştir
                </button>
                <button
                  onClick={() => {
                    clearStaffSession(restaurantId!);
                    navigate(`/menu/${restaurant?.slug || restaurantId}`);
                  }}
                  className="px-4 py-2 bg-red-100 text-red-800 border-2 border-red-500 font-bold hover:bg-red-200 shadow-pixel-sm active:translate-y-0.5"
                >
                  Çıkış Yap
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {showChangePassword && staffId && (
        <ChangePasswordModal 
          staffId={staffId} 
          onClose={() => setShowChangePassword(false)} 
        />
      )}

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
          staffRole={staffRole}
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

      {showStatistics && restaurantId && (
        <StatisticsModal
          restaurantId={restaurantId}
          onClose={() => setShowStatistics(false)}
        />
      )}

      {/* PERSONEL QR MODAL */}
      {showStaffQR && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface border-4 border-brand-dark p-6 w-full max-w-2xl shadow-2xl relative">
            <button onClick={() => setShowStaffQR(false)} className="absolute top-2 right-2 text-2xl font-bold p-2 hover:bg-black/5">✕</button>
            <h2 className="text-2xl font-bold text-brand-dark mb-6 text-center uppercase">Personel QR Girişleri</h2>
            <p className="text-center text-brand-dark/70 font-bold mb-6">Personelinizin sisteme şifresiz girmesi için kendi telefonlarından aşağıdaki QR kodlardan uygun olanını okutmasını sağlayın.</p>
            
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
              {/* Garson */}
              <div className="bg-white border-4 border-brand-dark p-4 flex flex-col items-center">
                <h3 className="text-xl font-bold text-brand-dark mb-4">💁 Garson Girişi</h3>
                <div ref={waiterQrRef} className="w-[200px] h-[200px] bg-gray-100 border border-gray-200"></div>
                <p className="text-sm font-bold text-brand-dark/50 mt-4 text-center">Masa ve siparişleri<br/>teslim etme yetkisi</p>
                <a href={`${window.location.origin}/staff/${restaurantId}?role=waiter&token=${getStaffToken(restaurantId!)}`} target="_blank" rel="noreferrer" className="mt-2 text-xs text-brand hover:underline font-bold break-all text-center">
                  Bağlantıyı Aç / Kopyala
                </a>
              </div>

              {/* Şef */}
              <div className="bg-white border-4 border-brand-dark p-4 flex flex-col items-center">
                <h3 className="text-xl font-bold text-brand-dark mb-4">👨‍🍳 Şef (Mutfak) Girişi</h3>
                <div ref={chefQrRef} className="w-[200px] h-[200px] bg-gray-100 border border-gray-200"></div>
                <p className="text-sm font-bold text-brand-dark/50 mt-4 text-center">Sadece mutfak sipariş<br/>ekranı (KDS) yetkisi</p>
                <a href={`${window.location.origin}/staff/${restaurantId}?role=chef&token=${getStaffToken(restaurantId!)}`} target="_blank" rel="noreferrer" className="mt-2 text-xs text-brand hover:underline font-bold break-all text-center">
                  Bağlantıyı Aç / Kopyala
                </a>
              </div>
            </div>
          </div>
        </div>
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
