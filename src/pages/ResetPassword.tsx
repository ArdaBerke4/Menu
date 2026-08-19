import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have an active session (Supabase handles parsing the hash from the recovery email)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setMessage({ text: 'Geçersiz veya süresi dolmuş bağlantı. Lütfen tekrar şifre sıfırlama talebinde bulunun.', type: 'error' });
      }
    });

    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Successfully exchanged recovery token
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (password !== confirmPassword) {
      setMessage({ text: 'Şifreler eşleşmiyor.', type: 'error' });
      return;
    }
    if (password.length < 6) {
      setMessage({ text: 'Şifre en az 6 karakter olmalıdır.', type: 'error' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMessage({ text: 'Hata: ' + error.message, type: 'error' });
    } else {
      setMessage({ text: 'Şifreniz başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz...', type: 'success' });
      setTimeout(() => navigate('/auth'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 font-pixel">
      <div className="bg-[#F4E4C1] max-w-md w-full p-8 border-4 border-brand-dark shadow-pixel animate-fade-in">
        <h1 className="text-3xl font-bold mb-6 text-center text-brand-dark uppercase">Şifre Sıfırlama</h1>
        
        {message && (
          <div className={`mb-6 p-4 border-2 font-bold text-center ${message.type === 'success' ? 'bg-[#e2f1e1] border-[#5b7a57] text-[#5b7a57]' : 'bg-[#f1e1e1] border-[#7a5757] text-[#7a5757]'}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <label className="block font-bold mb-2">Yeni Şifre</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-brand-dark bg-white focus:outline-none"
              placeholder="••••••"
            />
          </div>
          <div>
            <label className="block font-bold mb-2">Yeni Şifre (Tekrar)</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-brand-dark bg-white focus:outline-none"
              placeholder="••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-surface border-2 border-brand-dark px-4 py-3 text-xl font-bold uppercase hover:opacity-90 transition-opacity shadow-pixel disabled:opacity-50"
          >
            {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </button>
        </form>
      </div>
    </div>
  );
}
