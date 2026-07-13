import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCodeStyling from 'qr-code-styling';
import type { DotType, CornerSquareType } from 'qr-code-styling';
import { supabase } from '../supabase';

interface Restaurant {
  id: string;
  name: string;
  primary_color?: string;
  background_color?: string;
  logo_url?: string;
}

// --- STİL SEÇENEKLERİ ---
const DOT_STYLES: { value: DotType; label: string; preview: string }[] = [
  { value: 'square',         label: 'Kare',          preview: '■' },
  { value: 'rounded',        label: 'Yuvarlak Kare', preview: '▪' },
  { value: 'extra-rounded',  label: 'Çok Yuvarlak',  preview: '●' },
  { value: 'dots',           label: 'Daire',         preview: '•' },
  { value: 'classy',         label: 'Şık',           preview: '◆' },
  { value: 'classy-rounded', label: 'Şık Yuvarlak',  preview: '◇' },
];

const CORNER_STYLES: { value: CornerSquareType; label: string; preview: string }[] = [
  { value: 'square',        label: 'Kare Köşe',     preview: '□' },
  { value: 'extra-rounded', label: 'Yuvarlak Köşe', preview: '○' },
  { value: 'dot',           label: 'Nokta Köşe',    preview: '◉' },
];

const COLOR_PRESETS = [
  { label: 'Kahve',    dot: '#6B3A2A', bg: '#FDF6EC' },
  { label: 'Lacivert', dot: '#1A2E5A', bg: '#EEF2FF' },
  { label: 'Zeytin',   dot: '#3D5A3E', bg: '#F0F5EE' },
  { label: 'Gece',     dot: '#FFFFFF', bg: '#1A1A2E' },
  { label: 'Altın',    dot: '#C8960C', bg: '#1C1C1C' },
  { label: 'Pembe',    dot: '#8B2252', bg: '#FFF0F5' },
];

const DOWNLOAD_SIZES = [
  { size: 512,  label: '512px',  desc: 'Web / Sosyal Medya' },
  { size: 1024, label: '1024px', desc: 'Küçük Baskı'        },
  { size: 2048, label: '2048px', desc: 'HD Baskı / Tabela'  },
];

