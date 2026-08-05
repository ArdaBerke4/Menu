import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import * as XLSX from 'xlsx';

interface StatisticsModalProps {
  restaurantId: string;
  onClose: () => void;
}

type TimeRange = 'daily' | 'weekly' | 'monthly';

interface ProductStat {
  product_name: string;
  quantity: number;
  revenue: number;
}

interface ComboStat {
  combo: string;
  count: number;
}

export function StatisticsModal({ restaurantId, onClose }: StatisticsModalProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  const [loading, setLoading] = useState(true);
  
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [productStats, setProductStats] = useState<ProductStat[]>([]);
  const [comboStats, setComboStats] = useState<ComboStat[]>([]);

  useEffect(() => {
    fetchStatistics();
  }, [timeRange, restaurantId]);

  const fetchStatistics = async () => {
    setLoading(true);
    
    // Tarih aralığını belirle
    const now = new Date();
    let startDate = new Date();
    
    if (timeRange === 'daily') {
      startDate.setHours(0, 0, 0, 0);
    } else if (timeRange === 'weekly') {
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (timeRange === 'monthly') {
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    }

    // İlgili tarih aralığındaki ödenmiş siparişleri getir
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount')
      .eq('restaurant_id', restaurantId)
      .eq('status', 'paid')
      .gte('created_at', startDate.toISOString());

    if (ordersError || !orders) {
      console.error(ordersError);
      setLoading(false);
      return;
    }

    const orderIds = orders.map(o => o.id);
    setTotalOrders(orders.length);
    setTotalRevenue(orders.reduce((sum, o) => sum + (o.total_amount || 0), 0));

    if (orderIds.length === 0) {
      setProductStats([]);
      setComboStats([]);
      setLoading(false);
      return;
    }

    // Sipariş kalemlerini getir (iptal edilmemiş)
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('order_id, product_name, quantity, unit_price, selected_options')
      .in('order_id', orderIds)
      .neq('status', 'cancelled');

    if (itemsError || !items) {
      console.error(itemsError);
      setLoading(false);
      return;
    }

    // Ürün bazlı istatistikleri hesapla
    const pStats: Record<string, ProductStat> = {};
    const orderItemMap: Record<string, string[]> = {}; // { order_id: [product_names...] }

    items.forEach(item => {
      // Ürün istatistiği
      const optionsTotal = (item.selected_options || []).reduce((s: number, o: any) => s + (o.price || 0), 0);
      const itemRevenue = (item.unit_price + optionsTotal) * item.quantity;
      
      if (!pStats[item.product_name]) {
        pStats[item.product_name] = { product_name: item.product_name, quantity: 0, revenue: 0 };
      }
      pStats[item.product_name].quantity += item.quantity;
      pStats[item.product_name].revenue += itemRevenue;

      // Birlikte satılanlar için siparişteki benzersiz ürün isimlerini topla
      if (!orderItemMap[item.order_id]) orderItemMap[item.order_id] = [];
      if (!orderItemMap[item.order_id].includes(item.product_name)) {
        orderItemMap[item.order_id].push(item.product_name);
      }
    });

    const sortedProducts = Object.values(pStats).sort((a, b) => b.quantity - a.quantity);
    setProductStats(sortedProducts);

    // Birlikte satılan ürünleri hesapla
    const combos: Record<string, number> = {};
    Object.values(orderItemMap).forEach(productsInOrder => {
      // Siparişteki ürün kombinasyonlarını (ikili) oluştur
      productsInOrder.sort(); // Alfabetik sırala ki (A,B) ile (B,A) aynı sayılsın
      for (let i = 0; i < productsInOrder.length; i++) {
        for (let j = i + 1; j < productsInOrder.length; j++) {
          const comboName = `${productsInOrder[i]} + ${productsInOrder[j]}`;
          combos[comboName] = (combos[comboName] || 0) + 1;
        }
      }
    });

    const sortedCombos = Object.entries(combos)
      .map(([combo, count]) => ({ combo, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // En çok satılan ilk 5 kombinasyon
      
    setComboStats(sortedCombos);
    setLoading(false);
  };

  const exportToExcel = () => {
    // 1. Özet Veriler
    const summaryData = [
      ["SATIS RAPORU", ""],
      ["Rapor Tipi", timeRange === 'daily' ? 'Günlük' : timeRange === 'weekly' ? 'Haftalık' : 'Aylık'],
      ["Tarih", new Date().toLocaleDateString('tr-TR')],
      ["Toplam Ciro", `${totalRevenue} TL`],
      ["Tamamlanan Sipariş", totalOrders],
      ["", ""],
      ["ÜRÜN SATIŞ SIRALAMASI", "", ""],
      ["Ürün Adı", "Satış Adedi", "Ciro (TL)"]
    ];

    productStats.forEach(p => {
      summaryData.push([p.product_name, p.quantity, p.revenue]);
    });

    summaryData.push(["", "", ""]);
    summaryData.push(["BİRLİKTE EN ÇOK SATILANLAR", ""]);
    summaryData.push(["Kombinasyon", "Satış Sayısı"]);
    
    comboStats.forEach(c => {
      summaryData.push([c.combo, c.count]);
    });

    // Worksheet oluştur
    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Sütun genişliklerini ayarla
    ws['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];

    // Workbook oluştur ve ekle
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Satis Raporu");

    // Dosyayı indir
    XLSX.writeFile(wb, `Satis_Raporu_${timeRange}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-surface border-4 border-brand-dark w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-[#F4E4C1] p-5 border-b-4 border-brand-dark flex items-center justify-between">
          <h2 className="text-3xl font-bold text-brand-dark uppercase flex items-center gap-3">
            <span className="text-4xl">📊</span> İstatistikler
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white font-bold border-2 border-brand-dark hover:bg-green-700 shadow-pixel-sm transition-all active:translate-y-0.5 flex items-center gap-2 uppercase text-sm"
              title="CSV (Excel) olarak indir"
            >
              📥 Excel İndir
            </button>
            <button onClick={onClose} className="p-2 hover:bg-black/5 active:scale-95 transition-all text-2xl font-bold text-brand-dark">
              ✕
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-5 border-b-2 border-brand-dark/20 flex gap-4 bg-white">
          {(['daily', 'weekly', 'monthly'] as const).map(tr => (
            <button
              key={tr}
              onClick={() => setTimeRange(tr)}
              className={`px-6 py-2 border-2 border-brand-dark font-bold uppercase transition-all ${timeRange === tr ? 'bg-brand text-surface shadow-pixel' : 'bg-gray-100 text-brand-dark hover:bg-gray-200'}`}
            >
              {tr === 'daily' ? 'Günlük' : tr === 'weekly' ? 'Haftalık (Son 7 Gün)' : 'Aylık (Son 30 Gün)'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto bg-gray-50 flex-1">
          {loading ? (
            <div className="py-20 text-center text-brand-dark/50 font-bold text-xl animate-pulse">
              Veriler hesaplanıyor...
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Özet Metrikler */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-100 border-2 border-green-500 p-6 flex flex-col items-center justify-center text-center shadow-pixel-sm">
                  <span className="text-sm font-bold text-green-700/70 uppercase">Toplam Ciro</span>
                  <span className="text-5xl font-black text-green-700 mt-2">₺{totalRevenue.toFixed(0)}</span>
                </div>
                <div className="bg-blue-100 border-2 border-blue-500 p-6 flex flex-col items-center justify-center text-center shadow-pixel-sm">
                  <span className="text-sm font-bold text-blue-700/70 uppercase">Tamamlanan Sipariş</span>
                  <span className="text-5xl font-black text-blue-700 mt-2">{totalOrders}</span>
                </div>
              </div>

              {/* Grid 2 Column */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Ürün Satış Sıralaması */}
                <div className="bg-white border-4 border-brand-dark p-0 shadow-pixel-sm flex flex-col max-h-[400px]">
                  <h3 className="text-lg font-bold text-surface bg-brand p-3 border-b-4 border-brand-dark uppercase">
                    Ürün Satış Sıralaması
                  </h3>
                  <div className="overflow-y-auto p-4 space-y-2 flex-1">
                    {productStats.length === 0 ? (
                      <p className="text-brand-dark/40 italic font-bold text-center py-4">Satış bulunamadı.</p>
                    ) : (
                      productStats.map((p, i) => (
                        <div key={i} className="flex items-center justify-between border-b-2 border-brand-dark/10 pb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-black text-2xl text-brand-dark/30 w-8">{i + 1}.</span>
                            <div>
                              <p className="font-bold text-lg text-brand-dark uppercase">{p.product_name}</p>
                              <p className="text-base font-bold text-green-600">Ciro: ₺{p.revenue.toFixed(0)}</p>
                            </div>
                          </div>
                          <div className="font-black text-3xl text-brand-dark">
                            {p.quantity} <span className="text-lg">adet</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Birlikte En Çok Satılanlar */}
                <div className="bg-white border-4 border-brand-dark p-0 shadow-pixel-sm flex flex-col max-h-[400px]">
                  <h3 className="text-lg font-bold text-surface bg-brand p-3 border-b-4 border-brand-dark uppercase">
                    Birlikte En Çok Satılanlar
                  </h3>
                  <div className="overflow-y-auto p-4 space-y-3 flex-1 bg-yellow-50/50">
                    {comboStats.length === 0 ? (
                      <p className="text-brand-dark/40 italic font-bold text-center py-4">Kombinasyon bulunamadı.</p>
                    ) : (
                      comboStats.map((c, i) => (
                        <div key={i} className="bg-white border-2 border-yellow-400 p-3 shadow-pixel-sm flex items-center justify-between">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-brand-dark text-lg">{c.combo.split(' + ')[0]}</span>
                            <span className="text-yellow-600 font-bold text-xl leading-none">+</span>
                            <span className="font-bold text-brand-dark text-lg">{c.combo.split(' + ')[1]}</span>
                          </div>
                          <div className="bg-yellow-200 text-yellow-800 font-black px-4 py-2 border border-yellow-400 text-xl">
                            {c.count} kez
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
