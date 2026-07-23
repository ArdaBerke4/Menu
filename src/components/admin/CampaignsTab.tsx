import React, { useState } from 'react';
import { supabase } from '../../supabase';
import type { Campaign, Category, Restaurant } from '../../types/admin';

interface CampaignsTabProps {
  campaigns: Campaign[];
  setCampaigns: (campaigns: Campaign[]) => void;
  categories: Category[];
  selectedRestaurant: Restaurant | null;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  setConfirmDialog: (dialog: any) => void;
}

export function CampaignsTab({
  campaigns,
  setCampaigns,
  categories,
  selectedRestaurant,
  showToast,
  setConfirmDialog
}: CampaignsTabProps) {
  const [loading, setLoading] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [campaignDiscount, setCampaignDiscount] = useState('');
  const [campaignCategoryId, setCampaignCategoryId] = useState<string>('all');

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant) return;
    const discount = parseFloat(campaignDiscount.replace(',', '.'));
    if (isNaN(discount) || discount <= 0 || discount > 100) { 
      showToast('Geçerli bir yüzde girin (1-100).', 'error'); 
      return; 
    }
    setLoading(true);
    const { data, error } = await supabase.from('campaigns').insert([{
      restaurant_id: selectedRestaurant.id,
      name: campaignName || 'Kampanya',
      discount_percent: discount,
      category_id: campaignCategoryId === 'all' ? null : campaignCategoryId,
      is_active: true,
    }]).select().single();
    if (error) {
      showToast('Kampanya oluşturulamadı: ' + error.message, 'error');
    } else if (data) { 
      setCampaigns([data, ...campaigns]); 
      setCampaignName(''); 
      setCampaignDiscount(''); 
      setCampaignCategoryId('all'); 
      showToast("Kampanya başarıyla oluşturuldu!"); 
    }
    setLoading(false);
  };

  const toggleCampaignActive = async (campaign: Campaign) => {
    const { data } = await supabase.from('campaigns').update({ is_active: !campaign.is_active }).eq('id', campaign.id).select().single();
    if (data) setCampaigns(campaigns.map(c => c.id === campaign.id ? data : c));
  };

  const deleteCampaign = async (campaignId: string) => {
    setConfirmDialog({
      isOpen: true,
      message: "Bu kampanyayı silmek istediğine emin misin? Ürünlerin fiyatları eski haline dönecektir.",
      onConfirm: async () => {
        setConfirmDialog((prev: any) => ({ ...prev, isOpen: false }));
        const { error } = await supabase.from('campaigns').delete().eq('id', campaignId);
        if (!error) {
          setCampaigns(campaigns.filter((c: Campaign) => c.id !== campaignId));
          showToast("Kampanya silindi.");
        } else {
          showToast("Kampanya silinemedi.", 'error');
        }
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold uppercase mb-2">🏷️ Kampanya Düzenle</h1>
        <p className="text-lg text-brand-dark/60 font-bold">Kategoriye veya tüm ürünlere indirim kampanyası uygula. Kampanyalar gerçek fiyatları değiştirmez, sadece müşteri menüsünde üzeri çizili eski fiyat + yeni fiyat gösterilir.</p>
      </header>

      {/* Yeni Kampanya Formu */}
      <form onSubmit={handleCreateCampaign} className="bg-[#F4E4C1] border-4 border-brand-dark shadow-pixel p-6 mb-8">
        <h2 className="text-2xl font-bold uppercase mb-4 border-b-2 border-brand-dark pb-2">Yeni Kampanya Oluştur</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-bold mb-1">Kampanya Adı</label>
            <input value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="Ör: Yaz İndirimi" className="w-full px-4 py-3 border-2 border-brand-dark bg-white focus:outline-none" />
          </div>
          <div>
            <label className="block font-bold mb-1">İndirim Yüzdesi (%)</label>
            <input value={campaignDiscount} onChange={e => setCampaignDiscount(e.target.value)} placeholder="Ör: 20" type="text" inputMode="decimal" className="w-full px-4 py-3 border-2 border-brand-dark bg-white focus:outline-none" required />
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-bold mb-1">Hedef</label>
          <select value={campaignCategoryId} onChange={e => setCampaignCategoryId(e.target.value)} className="w-full px-4 py-3 border-2 border-brand-dark bg-white focus:outline-none">
            <option value="all">TÜM ÜRÜNLER</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 bg-brand text-surface border-2 border-brand-dark font-bold uppercase text-xl hover:opacity-90 active:translate-y-1 shadow-pixel disabled:opacity-50">
          {loading ? 'Oluşturuluyor...' : 'Kampanya Oluştur ✓'}
        </button>
      </form>

      {/* Mevcut Kampanyalar */}
      <div className="bg-[#F4E4C1] border-4 border-brand-dark shadow-pixel p-6">
        <h2 className="text-2xl font-bold uppercase mb-4 border-b-2 border-brand-dark pb-2">Mevcut Kampanyalar</h2>
        {campaigns.length === 0 ? (
          <p className="text-center opacity-60 font-bold py-8">Henüz kampanya yok. Yukarıdan oluşturabilirsin.</p>
        ) : (
          <div className="space-y-3">
            {campaigns.map(camp => (
              <div key={camp.id} className={`flex items-center justify-between gap-4 p-4 border-2 border-brand-dark transition-all ${camp.is_active ? 'bg-white' : 'bg-gray-200 opacity-60'}`}>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xl truncate">{camp.name}</div>
                  <div className="text-sm font-bold opacity-70">
                    %{camp.discount_percent} indirim • {camp.category_id ? categories.find(c => c.id === camp.category_id)?.name || 'Silinmiş Kategori' : 'Tüm Ürünler'}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => toggleCampaignActive(camp)} className={`px-4 py-2 border-2 border-brand-dark font-bold text-sm transition-all active:scale-95 ${camp.is_active ? 'bg-[#8fb38a] text-brand-dark' : 'bg-white text-brand-dark'}`}>
                    {camp.is_active ? 'AKTİF ✓' : 'PASİF'}
                  </button>
                  <button onClick={() => deleteCampaign(camp.id)} className="px-4 py-2 border-2 border-brand-dark bg-red-100 text-red-700 font-bold text-sm hover:bg-red-200 transition-all active:scale-95">
                    SİL
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
