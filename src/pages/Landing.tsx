import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Boxes } from '../components/ui/background-boxes';
import { Warp } from '@paper-design/shaders-react';

/* ---- Mini preview components for each feature card ---- */
function PreviewQR() {
  return (
    <div className="bg-[#F4E4C1] p-4 text-[#4A3728] text-xs rounded">
      <div className="text-center font-bold text-sm mb-2 border-b border-[#4A3728] pb-1">☕ KADIKÖY KAFE</div>
      <div className="flex gap-2 mb-2 justify-center">
        <span className="bg-[#8fb38a] text-white px-2 py-0.5 text-[10px] font-bold">Sıcak</span>
        <span className="bg-white border border-[#4A3728] px-2 py-0.5 text-[10px]">Soğuk</span>
        <span className="bg-white border border-[#4A3728] px-2 py-0.5 text-[10px]">Tatlı</span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between bg-white p-1.5 border border-[#4A3728]"><span>Espresso</span><span className="font-bold">95 ₺</span></div>
        <div className="flex justify-between bg-white p-1.5 border border-[#4A3728]"><span>Latte</span><span className="font-bold">145 ₺</span></div>
        <div className="flex justify-between bg-white p-1.5 border border-[#4A3728]"><span>Cappuccino</span><span className="font-bold">140 ₺</span></div>
      </div>
    </div>
  );
}

function PreviewThemes() {
  return (
    <div className="space-y-2 text-xs">
      <div className="flex gap-1.5">
        <div className="flex-1 bg-[#F4E4C1] border border-[#4A3728] p-2 text-[#4A3728] text-center rounded">
          <div className="w-full h-1.5 bg-[#8fb38a] rounded mb-1"></div>Klasik
        </div>
        <div className="flex-1 bg-[#0A0A0A] border border-[#333] p-2 text-white text-center rounded">
          <div className="w-full h-1.5 bg-[#EDEDED] rounded mb-1"></div>Gece
        </div>
      </div>
      <div className="flex gap-1.5">
        <div className="flex-1 bg-[#2E3440] border border-[#4C566A] p-2 text-[#ECEFF4] text-center rounded">
          <div className="w-full h-1.5 bg-[#88C0D0] rounded mb-1"></div>Nord
        </div>
        <div className="flex-1 bg-[#282A36] border border-[#6272A4] p-2 text-[#F8F8F2] text-center rounded">
          <div className="w-full h-1.5 bg-[#BD93F9] rounded mb-1"></div>Dracula
        </div>
      </div>
      <div className="flex gap-1.5">
        <div className="flex-1 bg-[#F9FAFB] border border-[#E5E7EB] p-2 text-[#111827] text-center rounded">
          <div className="w-full h-1.5 bg-[#111827] rounded mb-1"></div>Modern
        </div>
        <div className="flex-1 bg-[#F4E4C1] border-2 border-dashed border-[#C8A97E] p-2 text-[#4A3728] text-center rounded">
          <div className="w-full h-1.5 bg-[#C8A97E] rounded mb-1"></div>Bej
        </div>
      </div>
    </div>
  );
}

function PreviewOrders() {
  return (
    <div className="text-xs space-y-1.5">
      <div className="grid grid-cols-3 gap-1">
        <div className="bg-green-900/50 border border-green-700 p-2 rounded text-center">
          <div className="font-bold text-green-400">Masa 1</div>
          <div className="text-green-300 text-[10px]">✓ Ödendi</div>
        </div>
        <div className="bg-yellow-900/50 border border-yellow-700 p-2 rounded text-center">
          <div className="font-bold text-yellow-400">Masa 2</div>
          <div className="text-yellow-300 text-[10px]">⏳ Bekliyor</div>
        </div>
        <div className="bg-red-900/50 border border-red-700 p-2 rounded text-center">
          <div className="font-bold text-red-400">Masa 3</div>
          <div className="text-red-300 text-[10px]">🔔 Garson</div>
        </div>
      </div>
      <div className="bg-[#1A1A1A] border border-[#333] p-2 rounded">
        <div className="text-gray-400 mb-1">Masa 2 — Sipariş:</div>
        <div className="text-white">2x Latte, 1x Cheesecake</div>
        <div className="text-[#C8A97E] font-bold mt-1">Toplam: 430 ₺</div>
      </div>
    </div>
  );
}

function PreviewCampaigns() {
  return (
    <div className="text-xs space-y-1.5">
      <div className="bg-gradient-to-r from-[#8fb38a]/20 to-transparent border border-[#8fb38a] p-2 rounded flex justify-between items-center">
        <div>
          <div className="font-bold text-[#8fb38a]">🏷️ Öğle İndirimi</div>
          <div className="text-gray-400">Tüm menü</div>
        </div>
        <div className="text-xl font-bold text-[#8fb38a]">%20</div>
      </div>
      <div className="bg-gradient-to-r from-[#C8A97E]/20 to-transparent border border-[#C8A97E] p-2 rounded flex justify-between items-center">
        <div>
          <div className="font-bold text-[#C8A97E]">☕ Kahve Kampanyası</div>
          <div className="text-gray-400">Sıcak İçecekler</div>
        </div>
        <div className="text-xl font-bold text-[#C8A97E]">%15</div>
      </div>
      <div className="bg-gradient-to-r from-[#88C0D0]/20 to-transparent border border-[#88C0D0] p-2 rounded flex justify-between items-center">
        <div>
          <div className="font-bold text-[#88C0D0]">🎂 Doğum Günü</div>
          <div className="text-gray-400">Tatlılar</div>
        </div>
        <div className="text-xl font-bold text-[#88C0D0]">%30</div>
      </div>
    </div>
  );
}

function PreviewStaff() {
  return (
    <div className="text-xs space-y-1.5">
      <div className="bg-[#1A1A1A] border border-[#333] p-2 rounded flex items-center gap-2">
        <div className="w-8 h-8 bg-[#C8A97E] rounded-full flex items-center justify-center text-black font-bold">AY</div>
        <div className="flex-1">
          <div className="font-bold text-white">Ahmet Yılmaz</div>
          <div className="text-gray-400">Garson</div>
        </div>
        <span className="bg-green-900/50 text-green-400 px-2 py-0.5 rounded text-[10px]">Aktif</span>
      </div>
      <div className="bg-[#1A1A1A] border border-[#333] p-2 rounded flex items-center gap-2">
        <div className="w-8 h-8 bg-[#8fb38a] rounded-full flex items-center justify-center text-black font-bold">EK</div>
        <div className="flex-1">
          <div className="font-bold text-white">Elif Kara</div>
          <div className="text-gray-400">Şef</div>
        </div>
        <span className="bg-green-900/50 text-green-400 px-2 py-0.5 rounded text-[10px]">Aktif</span>
      </div>
      <div className="bg-[#1A1A1A] border border-[#333] p-2 rounded flex items-center gap-2">
        <div className="w-8 h-8 bg-[#88C0D0] rounded-full flex items-center justify-center text-black font-bold">MD</div>
        <div className="flex-1">
          <div className="font-bold text-white">Mehmet Demir</div>
          <div className="text-gray-400">Garson</div>
        </div>
        <span className="bg-gray-700 text-gray-400 px-2 py-0.5 rounded text-[10px]">Pasif</span>
      </div>
    </div>
  );
}

function PreviewStats() {
  return (
    <div className="text-xs space-y-2">
      <div className="grid grid-cols-2 gap-1.5">
        <div className="bg-[#1A1A1A] border border-[#333] p-2 rounded">
          <div className="text-gray-500 text-[10px]">Bugün</div>
          <div className="text-lg font-bold text-[#C8A97E]">₺12.450</div>
        </div>
        <div className="bg-[#1A1A1A] border border-[#333] p-2 rounded">
          <div className="text-gray-500 text-[10px]">Sipariş</div>
          <div className="text-lg font-bold text-[#8fb38a]">127</div>
        </div>
      </div>
      <div className="bg-[#1A1A1A] border border-[#333] p-2 rounded">
        <div className="text-gray-500 text-[10px] mb-1">En Çok Satan</div>
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <div className="flex-1 bg-[#222] rounded-full h-2"><div className="bg-[#C8A97E] h-2 rounded-full" style={{width:'90%'}}></div></div>
            <span className="text-gray-300 w-14 text-right">Latte</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex-1 bg-[#222] rounded-full h-2"><div className="bg-[#8fb38a] h-2 rounded-full" style={{width:'70%'}}></div></div>
            <span className="text-gray-300 w-14 text-right">Espresso</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex-1 bg-[#222] rounded-full h-2"><div className="bg-[#88C0D0] h-2 rounded-full" style={{width:'55%'}}></div></div>
            <span className="text-gray-300 w-14 text-right">Mocha</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const getShaderConfig = (index: number) => {
  const configs = [
    { proportion: 0.3, softness: 0.8, distortion: 0.15, swirl: 0.6, swirlIterations: 8, shape: "checks" as const, shapeScale: 0.08, colors: ["#C8A97E", "#111111", "#8fb38a", "#0F0F0F"] },
    { proportion: 0.4, softness: 1.2, distortion: 0.2, swirl: 0.9, swirlIterations: 12, shape: "stripes" as const, shapeScale: 0.12, colors: ["#8fb38a", "#111111", "#C8A97E", "#0A0A0A"] },
    { proportion: 0.35, softness: 0.9, distortion: 0.18, swirl: 0.7, swirlIterations: 10, shape: "checks" as const, shapeScale: 0.1, colors: ["#88C0D0", "#111111", "#C8A97E", "#1A1A1A"] },
    { proportion: 0.45, softness: 1.1, distortion: 0.22, swirl: 0.8, swirlIterations: 15, shape: "stripes" as const, shapeScale: 0.09, colors: ["#C8A97E", "#0A0A0A", "#88C0D0", "#111111"] },
    { proportion: 0.38, softness: 0.95, distortion: 0.16, swirl: 0.85, swirlIterations: 11, shape: "checks" as const, shapeScale: 0.11, colors: ["#8fb38a", "#0F0F0F", "#C8A97E", "#111111"] },
    { proportion: 0.42, softness: 1.0, distortion: 0.19, swirl: 0.75, swirlIterations: 9, shape: "stripes" as const, shapeScale: 0.13, colors: ["#88C0D0", "#1A1A1A", "#8fb38a", "#0A0A0A"] },
  ];
  return configs[index % configs.length];
};

/* ---- Feature Card with hover preview ---- */
function FeatureCard({ icon, title, description, preview, index }: { icon: string; title: string; description: string; preview: React.ReactNode; index: number }) {
  const shaderConfig = getShaderConfig(index);

  return (
    <div className="group relative h-96 rounded-3xl transition-all duration-500 hover:-translate-y-2">
      <div className="absolute inset-0 rounded-3xl overflow-hidden opacity-30 group-hover:opacity-80 transition-opacity duration-500">
        <Warp
          style={{ height: "100%", width: "100%" }}
          proportion={shaderConfig.proportion}
          softness={shaderConfig.softness}
          distortion={shaderConfig.distortion}
          swirl={shaderConfig.swirl}
          swirlIterations={shaderConfig.swirlIterations}
          shape={shaderConfig.shape}
          shapeScale={shaderConfig.shapeScale}
          scale={1}
          rotation={0}
          speed={0.8}
          colors={shaderConfig.colors}
        />
      </div>

      <div className="relative z-10 p-8 rounded-3xl h-full flex flex-col bg-black/70 border border-[#C8A97E]/20 hover:border-[#C8A97E]/50 transition-colors duration-300">
        <div className="text-5xl mb-6 filter drop-shadow-lg">{icon}</div>
        <h3 className="text-2xl font-bold mb-4 text-[#E8D5B5]">{title}</h3>
        <p className="leading-relaxed flex-grow text-gray-300 font-medium">{description}</p>
        
        {/* Hover Preview Box */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 w-[420px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:-translate-y-0 translate-y-4 z-50 pointer-events-none">
          <div className="bg-[#0F0F0F] border border-[#C8A97E]/30 rounded-lg overflow-hidden shadow-2xl shadow-[#C8A97E]/10">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-[#1A1A1A] border-b border-[#333]">
              <div className="w-2 h-2 rounded-full bg-[#FF5F57]"></div>
              <div className="w-2 h-2 rounded-full bg-[#FEBC2E]"></div>
              <div className="w-2 h-2 rounded-full bg-[#28C840]"></div>
              <span className="ml-2 text-gray-500 text-[10px] font-pixel">{title}</span>
            </div>
            <div className="p-5 backdrop-blur-sm">
              {preview}
            </div>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-[#0F0F0F] border-r border-b border-[#C8A97E]/30 rotate-45"></div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-pixel overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{ backgroundColor: scrollY > 50 ? 'rgba(10,10,10,0.95)' : 'transparent', backdropFilter: scrollY > 50 ? 'blur(12px)' : 'none' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍽️</span>
            <span className="text-2xl font-bold tracking-wider uppercase bg-gradient-to-r from-[#C8A97E] to-[#E8D5B5] bg-clip-text text-transparent">QR Menü</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/auth')} className="px-6 py-2 text-[#C8A97E] border-2 border-[#C8A97E] hover:bg-[#C8A97E] hover:text-[#0A0A0A] transition-all duration-300 font-bold uppercase text-sm tracking-wider">
              Giriş Yap
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 pt-20 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 w-full h-full bg-slate-900 z-10 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
        <Boxes />

        <div className="relative z-20 text-center max-w-4xl mx-auto mt-10 pointer-events-none">
          <div className="mb-6 inline-block px-4 py-2 border border-[#C8A97E]/30 rounded-full text-[#C8A97E] text-sm tracking-widest uppercase animate-fade-in bg-black/50 backdrop-blur-sm">
            ✨ Dijital Menü Çözümü
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight drop-shadow-2xl">
            <span className="bg-gradient-to-r from-[#C8A97E] via-[#E8D5B5] to-[#C8A97E] bg-clip-text text-transparent pointer-events-auto">Menünüzü</span>
            <br />
            <span className="text-white pointer-events-auto">Dijitale Taşıyın</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-md bg-black/20 p-2 rounded-lg backdrop-blur-sm pointer-events-auto">
            QR kod ile müşterilerinize modern, hızlı ve şık bir menü deneyimi sunun. 
            Basılı menü maliyetlerinden kurtulun.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pointer-events-auto">
            <button onClick={() => navigate('/auth')} className="px-10 py-4 bg-gradient-to-r from-[#C8A97E] to-[#A0845C] text-[#0A0A0A] font-bold text-xl uppercase tracking-wider hover:from-[#E8D5B5] hover:to-[#C8A97E] transition-all duration-300 shadow-[0_0_30px_rgba(200,169,126,0.3)] hover:shadow-[0_0_50px_rgba(200,169,126,0.5)] border-2 border-[#C8A97E]">
              🚀 Hemen Başla
            </button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})} className="px-10 py-4 border-2 border-gray-500 bg-black/30 backdrop-blur-sm text-white font-bold text-xl uppercase tracking-wider hover:border-[#C8A97E] hover:text-[#C8A97E] transition-all duration-300">
              Daha Fazla Bilgi ↓
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#C8A97E] to-[#E8D5B5] bg-clip-text text-transparent">Neden QR Menü?</span>
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">Restoranınızı dijital çağa taşıyacak her şey burada.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              index={0}
              icon="📱"
              title="QR Kod ile Menü"
              description="Müşterileriniz masadaki QR kodu okutarak menünüze anında ulaşsın. Bekleme yok, fiziksel menü yok."
              preview={<PreviewQR />}
            />
            <FeatureCard
              index={1}
              icon="🎨"
              title="Özelleştirilebilir Temalar"
              description="6 farklı tema ile yönetim panelinizi kişiselleştirin. Klasik, Modern, Dracula ve daha fazlası."
              preview={<PreviewThemes />}
            />
            <FeatureCard
              index={2}
              icon="📊"
              title="Sipariş Yönetimi"
              description="Masa bazlı sipariş takibi, garson çağırma ve hesap isteme. Tüm siparişler tek panelde."
              preview={<PreviewOrders />}
            />
            <FeatureCard
              index={3}
              icon="🏷️"
              title="Kampanya Sistemi"
              description="İndirim kampanyaları oluşturun, kategorilere özel kampanyalar tanımlayın. Müşterilerinizi şaşırtın."
              preview={<PreviewCampaigns />}
            />
            <FeatureCard
              index={4}
              icon="👨‍🍳"
              title="Personel Yönetimi"
              description="Garson ve şef hesapları oluşturun, rol bazlı yetkilendirme ile ekibinizi yönetin."
              preview={<PreviewStaff />}
            />
            <FeatureCard
              index={5}
              icon="📈"
              title="İstatistik & Raporlama"
              description="Satış istatistiklerini görüntüleyin, Excel'e aktarın. Veriye dayalı kararlar alın."
              preview={<PreviewStats />}
            />
          </div>
        </div>
      </section>

      {/* Screenshots / How it works */}
      <section className="py-24 px-6 bg-[#080808]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#8fb38a] to-[#C8A97E] bg-clip-text text-transparent">Nasıl Çalışır?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#C8A97E] to-[#A0845C] flex items-center justify-center text-[#0A0A0A] text-3xl font-bold border-2 border-[#C8A97E]">1</div>
              <h3 className="text-2xl font-bold mb-4 text-[#E8D5B5]">Kayıt Olun</h3>
              <p className="text-gray-400">Hızlıca hesap oluşturun ve mekanınızı sisteme ekleyin. 2 dakikadan kısa sürer.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#C8A97E] to-[#A0845C] flex items-center justify-center text-[#0A0A0A] text-3xl font-bold border-2 border-[#C8A97E]">2</div>
              <h3 className="text-2xl font-bold mb-4 text-[#E8D5B5]">Menüyü Düzenleyin</h3>
              <p className="text-gray-400">Kategoriler oluşturun, ürünleri ekleyin, fiyatları belirleyin. Sürükle-bırak ile sıralayın.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#C8A97E] to-[#A0845C] flex items-center justify-center text-[#0A0A0A] text-3xl font-bold border-2 border-[#C8A97E]">3</div>
              <h3 className="text-2xl font-bold mb-4 text-[#E8D5B5]">QR Kodunuzu Paylaşın</h3>
              <p className="text-gray-400">Otomatik oluşturulan QR kodunu masalarınıza koyun. Müşteriler okutarak menüye ulaşsın!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Panel Preview */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#C8A97E] to-[#E8D5B5] bg-clip-text text-transparent">Güçlü Yönetim Paneli</span>
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">Her şeyi tek bir yerden yönetin. Menü, siparişler, personel, kampanyalar ve daha fazlası.</p>
          </div>

          {/* Mock Admin Panel Preview */}
          <div className="relative mx-auto max-w-4xl">
            <div className="bg-[#111111] border border-[#333333] rounded-lg overflow-hidden shadow-2xl shadow-[#C8A97E]/5">
              {/* Fake title bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#1A1A1A] border-b border-[#333333]">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FEBC2E]"></div>
                <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
                <span className="ml-4 text-gray-500 text-sm">Yönetim Paneli — QR Menü</span>
              </div>
              {/* Fake dashboard content */}
              <div className="p-8">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#1A1A1A] border border-[#333333] p-4">
                    <div className="text-gray-500 text-sm mb-1">Toplam Ürün</div>
                    <div className="text-2xl font-bold text-[#C8A97E]">48</div>
                  </div>
                  <div className="bg-[#1A1A1A] border border-[#333333] p-4">
                    <div className="text-gray-500 text-sm mb-1">Aktif Kampanya</div>
                    <div className="text-2xl font-bold text-[#8fb38a]">3</div>
                  </div>
                  <div className="bg-[#1A1A1A] border border-[#333333] p-4">
                    <div className="text-gray-500 text-sm mb-1">Bugünkü Sipariş</div>
                    <div className="text-2xl font-bold text-[#88C0D0]">127</div>
                  </div>
                </div>
                <div className="bg-[#1A1A1A] border border-[#333333] p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-[#E8D5B5]">📋 Kategoriler</span>
                    <span className="text-sm text-[#C8A97E] border border-[#C8A97E] px-3 py-1">+ Yeni Ekle</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-[#222222] px-4 py-2 border-l-4 border-[#C8A97E]">
                      <span>☕ Sıcak İçecekler</span><span className="text-gray-500">12 ürün</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#222222] px-4 py-2 border-l-4 border-[#8fb38a]">
                      <span>🥤 Soğuk İçecekler</span><span className="text-gray-500">8 ürün</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#222222] px-4 py-2 border-l-4 border-[#88C0D0]">
                      <span>🍰 Tatlılar</span><span className="text-gray-500">6 ürün</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#C8A97E]/5 via-transparent to-[#8fb38a]/5 blur-xl -z-10"></div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0A0A0A] to-[#111111]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            <span className="text-white">Hazır mısınız?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-12">Menünüzü dakikalar içinde dijitale taşıyın. Ücretsiz başlayın, büyüdükçe ölçeklendirin.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/auth')} className="px-12 py-5 bg-gradient-to-r from-[#C8A97E] to-[#A0845C] text-[#0A0A0A] font-bold text-2xl uppercase tracking-wider hover:from-[#E8D5B5] hover:to-[#C8A97E] transition-all duration-300 shadow-[0_0_30px_rgba(200,169,126,0.3)] hover:shadow-[0_0_50px_rgba(200,169,126,0.5)] border-2 border-[#C8A97E]">
              Giriş Yap / Kayıt Ol
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#222222]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍽️</span>
            <span className="text-xl font-bold text-[#C8A97E]">QR Menü</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/policies')} className="text-gray-500 text-sm hover:text-[#C8A97E] transition-colors">Gizlilik & Çerez Politikası</button>
            <p className="text-gray-500 text-sm">© 2026 QR Menü. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
