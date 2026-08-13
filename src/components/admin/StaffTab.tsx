import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import type { StaffAccount, Restaurant } from '../../types/admin';

interface StaffTabProps {
  restaurant: Restaurant;
}

export default function StaffTab({ restaurant }: StaffTabProps) {
  const [staff, setStaff] = useState<StaffAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'waiter' | 'chef'>('waiter');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStaff();
  }, [restaurant.id]);

  const fetchStaff = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('staff_accounts')
      .select('id, restaurant_id, username, role, created_at')
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setStaff(data as StaffAccount[]);
    }
    setLoading(false);
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      setError("Kullanıcı adı ve şifre zorunludur.");
      return;
    }
    
    setError(null);
    const { error } = await supabase.rpc('create_staff_account', {
      p_restaurant_id: restaurant.id,
      p_username: newUsername,
      p_password: newPassword,
      p_role: newRole
    });

    if (error) {
      if (error.message.includes('unique constraint')) {
        setError("Bu kullanıcı adı zaten kullanılıyor.");
      } else {
        setError(error.message);
      }
    } else {
      setIsAdding(false);
      setNewUsername('');
      setNewPassword('');
      fetchStaff();
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm("Bu personeli silmek istediğinize emin misiniz?")) return;
    
    const { error } = await supabase.rpc('delete_staff_account', {
      p_staff_id: id,
      p_restaurant_id: restaurant.id
    });

    if (!error) {
      fetchStaff();
    } else {
      alert("Silinirken bir hata oluştu: " + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold uppercase mb-2">Personel Yönetimi</h1>
          <p className="text-lg text-admin-text/60 font-bold">Garson ve Şeflerin sisteme girebilmesi için hesap oluşturun.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-brand text-surface px-4 py-2 font-bold uppercase border-4 border-admin-border shadow-admin-pixel hover:translate-y-1 hover:shadow-admin-pixel-sm transition-all"
        >
          {isAdding ? 'Vazgeç' : '+ Yeni Personel'}
        </button>
      </header>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 font-bold">
          {error}
        </div>
      )}

      {isAdding && (
        <div className="bg-admin-bg border-4 border-admin-border shadow-admin-pixel p-6">
          <h2 className="text-xl font-bold mb-4 border-b-2 border-admin-border pb-2">Yeni Personel Ekle</h2>
          <form onSubmit={handleAddStaff} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold mb-2">Kullanıcı Adı</label>
                <input 
                  type="text" 
                  value={newUsername} 
                  onChange={e => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} 
                  placeholder="AhmetG" 
                  className="w-full px-4 py-2 border-2 border-admin-border bg-admin-surface focus:outline-none focus:ring-2 focus:ring-brand"
                  maxLength={20}
                />
                <p className="text-xs mt-1 opacity-70">Sadece küçük harf ve rakam</p>
              </div>
              <div>
                <label className="block font-bold mb-2">Şifre</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  placeholder="Gizli şifre" 
                  className="w-full px-4 py-2 border-2 border-admin-border bg-admin-surface focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block font-bold mb-2">Rolü</label>
                <select 
                  value={newRole} 
                  onChange={e => setNewRole(e.target.value as 'waiter' | 'chef')}
                  className="w-full px-4 py-2 border-2 border-admin-border bg-admin-surface focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="waiter">Garson (Sipariş & Masa)</option>
                  <option value="chef">Şef (Mutfak Ekranı)</option>
                </select>
              </div>
            </div>
            <button type="submit" className="bg-brand text-surface px-6 py-2 font-bold uppercase border-4 border-admin-border shadow-admin-pixel hover:translate-y-1 hover:shadow-admin-pixel-sm transition-all mt-4 w-full md:w-auto">
              Kaydet
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 font-bold">Yükleniyor...</div>
      ) : (
        <div className="bg-admin-bg border-4 border-admin-border shadow-admin-pixel overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-admin-surface border-b-4 border-admin-border">
              <tr>
                <th className="p-4 font-bold uppercase">Kullanıcı Adı</th>
                <th className="p-4 font-bold uppercase">Rol</th>
                <th className="p-4 font-bold uppercase">Eklenme Tarihi</th>
                <th className="p-4 font-bold uppercase text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center opacity-70 font-bold">Hiç personel hesabı bulunmuyor.</td>
                </tr>
              ) : (
                staff.map(member => (
                  <tr key={member.id} className="border-b-2 border-admin-border/50 last:border-0 hover:bg-admin-surface/50">
                    <td className="p-4 font-bold">{member.username}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold uppercase border-2 border-black ${member.role === 'chef' ? 'bg-orange-300' : 'bg-blue-300'}`}>
                        {member.role === 'chef' ? 'Şef' : 'Garson'}
                      </span>
                    </td>
                    <td className="p-4 opacity-80">{new Date(member.created_at).toLocaleDateString('tr-TR')}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDeleteStaff(member.id)}
                        className="text-red-500 font-bold hover:underline"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
