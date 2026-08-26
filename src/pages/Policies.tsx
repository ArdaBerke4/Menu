import { useNavigate } from 'react-router-dom';

export default function Policies() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-300 font-pixel">
      {/* Navbar */}
      <nav className="bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#222] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🍽️</span>
            <span className="text-xl font-bold tracking-wider uppercase bg-gradient-to-r from-[#C8A97E] to-[#E8D5B5] bg-clip-text text-transparent">QR Menü</span>
          </button>
          <button onClick={() => navigate(-1)} className="text-[#C8A97E] hover:text-[#E8D5B5] transition-colors text-sm font-bold uppercase">
            ← Geri Dön
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#C8A97E] to-[#E8D5B5] bg-clip-text text-transparent">Gizlilik & Çerez Politikası</span>
          </h1>
          <p className="text-gray-500 text-sm">Son güncelleme: 26 Ağustos 2026</p>
        </div>

        <div className="space-y-12 text-base leading-relaxed">
          
          {/* Giriş */}
          <section>
            <h2 className="text-2xl font-bold text-[#E8D5B5] mb-4 border-b border-[#333] pb-2">1. Giriş</h2>
            <p>
              QR Menü (“biz”, “bize” veya “bizim”) olarak, gizliliğinize saygı duyuyor ve kişisel verilerinizi korumayı taahhüt ediyoruz. 
              Bu politika, web sitemizi ziyaret ettiğinizde hangi bilgileri topladığımızı, nasıl kullandığımızı ve 
              haklarınızı açıklamaktadır.
            </p>
          </section>

          {/* Toplanan Veriler */}
          <section>
            <h2 className="text-2xl font-bold text-[#E8D5B5] mb-4 border-b border-[#333] pb-2">2. Toplanan Veriler</h2>
            <p className="mb-4">Aşağıdaki verileri toplayabiliriz:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-white">Hesap Bilgileri:</strong> E-posta adresi ve şifre (kayıt olduğunuzda)</li>
              <li><strong className="text-white">Restoran Bilgileri:</strong> Mekan adı, menü içeriği, ürün fiyatları</li>
              <li><strong className="text-white">Kullanım Verileri:</strong> Sayfa görüntülemeleri, tıklamalar, tercih edilen tema</li>
              <li><strong className="text-white">Teknik Veriler:</strong> Tarayıcı türü, işletim sistemi, IP adresi</li>
            </ul>
          </section>

          {/* Çerezler */}
          <section>
            <h2 className="text-2xl font-bold text-[#E8D5B5] mb-4 border-b border-[#333] pb-2">3. Çerezler (Cookies)</h2>
            <p className="mb-4">Web sitemiz aşağıdaki çerez türlerini kullanmaktadır:</p>
            
            <div className="space-y-4">
              <div className="bg-[#111] border border-[#333] p-4 rounded">
                <h3 className="font-bold text-[#C8A97E] mb-2">🟢 Zorunlu Çerezler</h3>
                <p className="text-sm">Oturum yönetimi ve kimlik doğrulama için gereklidir. Bu çerezler olmadan sisteme giriş yapamazsınız.</p>
                <div className="mt-2 text-xs text-gray-500">
                  <code className="bg-[#222] px-2 py-0.5 rounded">sb-access-token</code> • 
                  <code className="bg-[#222] px-2 py-0.5 rounded ml-1">sb-refresh-token</code>
                </div>
              </div>
              
              <div className="bg-[#111] border border-[#333] p-4 rounded">
                <h3 className="font-bold text-[#C8A97E] mb-2">🟡 Tercih Çerezleri</h3>
                <p className="text-sm">Seçtiğiniz temayı, dil tercihlerinizi ve diğer ayarlarınızı hatırlamak için kullanılır.</p>
                <div className="mt-2 text-xs text-gray-500">
                  <code className="bg-[#222] px-2 py-0.5 rounded">adminTheme</code> • 
                  <code className="bg-[#222] px-2 py-0.5 rounded ml-1">cookie-consent</code>
                </div>
              </div>

              <div className="bg-[#111] border border-[#333] p-4 rounded">
                <h3 className="font-bold text-[#C8A97E] mb-2">🔴 Analitik Çerezler</h3>
                <p className="text-sm">Web sitemizin nasıl kullanıldığını anlamamlzıza yardımcı olur. Bu çerezler isteğe bağlıdır ve reddedilebilir.</p>
              </div>
            </div>
          </section>

          {/* Verilerin Kullanımı */}
          <section>
            <h2 className="text-2xl font-bold text-[#E8D5B5] mb-4 border-b border-[#333] pb-2">4. Verilerin Kullanımı</h2>
            <p className="mb-4">Topladığımız verileri şu amaçlarla kullanırız:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Hizmetlerimizi sunmak ve yönetmek</li>
              <li>Hesabınızı oluşturmak ve güvenliğini sağlamak</li>
              <li>Menü ve sipariş yönetimi hizmetlerini sağlamak</li>
              <li>Kullanıcı deneyimini iyileştirmek</li>
              <li>Teknik sorunları teşhis etmek ve gidermek</li>
            </ul>
          </section>

          {/* Veri Güvenliği */}
          <section>
            <h2 className="text-2xl font-bold text-[#E8D5B5] mb-4 border-b border-[#333] pb-2">5. Veri Güvenliği</h2>
            <p>
              Verilerinizi korumak için endüstri standardı güvenlik önlemleri uygulamaktayız. 
              Şifreleriniz hashlenmiş olarak saklanır ve tüm veri transferleri SSL/TLS 
              şifreleme ile korunmaktadır. Veritabanımız Supabase altyapısı üzerinde 
              Row Level Security (RLS) politikaları ile güvence altına alınmıştır.
            </p>
          </section>

          {/* Üçüncü Taraflar */}
          <section>
            <h2 className="text-2xl font-bold text-[#E8D5B5] mb-4 border-b border-[#333] pb-2">6. Üçüncü Taraf Hizmetleri</h2>
            <p className="mb-4">Aşağıdaki üçüncü taraf hizmetlerini kullanmaktayız:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-white">Supabase:</strong> Kimlik doğrulama ve veritabanı hizmetleri</li>
              <li><strong className="text-white">Vercel:</strong> Web sitesi barındırma hizmetleri</li>
            </ul>
          </section>

          {/* Haklar */}
          <section>
            <h2 className="text-2xl font-bold text-[#E8D5B5] mb-4 border-b border-[#333] pb-2">7. Haklarınız</h2>
            <p className="mb-4">KVKK (6698 sayılı Kişisel Verilerin Korunması Kanunu) kapsamında aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
              <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Eksik veya yanlış işlenmiş kişisel verilerinizin düzeltilmesini isteme</li>
              <li>Kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
              <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
            </ul>
          </section>

          {/* Çerez Yönetimi */}
          <section>
            <h2 className="text-2xl font-bold text-[#E8D5B5] mb-4 border-b border-[#333] pb-2">8. Çerez Yönetimi</h2>
            <p className="mb-4">
              Çerezleri tarayıcınızın ayarlarından yönetebilirsiniz. Zorunlu çerezleri devre dışı bırakmanız 
              halinde bazı özellikler çalışmayabilir. Çerez tercihlerinizi sıfırlamak için:
            </p>
            <button 
              onClick={() => { localStorage.removeItem('cookie-consent'); window.location.reload(); }}
              className="px-6 py-3 bg-[#111] border border-[#C8A97E] text-[#C8A97E] font-bold uppercase text-sm hover:bg-[#C8A97E] hover:text-[#0A0A0A] transition-all"
            >
              Çerez Tercihlerini Sıfırla
            </button>
          </section>

          {/* İletişim */}
          <section>
            <h2 className="text-2xl font-bold text-[#E8D5B5] mb-4 border-b border-[#333] pb-2">9. İletişim</h2>
            <p>
              Bu politika hakkında sorularınız veya talepleriniz için bizimle iletişime geçebilirsiniz.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-[#222] text-center text-gray-500 text-sm">
          <p>© 2026 QR Menü. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  );
}