export default function QRCustomizer() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  // QR Ayarları
  const [dotColor,      setDotColor]      = useState('#8B5A2B');
  const [bgColor,       setBgColor]       = useState('#FFFFFF');
  const [dotStyle,      setDotStyle]      = useState<DotType>('rounded');
  const [cornerStyle,   setCornerStyle]   = useState<CornerSquareType>('square');
  const [useLogo,       setUseLogo]       = useState(false);
  const [transparentBg, setTransparentBg] = useState(false);
  const [downloading,   setDownloading]   = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<QRCodeStyling | null>(null);

  const menuUrl = restaurant
    ? `${window.location.origin}/menu/${restaurant.id}`
    : 'https://example.com';

  // --- Restoranı yükle ---
  useEffect(() => {
    const load = async () => {
      if (!restaurantId) return;
      const { data } = await supabase
        .from('restaurants')
        .select('id, name, primary_color, background_color, logo_url')
        .eq('id', restaurantId)
        .single();
      if (data) {
        setRestaurant(data);
        setDotColor(data.primary_color || '#8B5A2B');
      }
      setLoading(false);
    };
    load();
  }, [restaurantId]);

  // --- QR oluştur (ilk yüklemede) ---
  useEffect(() => {
    if (!restaurant || !previewRef.current) return;
    qrInstance.current = new QRCodeStyling(buildOptions(280));
    previewRef.current.innerHTML = '';
    qrInstance.current.append(previewRef.current);
  }, [restaurant]);

  // --- QR güncelle (seçenekler değişince) ---
  useEffect(() => {
    if (!qrInstance.current) return;
    qrInstance.current.update(buildOptions(280));
  }, [dotColor, bgColor, dotStyle, cornerStyle, useLogo, transparentBg, restaurant]);

  function buildOptions(size: number) {
    return {
      width: size,
      height: size,
      data: menuUrl,
      image: useLogo && restaurant?.logo_url ? restaurant.logo_url : undefined,
      dotsOptions: { color: dotColor, type: dotStyle },
      backgroundOptions: { color: transparentBg ? 'rgba(0,0,0,0)' : bgColor },
      cornersSquareOptions: { type: cornerStyle, color: dotColor },
      cornersDotOptions: { color: dotColor },
      imageOptions: {
        crossOrigin: 'anonymous' as const,
        margin: 10,
        imageSize: 0.35,
      },
      qrOptions: { errorCorrectionLevel: 'H' as const },
    };
  }

  const handleDownload = async (size: number, ext: 'png' | 'svg') => {
    if (!qrInstance.current) return;
    const key = `${ext}-${size}`;
    setDownloading(key);
    qrInstance.current.update(buildOptions(size));
    await new Promise(r => setTimeout(r, 200));
    await qrInstance.current.download({
      name: `qr-${restaurant?.name || 'menu'}`,
      extension: ext,
    });
    await new Promise(r => setTimeout(r, 200));
    qrInstance.current.update(buildOptions(280));
    setDownloading(null);
  };

  const applyPreset = (preset: (typeof COLOR_PRESETS)[0]) => {
    setDotColor(preset.dot);
    setBgColor(preset.bg);
    setTransparentBg(false);
  };

  // --- YÜKLEME / HATA ---
  if (loading) {
    return (
      <div className="min-h-screen bg-surface font-pixel flex items-center justify-center text-3xl text-brand-dark">
        Yükleniyor...
      </div>
    );
  }
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-surface font-pixel flex items-center justify-center text-2xl text-brand-dark">
        Restoran bulunamadı.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-pixel text-ink p-8">
      <div className="max-w-5xl mx-auto">

        {/* BAŞLIK */}
        <div className="flex items-center justify-between mb-8 border-b-4 border-brand-dark pb-6">
          <div>
            <h1 className="text-4xl font-bold uppercase text-brand-dark">QR Kod Özelleştirici</h1>
            <p className="text-xl text-brand-dark/60 font-bold mt-1">{restaurant.name}</p>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="px-6 py-3 border-2 border-brand-dark bg-brand-light font-bold hover:bg-white shadow-pixel-sm transition-colors"
          >
            ← Admin Paneline Dön
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">

          {/* SOL: ÖNİZLEME + İNDİR */}
          <div className="flex flex-col items-center gap-6">

            {/* ÖNIZLEME */}
            <div
              className="border-4 border-brand-dark shadow-pixel p-6 flex items-center justify-center w-full"
              style={{
                backgroundColor: transparentBg ? undefined : bgColor,
                backgroundImage: transparentBg
                  ? 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 16px 16px'
                  : 'none',
              }}
            >
              <div ref={previewRef} />
            </div>
            <p className="text-sm font-bold text-brand-dark/50 uppercase tracking-widest">Canlı Önizleme</p>

            {/* RENK ÖNAYARları */}
            <div className="w-full bg-[#F4E4C1] border-4 border-brand-dark shadow-pixel p-4">
              <p className="font-bold uppercase text-brand-dark mb-3 border-b-2 border-brand-dark pb-2 text-lg">
                ⚡ Hızlı Renk Önayarları
              </p>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_PRESETS.map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset)}
                    className="h-14 border-2 border-brand-dark flex items-center justify-center gap-2 font-bold text-sm hover:scale-105 transition-transform relative px-2"
                    style={{ backgroundColor: preset.bg }}
                  >
                    <span className="w-4 h-4 border border-black/20 shrink-0" style={{ backgroundColor: preset.dot }} />
                    <span style={{ color: preset.dot }}>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* İNDİR */}
            <div className="w-full bg-[#e8f4e1] border-4 border-[#8fb38a] shadow-pixel p-4">
              <p className="font-bold uppercase text-brand-dark mb-3 border-b-2 border-[#8fb38a] pb-2 text-lg">
                ⬇ İndir
              </p>
              <div className="space-y-2">
                {DOWNLOAD_SIZES.map(({ size, label, desc }) => (
                  <button
                    key={size}
                    onClick={() => handleDownload(size, 'png')}
                    disabled={downloading !== null}
                    className="w-full flex items-center justify-between px-4 py-3 border-2 border-brand-dark bg-[#8fb38a] font-bold hover:bg-[#a3c79e] shadow-pixel-sm disabled:opacity-60 transition-all active:translate-y-0.5"
                  >
                    <span>PNG — {label}</span>
                    <span className="text-sm font-normal opacity-80">{desc}</span>
                    <span className="text-lg">{downloading === `png-${size}` ? '⏳' : '⬇'}</span>
                  </button>
                ))}
                <button
                  onClick={() => handleDownload(512, 'svg')}
                  disabled={downloading !== null}
                  className="w-full flex items-center justify-between px-4 py-3 border-2 border-brand-dark bg-brand-light font-bold hover:bg-white shadow-pixel-sm disabled:opacity-60 transition-all active:translate-y-0.5"
                >
                  <span>SVG — Vektör</span>
                  <span className="text-sm font-normal opacity-80">Ölçeklenebilir</span>
                  <span className="text-lg">{downloading === 'svg-512' ? '⏳' : '⬇'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* SAĞ: AYARLAR */}
          <div className="space-y-6">

            {/* RENKLER */}
            <div className="bg-[#F4E4C1] border-4 border-brand-dark shadow-pixel p-6">
              <h2 className="text-2xl font-bold uppercase text-brand-dark border-b-2 border-brand-dark pb-3 mb-5">
                🎨 Renkler
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block font-bold mb-2">QR Kodu Rengi</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={dotColor}
                      onChange={e => setDotColor(e.target.value)}
                      className="w-14 h-12 border-2 border-brand-dark cursor-pointer bg-white p-1"
                    />
                    <input
                      type="text"
                      value={dotColor}
                      onChange={e => setDotColor(e.target.value)}
                      className="flex-1 px-3 py-2 border-2 border-brand-dark bg-white focus:outline-none font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold mb-2">Arka Plan Rengi</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={e => { setBgColor(e.target.value); setTransparentBg(false); }}
                      className="w-14 h-12 border-2 border-brand-dark cursor-pointer bg-white p-1"
                      disabled={transparentBg}
                    />
                    <input
                      type="text"
                      value={transparentBg ? 'Şeffaf' : bgColor}
                      onChange={e => { setBgColor(e.target.value); setTransparentBg(false); }}
                      className="flex-1 px-3 py-2 border-2 border-brand-dark bg-white focus:outline-none font-bold"
                      disabled={transparentBg}
                    />
                  </div>
                  <button
                    onClick={() => setTransparentBg(!transparentBg)}
                    className={`mt-2 w-full py-2 border-2 border-brand-dark text-sm font-bold transition-colors ${transparentBg ? 'bg-brand text-surface' : 'bg-white text-brand-dark hover:bg-brand-light'}`}
                  >
                    {transparentBg ? '✓ Şeffaf Arka Plan Aktif' : 'Şeffaf Yap (PNG için)'}
                  </button>
                </div>
              </div>
            </div>

            {/* NOKTA STİLİ */}
            <div className="bg-[#F4E4C1] border-4 border-brand-dark shadow-pixel p-6">
              <h2 className="text-2xl font-bold uppercase text-brand-dark border-b-2 border-brand-dark pb-3 mb-5">
                ◆ Nokta Stili
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {DOT_STYLES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setDotStyle(s.value)}
                    className={`py-4 border-2 border-brand-dark font-bold flex flex-col items-center gap-2 transition-colors ${
                      dotStyle === s.value ? 'bg-brand text-surface shadow-pixel' : 'bg-white text-brand-dark hover:bg-brand-light'
                    }`}
                  >
                    <span
                      className="text-3xl leading-none"
                      style={{ color: dotStyle === s.value ? 'white' : dotColor }}
                    >
                      {s.preview}
                    </span>
                    <span className="text-sm">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* KÖŞE STİLİ */}
            <div className="bg-[#F4E4C1] border-4 border-brand-dark shadow-pixel p-6">
              <h2 className="text-2xl font-bold uppercase text-brand-dark border-b-2 border-brand-dark pb-3 mb-5">
                □ Köşe Stili
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {CORNER_STYLES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setCornerStyle(s.value)}
                    className={`py-4 border-2 border-brand-dark font-bold flex flex-col items-center gap-2 transition-colors ${
                      cornerStyle === s.value ? 'bg-brand text-surface shadow-pixel' : 'bg-white text-brand-dark hover:bg-brand-light'
                    }`}
                  >
                    <span
                      className="text-3xl leading-none"
                      style={{ color: cornerStyle === s.value ? 'white' : dotColor }}
                    >
                      {s.preview}
                    </span>
                    <span className="text-sm">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* LOGO */}
            {restaurant.logo_url && (
              <div className="bg-[#F4E4C1] border-4 border-brand-dark shadow-pixel p-6">
                <h2 className="text-2xl font-bold uppercase text-brand-dark border-b-2 border-brand-dark pb-3 mb-5">
                  🏪 Merkez Logo
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 border-2 border-brand-dark overflow-hidden shrink-0">
                    <img src={restaurant.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={() => setUseLogo(!useLogo)}
                    className={`flex-1 py-4 border-2 border-brand-dark font-bold text-lg transition-colors ${
                      useLogo ? 'bg-brand text-surface shadow-pixel' : 'bg-white text-brand-dark hover:bg-brand-light'
                    }`}
                  >
                    {useLogo ? '✓ Logo QR\'da Gösteriliyor' : 'Logo Ekle'}
                  </button>
                </div>
                {useLogo && (
                  <p className="mt-3 text-sm font-bold text-brand-dark/60">
                    Not: Logo için hata düzeltme seviyesi otomatik artırılır (H seviyesi).
                  </p>
                )}
              </div>
            )}

            {/* URL BİLGİSİ */}
            <div className="bg-white border-2 border-brand-dark p-4">
              <p className="font-bold text-sm text-brand-dark/60 uppercase mb-2">QR Kodu Yönlendirdiği URL:</p>
              <p className="font-bold text-brand-dark break-all text-sm bg-brand-light border border-brand-dark px-3 py-2">
                {menuUrl}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
