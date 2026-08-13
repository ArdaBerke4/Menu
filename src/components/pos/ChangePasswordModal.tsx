import { useState } from 'react';
import { supabase } from '../../supabase';

interface ChangePasswordModalProps {
  staffId: string;
  onClose: () => void;
}

export function ChangePasswordModal({ staffId, onClose }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Yeni şifreler eşleşmiyor.");
      return;
    }
    if (newPassword.length < 4) {
      setError("Şifre en az 4 karakter olmalıdır.");
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await supabase.rpc('update_staff_password', {
      p_staff_id: staffId,
      p_old_password: oldPassword,
      p_new_password: newPassword
    });

    setLoading(false);

    if (error) {
      setError("Bir hata oluştu: " + error.message);
    } else if (data === false) {
      setError("Eski şifreniz yanlış.");
    } else {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4">
      <div className="bg-white border-4 border-brand-dark shadow-pixel max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-4 border-b-2 border-brand-dark/20 pb-2">
          <h2 className="text-xl font-bold uppercase">Şifre Değiştir</h2>
          <button onClick={onClose} className="text-2xl font-bold hover:opacity-50">&times;</button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <p className="text-5xl mb-4">✅</p>
            <p className="font-bold text-green-600 text-lg uppercase">Şifreniz güncellendi!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 font-bold text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block font-bold text-sm mb-1 uppercase">Mevcut Şifre</label>
              <input 
                type="password" 
                value={oldPassword} 
                onChange={e => setOldPassword(e.target.value)} 
                className="w-full px-3 py-2 border-2 border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand font-bold"
              />
            </div>
            
            <div>
              <label className="block font-bold text-sm mb-1 uppercase">Yeni Şifre</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                className="w-full px-3 py-2 border-2 border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-sm mb-1 uppercase">Yeni Şifre (Tekrar)</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                className="w-full px-3 py-2 border-2 border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand font-bold"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white font-bold uppercase py-3 border-2 border-brand-dark shadow-pixel-sm hover:translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'Kaydediliyor...' : 'Şifreyi Değiştir'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
