import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface font-pixel text-ink">
      
      {/* Basit Navbar */}
      <nav className="border-b-4 border-brand-dark bg-[#F4E4C1]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-brand-dark tracking-wider uppercase">QR Menü</span>
          <button onClick={() => navigate('/auth')} className="px-5 py-2 bg-brand-dark text-[#F4E4C1] border-2 border-brand-dark font-bold uppercase text-sm tracking-wider hover:bg-black transition-colors shadow-pixel-sm">
            Giriş Yap
          </button>
        </div>
      </nav>

      {/* Hero - Samimi ve Direkt */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-brand-dark leading-tight">
            Kendi menünü<br />dijitale taşı.
          </h1>
          <p className="text-xl md:text-2xl text-brand mb-10 max-w-xl mx-auto leading-relaxed">
            Kafe veya restoranın için QR kodlu dijital menü oluştur, 
            siparişleri takip et, kampanyalar düzenle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/auth')} className="px-8 py-4 bg-brand text-surface border-4 border-brand-dark text-xl font-bold uppercase shadow-pixel hover:bg-brand-dark hover:text-[#F4E4C1] transition-colors active:translate-y-1 active:shadow-none">
              Hemen Başla →
            </button>
            <button onClick={() => document.getElementById('nasil')?.scrollIntoView({behavior: 'smooth'})} className="px-8 py-4 bg-[#F4E4C1] text-brand-dark border-4 border-brand-dark text-xl font-bold uppercase shadow-pixel hover:bg-brand-light transition-colors active:translate-y-1 active:shadow-none">
              Nasıl Çalışır?
            </button>
          </div>
        </div>
      </section>

      {/* Ne Yapabilirsin? - Basit Liste */}
      <section className="py-16 px-6 bg-[#F4E4C1] border-y-4 border-brand-dark">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-10 text-center uppercase">Ne yapabilirsin?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface border-4 border-brand-dark p-6 shadow-pixel">
              <h3 className="text-xl font-bold text-brand-dark mb-2">Menü Yönetimi</h3>
              <p className="text-brand">Kategoriler oluştur, ürünleri ekle, fiyatları güncelle. Sürükle-bırak ile sırala.</p>
            </div>
            <div className="bg-surface border-4 border-brand-dark p-6 shadow-pixel">
              <h3 className="text-xl font-bold text-brand-dark mb-2">QR Kod</h3>
              <p className="text-brand">Otomatik QR kod oluştur, rengini özelleştir, masalara koy. Müşteriler okutup menüye ulaşsın.</p>
            </div>
            <div className="bg-surface border-4 border-brand-dark p-6 shadow-pixel">
              <h3 className="text-xl font-bold text-brand-dark mb-2">Sipariş Takibi</h3>
              <p className="text-brand">Masa bazlı siparişleri gör, garson çağırma ve hesap isteme bildirimlerini al.</p>
            </div>
            <div className="bg-surface border-4 border-brand-dark p-6 shadow-pixel">
              <h3 className="text-xl font-bold text-brand-dark mb-2">Kampanyalar</h3>
              <p className="text-brand">İndirim kampanyaları tanımla, kategoriye özel indirimler oluştur.</p>
            </div>
            <div className="bg-surface border-4 border-brand-dark p-6 shadow-pixel">
              <h3 className="text-xl font-bold text-brand-dark mb-2">Personel Yönetimi</h3>
              <p className="text-brand">Garson ve şef hesapları aç, rollere göre yetkilendir.</p>
            </div>
            <div className="bg-surface border-4 border-brand-dark p-6 shadow-pixel">
              <h3 className="text-xl font-bold text-brand-dark mb-2">Tema Seçenekleri</h3>
              <p className="text-brand">6 farklı tema: Klasik, Gece, Nord, Dracula, Modern ve daha fazlası.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Nasıl Çalışır */}
      <section id="nasil" className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-12 text-center uppercase">3 Adımda Hazır</h2>
          
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="flex items-start gap-6">
              <div className="shrink-0 w-14 h-14 bg-brand text-surface border-4 border-brand-dark flex items-center justify-center text-2xl font-bold shadow-pixel-sm">1</div>
              <div>
                <h3 className="text-xl font-bold text-brand-dark mb-1">Hesap aç</h3>
                <p className="text-brand">E-posta ve şifre ile kayıt ol, mekanını ekle. 2 dakika sürer.</p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="shrink-0 w-14 h-14 bg-brand text-surface border-4 border-brand-dark flex items-center justify-center text-2xl font-bold shadow-pixel-sm">2</div>
              <div>
                <h3 className="text-xl font-bold text-brand-dark mb-1">Menüyü düzenle</h3>
                <p className="text-brand">Kategorileri ve ürünleri ekle, fiyatları gir, fotoğraf yükle.</p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="shrink-0 w-14 h-14 bg-brand text-surface border-4 border-brand-dark flex items-center justify-center text-2xl font-bold shadow-pixel-sm">3</div>
              <div>
                <h3 className="text-xl font-bold text-brand-dark mb-1">QR kodu paylaş</h3>
                <p className="text-brand">Sistem otomatik QR kod oluşturur. Yazdır, masalara koy, bitti.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ekran Görüntüsü Alanı */}
      <section className="py-16 px-6 bg-[#F4E4C1] border-y-4 border-brand-dark">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4 uppercase">Yönetim Paneli</h2>
          <p className="text-brand text-lg mb-10">Her şeyi tek yerden yönet: menü, siparişler, personel, kampanyalar.</p>
          
          {/* Mock Panel */}
          <div className="bg-surface border-4 border-brand-dark shadow-pixel p-6 text-left max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-4 border-brand-dark">
              <span className="font-bold text-brand-dark text-lg">KADI KÖY KAFE</span>
              <span className="ml-auto text-sm text-brand bg-brand-light px-3 py-1 border-2 border-brand-dark">← Tüm Mekanlarıma Dön</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-[#F4E4C1] border-2 border-brand-dark p-3 text-center">
                <div className="text-sm text-brand">Envanter</div>
                <div className="text-xl font-bold text-brand-dark">48</div>
              </div>
              <div className="bg-[#F4E4C1] border-2 border-brand-dark p-3 text-center">
                <div className="text-sm text-brand">Kampanya</div>
                <div className="text-xl font-bold text-brand-dark">3</div>
              </div>
              <div className="bg-[#F4E4C1] border-2 border-brand-dark p-3 text-center">
                <div className="text-sm text-brand">Sipariş</div>
                <div className="text-xl font-bold text-brand-dark">127</div>
              </div>
              <div className="bg-[#F4E4C1] border-2 border-brand-dark p-3 text-center">
                <div className="text-sm text-brand">Personel</div>
                <div className="text-xl font-bold text-brand-dark">5</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-[#F4E4C1] px-4 py-2 border-2 border-brand-dark">
                <span className="font-bold">Sıcak İçecekler</span><span className="text-brand">12 ürün</span>
              </div>
              <div className="flex justify-between items-center bg-[#F4E4C1] px-4 py-2 border-2 border-brand-dark">
                <span className="font-bold">Soğuk İçecekler</span><span className="text-brand">8 ürün</span>
              </div>
              <div className="flex justify-between items-center bg-[#F4E4C1] px-4 py-2 border-2 border-brand-dark">
                <span className="font-bold">Tatlılar</span><span className="text-brand">6 ürün</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">Denemek ücretsiz.</h2>
          <p className="text-xl text-brand mb-8">Hesap aç, mekanını ekle, menünü oluştur.</p>
          <button onClick={() => navigate('/auth')} className="px-10 py-4 bg-brand-dark text-[#F4E4C1] border-4 border-brand-dark text-2xl font-bold uppercase shadow-pixel hover:bg-black transition-colors active:translate-y-1 active:shadow-none">
            Giriş Yap / Kayıt Ol
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t-4 border-brand-dark bg-[#F4E4C1]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-lg font-bold text-brand-dark">QR Menü</span>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/policies')} className="text-brand text-sm hover:text-brand-dark transition-colors underline">Gizlilik & Çerez Politikası</button>
            <span className="text-brand text-sm">© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
