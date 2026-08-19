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
      showToast('GeÃ§erli bir yÃ¼zde girin (1-100).', 'error'); 
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
      showToast('Kampanya oluÅŸturulamadÄ±: ' + error.message, 'error');
    } else if (data) { 
      setCampaigns([data, ...campaigns]); 
      setCampaignName(''); 
      setCampaignDiscount(''); 
      setCampaignCategoryId('all'); 
      showToast("Kampanya baÅŸarÄ±yla oluÅŸturuldu!"); 
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
      message: "Bu kampanyayÄ± silmek istediÄŸine emin misin? ÃœrÃ¼nlerin fiyatlarÄ± eski haline dÃ¶necektir.",
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
        <h1 className="text-4xl font-bold uppercase mb-2">ğŸ·ï¸ Kampanya DÃ¼zenle</h1>
        <p className="text-lg text-admin-text/60 font-bold">Kategoriye veya tÃ¼m Ã¼rÃ¼nlere indirim kampanyasÄ± uygula. Kampanyalar gerÃ§ek fiyatlarÄ± deÄŸiÅŸtirmez, sadece mÃ¼ÅŸteri menÃ¼sÃ¼nde Ã¼zeri Ã§izili eski fiyat + yeni fiyat gÃ¶sterilir.</p>
      </header>

      {/* Yeni Kampanya Formu */}
      <form onSubmit={handleCreateCampaign} className="bg-admin-bg border-4 border-admin-border shadow-admin-pixel p-6 mb-8">
        <h2 className="text-2xl font-bold uppercase mb-4 border-b-2 border-admin-border pb-2">Yeni Kampanya OluÅŸtur</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-bold mb-1">Kampanya AdÄ±</label>
            <input value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="Ã–r: Yaz Ä°ndirimi" className="w-full px-4 py-3 border-2 border-admin-border bg-admin-surface focus:outline-none" />
          </div>
          <div>
            <label className="block font-bold mb-1">Ä°ndirim YÃ¼zdesi (%)</label>
            <input value={campaignDiscount} onChange={e => setCampaignDiscount(e.target.value)} placeholder="Ã–r: 20" type="text" inputMode="decimal" className="w-full px-4 py-3 border-2 border-admin-border bg-admin-surface focus:outline-none" required />
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-bold mb-1">Hedef</label>
          <select value={campaignCategoryId} onChange={e => setCampaignCategoryId(e.target.value)} className="w-full px-4 py-3 border-2 border-admin-border bg-admin-surface focus:outline-none">
            <option value="all">TÃœM ÃœRÃœNLER</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 bg-brand text-surface border-2 border-admin-border font-bold uppercase text-xl hover:opacity-90 active:translate-y-1 shadow-admin-pixel disabled:opacity-50">
          {loading ? 'OluÅŸturuluyor...' : 'Kampanya OluÅŸtur âœ“'}
        </button>
      </form>

      {/* Mevcut Kampanyalar */}
      <div className="bg-admin-bg border-4 border-admin-border shadow-admin-pixel p-6">
        <h2 className="text-2xl font-bold uppercase mb-4 border-b-2 border-admin-border pb-2">Mevcut Kampanyalar</h2>
        {campaigns.length === 0 ? (
          <p className="text-center opacity-60 font-bold py-8">HenÃ¼z kampanya yok. YukarÄ±dan oluÅŸturabilirsin.</p>
        ) : (
          <div className="space-y-3">
            {campaigns.map(camp => (
              <div key={camp.id} className={`flex items-center justify-between gap-4 p-4 border-2 border-admin-border transition-all ${camp.is_active ? 'bg-admin-surface' : 'bg-gray-200 opacity-60'}`}>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xl truncate">{camp.name}</div>
                  <div className="text-sm font-bold opacity-70">
                    %{camp.discount_percent} indirim â€¢ {camp.category_id ? categories.find(c => c.id === camp.category_id)?.name || 'SilinmiÅŸ Kategori' : 'TÃ¼m ÃœrÃ¼nler'}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => toggleCampaignActive(camp)} className={`px-4 py-2 border-2 border-admin-border font-bold text-sm transition-all active:scale-95 ${camp.is_active ? 'bg-admin-primary text-admin-primary-text' : 'bg-admin-surface text-admin-text'}`}>
                    {camp.is_active ? 'AKTÄ°F âœ“' : 'PASÄ°F'}
                  </button>
                  <button onClick={() => deleteCampaign(camp.id)} className="px-4 py-2 border-2 border-admin-border bg-red-100 text-red-700 font-bold text-sm hover:bg-red-200 transition-all active:scale-95">
                    SÄ°L
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
