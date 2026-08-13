import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { getStaffToken, setStaffSession } from '../utils/auth';

export default function StaffLogin() {
  const { restaurantId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [error, setError] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const role = searchParams.get('role');
    const token = searchParams.get('token');
    
    if (!restaurantId || !role || !token) {
      navigate('/auth');
      return;
    }

    const currentToken = getStaffToken(restaurantId);
    const prevToken = getStaffToken(restaurantId, -1);
    const nextToken = getStaffToken(restaurantId, 1);

    if (token !== currentToken && token !== prevToken && token !== nextToken) {
      setError("Bağlantı süresi dolmuş veya geçersiz. Lütfen QR kodu tekrar okutun.");
      setIsLoading(false);
      return;
    }

    const checkRestaurant = async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', restaurantId)
        .single();

      if (error || !data) {
        setError("Böyle bir restoran bulunamadı.");
      } else {
        setIsTokenValid(true);
      }
      setIsLoading(false);
    };

    checkRestaurant();
  }, [restaurantId, searchParams, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setLoginError("Lütfen kullanıcı adı ve şifre girin.");
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);

    const { data, error } = await supabase.rpc('verify_staff_login', {
      p_restaurant_id: restaurantId,
      p_username: username.toLowerCase(),
      p_password: password
    });

    setIsLoggingIn(false);

    if (error) {
      setLoginError("Giriş yapılırken bir hata oluştu: " + error.message);
      return;
    }

    // verify_staff_login returns a table, but since we expect one row, data should be an array with 1 object
    const result = data && data.length > 0 ? data[0] : null;

    if (result && result.success) {
      // Oturumu kaydet
      setStaffSession(restaurantId as string, result.id, result.role);
      
      // QR koddan gelen role (garson QR'ı vs) bakmaksızın, DB'deki gerçek role göre işlem yap
      // Ama eğer Waiter QR'ı okutup Chef hesabıyla giriyorsa uyarı verebiliriz veya direkt yönlendirebiliriz.
      // Şimdilik direkt yönlendiriyoruz.
      navigate(`/pos/${restaurantId}`);
    } else {
      setLoginError("Kullanıcı adı veya şifre hatalı.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface font-pixel flex flex-col items-center justify-center p-4 text-center">
        <div className="animate-pulse">
          <p className="text-6xl mb-4">⏳</p>
          <h2 className="text-2xl font-bold text-brand-dark">Link Doğrulanıyor...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface font-pixel flex flex-col items-center justify-center p-4 text-center">
        <p className="text-6xl mb-4">❌</p>
        <h2 className="text-2xl font-bold text-red-600 mb-2">GİRİŞ BAŞARISIZ</h2>
        <p className="text-lg text-brand-dark/70 font-bold">{error}</p>
      </div>
    );
  }

  if (isTokenValid) {
    return (
      <div className="min-h-screen bg-surface font-pixel flex flex-col items-center justify-center p-4">
        <div className="bg-white border-4 border-brand-dark shadow-pixel p-8 max-w-sm w-full">
          <div className="text-center mb-6">
            <p className="text-6xl mb-4">🔐</p>
            <h2 className="text-2xl font-bold text-brand-dark uppercase">Personel Girişi</h2>
            <p className="text-sm opacity-70 font-bold mt-2">Lütfen size verilen bilgilerle giriş yapın.</p>
          </div>

          {loginError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 font-bold text-sm">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-bold mb-2 uppercase text-sm">Kullanıcı Adı</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-brand-dark bg-surface focus:outline-none focus:ring-2 focus:ring-brand font-bold"
                placeholder="Örn: ahmetg"
                autoCapitalize="none"
              />
            </div>
            <div>
              <label className="block font-bold mb-2 uppercase text-sm">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-brand-dark bg-surface focus:outline-none focus:ring-2 focus:ring-brand font-bold"
                placeholder="••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-brand text-surface px-6 py-4 font-bold uppercase border-4 border-brand-dark shadow-pixel hover:translate-y-1 hover:shadow-pixel-sm transition-all mt-4 disabled:opacity-50"
            >
              {isLoggingIn ? 'Giriş Yapılıyor...' : 'GİRİŞ YAP'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
}
