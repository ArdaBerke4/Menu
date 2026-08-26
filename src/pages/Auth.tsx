import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [view, setView] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Captcha States
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [userCaptcha, setUserCaptcha] = useState('');
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const generateCaptcha = () => {
    setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
    setUserCaptcha('');
  };

  useEffect(() => {
    generateCaptcha();
  }, [view]);

  const toggleView = (newView: 'login' | 'register' | 'forgot-password') => {
    setView(newView);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setMessage(null);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setMessage({text: "Lütfen geçerli bir e-posta adresi girin.", type: 'error'});
      return;
    }

    if (view === 'register' && password !== confirmPassword) {
      setMessage({text: "Şifreler eşleşmiyor, lütfen kontrol edin.", type: 'error'});
      return;
    }

    // Captcha Check
    if ((view === 'register' || view === 'forgot-password') && parseInt(userCaptcha) !== (captchaNum1 + captchaNum2)) {
      setMessage({text: "Güvenlik sorusunu yanlış cevapladınız. Lütfen tekrar deneyin.", type: 'error'});
      generateCaptcha();
      return;
    }

    setLoading(true);
    setMessage(null);

    if (view === 'register') {
      const { error } = await supabase.auth.signUp({ email: cleanEmail, password });
      if (error) {
        setMessage({text: "Kayıt hatası: " + error.message, type: 'error'});
        generateCaptcha();
      }
      else setMessage({text: "Kayıt başarılı! Şimdi giriş yapabilirsiniz.", type: 'success'});
    } else if (view === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error) setMessage({text: "Giriş hatası: " + (error.message === 'Failed to fetch' ? 'Sunucuya ulaşılamıyor.' : error.message), type: 'error'});
      else navigate('/admin');
    } else if (view === 'forgot-password') {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin + '/reset-password'
      });
      if (error) {
         setMessage({text: "Hata: " + error.message, type: 'error'});
         generateCaptcha();
      }
      else setMessage({text: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi! Lütfen gelen kutunuzu kontrol edin.", type: 'success'});
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center font-pixel text-ink text-xl p-4 animate-fade-in">
      <div className="w-full max-w-md bg-[#F4E4C1] border-4 border-brand-dark shadow-pixel p-6 animate-page-enter">
        <h2 className="text-3xl font-bold text-center text-brand-dark uppercase border-b-4 border-brand-dark pb-3 mb-6">
          {view === 'register' ? 'Yeni Hesap Oluştur' : view === 'forgot-password' ? 'Şifremi Unuttum' : 'Mekan Sahibi Girişi'}
        </h2>

        {message && (
          <div className={`mb-4 p-3 border-2 font-bold text-center animate-fade-in ${message.type === 'error' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-[#e2f1e1] border-[#5b7a57] text-[#5b7a57]'}`}>
            {message.text}
          </div>
        )}

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

          {view !== 'forgot-password' && (
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
          )}

          {view === 'register' && (
            <div>
              <label className="block font-bold mb-1">ŞİFRE (TEKRAR)</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="******"
                className="w-full px-4 py-2 border-2 border-brand-dark bg-white focus:outline-none"
              />
            </div>
          )}

          {/* CAPTCHA SECTION */}
          {(view === 'register' || view === 'forgot-password') && (
            <div className="bg-[#e2d3af] p-3 border-2 border-brand-dark">
              <label className="block font-bold mb-1 text-brand-dark flex items-center justify-between">
                <span>GÜVENLİK KONTROLÜ</span>
                <span className="text-sm cursor-pointer hover:text-black" onClick={generateCaptcha}>🔄 YENİLE</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="bg-white border-2 border-brand-dark px-3 py-2 font-bold text-xl min-w-[80px] text-center shrink-0">
                  {captchaNum1} + {captchaNum2} =
                </div>
                <input
                  type="number"
                  required
                  value={userCaptcha}
                  onChange={(e) => setUserCaptcha(e.target.value)}
                  placeholder="?"
                  className="w-full px-4 py-2 border-2 border-brand-dark bg-white focus:outline-none font-bold text-center"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-surface border-2 border-brand-dark px-6 py-3 text-2xl shadow-pixel active:translate-y-1 active:shadow-none transition-all uppercase mt-6"
          >
            {loading ? 'BEKLEYİN...' : view === 'register' ? 'KAYIT OL' : view === 'forgot-password' ? 'BAĞLANTI GÖNDER' : 'GİRİŞ YAP'}
          </button>
        </form>

        <div className="text-center text-lg mt-6 text-brand-dark font-bold flex flex-col gap-2">
          {view === 'login' ? (
            <>
              <div>
                <button onClick={() => toggleView('forgot-password')} type="button" className="text-brand underline hover:text-brand-dark focus:outline-none">Şifremi Unuttum</button>
              </div>
              <div>
                <span>Henüz mekanını kaydetmedin mi?</span>
                <button onClick={() => toggleView('register')} type="button" className="ml-2 text-brand underline hover:text-brand-dark focus:outline-none">Kayıt Ol</button>
              </div>
            </>
          ) : (
            <div>
              <span>{view === 'register' ? 'Zaten hesabın var mı?' : 'Giriş ekranına dön:'}</span>
              <button onClick={() => toggleView('login')} type="button" className="ml-2 text-brand underline hover:text-brand-dark focus:outline-none">Giriş Yap</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
