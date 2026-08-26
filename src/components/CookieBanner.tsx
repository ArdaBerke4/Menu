import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Küçük bir gecikmeyle göster (sayfa yüklendikten sonra)
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] animate-slide-up">
      <div className="bg-[#1A1A1A] border-t-2 border-[#C8A97E]/30 px-6 py-5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 text-center md:text-left">
            <p className="text-gray-300 text-sm font-pixel leading-relaxed">
              🍪 Bu web sitesi, deneyiminizi iyileştirmek için çerezler kullanmaktadır. 
              Siteyi kullanmaya devam ederek çerez politikamızı kabul etmiş olursunuz.{' '}
              <button 
                onClick={() => navigate('/policies')} 
                className="text-[#C8A97E] underline hover:text-[#E8D5B5] transition-colors"
              >
                Daha fazla bilgi
              </button>
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleReject}
              className="px-5 py-2 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-all text-sm font-pixel font-bold uppercase tracking-wider"
            >
              Reddet
            </button>
            <button
              onClick={handleAccept}
              className="px-5 py-2 bg-[#C8A97E] text-[#0A0A0A] border border-[#C8A97E] hover:bg-[#E8D5B5] transition-all text-sm font-pixel font-bold uppercase tracking-wider"
            >
              Kabul Et
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
