import { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isRegister, setIsRegister] = useState(false); // Giriş mi kayıt mı kontrolü
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isRegister) {
      // Kayıt Olma İşlemi
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert("Kayıt hatası: " + error.message);
      else alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
    } else {
      // Giriş Yapma İşlemi
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert("Giriş hatası: " + error.message);
      else navigate('/admin'); // Başarılıysa doğrudan panele fırlat
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center font-pixel text-ink text-xl p-4">
      <div className="w-full max-w-md bg-[#F4E4C1] border-4 border-brand-dark shadow-pixel p-6">
        <h2 className="text-3xl font-bold text-center text-brand-dark uppercase border-b-4 border-brand-dark pb-3 mb-6">
          {isRegister ? 'Yeni Hesap Oluştur' : 'Mekan Sahibi Girişi'}
        </h2>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block font-bold mb-1">E-POSTA</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="macera@kafe.com"
              className="w-full px-4 py-2 border-2 border-brand-dark bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">ŞİFRE</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              className="w-full px-4 py-2 border-2 border-brand-dark bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-surface border-2 border-brand-dark px-6 py-3 text-2xl shadow-pixel active:translate-y-1 active:shadow-none transition-all uppercase mt-6"
          >
            {loading ? 'BEKLEYİN...' : isRegister ? 'KAYIT OL' : 'GİRİŞ YAP'}
          </button>
        </form>

        <p className="text-center text-lg mt-6 text-brand-dark font-bold">
          {isRegister ? 'Zaten hesabın var mı?' : 'Henüz mekanını kaydetmedin mi?'}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="ml-2 text-brand underline hover:text-brand-dark focus:outline-none"
          >
            {isRegister ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </p>
      </div>
    </div>
  );
}