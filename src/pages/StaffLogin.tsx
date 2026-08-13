import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { getStaffToken } from '../utils/auth';

export default function StaffLogin() {
  const { restaurantId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

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
      navigate('/auth');
      return;
    }

    if (role !== 'waiter' && role !== 'chef') {
      navigate('/auth');
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
        // Rolü localStorage'a kaydet (restoran bazlı)
        localStorage.setItem(`staff_role_${restaurantId}`, role);
        // Doğrudan yönetim paneline yönlendir
        navigate(`/pos/${restaurantId}`);
      }
    };

    checkRestaurant();
  }, [restaurantId, searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-surface font-pixel flex flex-col items-center justify-center p-4 text-center">
        <p className="text-6xl mb-4">❌</p>
        <h2 className="text-2xl font-bold text-red-600 mb-2">HATA</h2>
        <p className="text-lg text-brand-dark/70 font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-pixel flex flex-col items-center justify-center p-4 text-center">
      <div className="animate-pulse">
        <p className="text-6xl mb-4">🔐</p>
        <h2 className="text-2xl font-bold text-brand-dark">Giriş Yapılıyor...</h2>
        <p className="text-brand-dark/50 font-bold mt-2">Sisteme bağlanıyorsunuz, lütfen bekleyin.</p>
      </div>
    </div>
  );
}
