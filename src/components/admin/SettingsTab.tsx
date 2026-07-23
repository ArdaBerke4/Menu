import { DebouncedColorInput } from './DebouncedColorInput';

export const PRESET_BACKGROUNDS = [
  { id: 'none', name: 'Görsel Yok', css: '' },
  {
    id: 'paper',
    name: 'Eski Kağıt',
    css: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`
  },
  {
    id: 'dots',
    name: 'Noktalı',
    css: `radial-gradient(circle, currentColor 1px, transparent 1px)`
  },
  {
    id: 'lines',
    name: 'Çizgili',
    css: `repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 1px, transparent 10px)`
  }
];

export const FONT_OPTIONS = [
  { id: '"Inter", sans-serif', name: 'Modern (Inter)' },
  { id: '"Playfair Display", serif', name: 'Zarif (Playfair)' },
  { id: '"VT323", monospace', name: 'Retro (VT323)' },
  { id: '"Comic Sans MS", cursive, sans-serif', name: 'Eğlenceli (Comic Sans)' },
];

export const FONT_SIZE_OPTIONS = [
  { id: 'small', name: 'Küçük' },
  { id: 'medium', name: 'Orta' },
  { id: 'large', name: 'Büyük' },
  { id: 'xlarge', name: 'Çok Büyük' },
];

export const BUTTON_SHAPE_OPTIONS = [
  { id: 'square', name: 'Keskin Köşeli' },
  { id: 'rounded', name: 'Hafif Yuvarlak' },
  { id: 'pill', name: 'Tam Yuvarlak (Hap)' },
];

export const LAYOUT_OPTIONS = [
  { id: 'list', name: 'Dikey Liste' },
  { id: 'grid', name: 'Yan Yana (Izgara)' },
  { id: 'canvas', name: 'Serbest Düzen (Tuval)' },
];

export const HEADER_STYLE_OPTIONS = [
  { id: 'center', name: 'Ortalanmış (Klasik)' },
  { id: 'left', name: 'Sola Dayalı (Modern)' },
  { id: 'banner', name: 'Geniş Kapak (Banner)' },
];

export const NAV_STYLE_OPTIONS = [
  { id: 'scroll', name: 'Sonsuz Liste' },
  { id: 'tabs', name: 'Sekmeli (Tabs)' },
];

export const DEFAULT_BG_COLOR = '#F4E4C1';

export const getTextColorForBackground = (bgColor: string) => {
  const color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#FFFFFF';
};

export const getFontSizeClasses = (size?: string) => {
  switch (size) {
    case 'small':  return { cat: 'text-xl', product: 'text-xl', desc: 'text-sm', price: 'text-lg' };
    case 'medium': return { cat: 'text-2xl', product: 'text-2xl', desc: 'text-lg', price: 'text-xl' };
    case 'large':  return { cat: 'text-3xl', product: 'text-3xl', desc: 'text-xl', price: 'text-2xl' };
    case 'xlarge': return { cat: 'text-4xl', product: 'text-4xl', desc: 'text-2xl', price: 'text-3xl' };
    default:       return { cat: 'text-2xl', product: 'text-2xl', desc: 'text-lg', price: 'text-xl' };
  }
};

export const getRecommendedColors = (bgColor: string) => {
  const color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
  const r = parseInt(color.substring(0, 2), 16) || 255;
  const g = parseInt(color.substring(2, 4), 16) || 255;
  const b = parseInt(color.substring(4, 6), 16) || 255;
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 128 
    ? ['#8B5A2B', '#1B4D3E', '#800020', '#2C3E50', '#000000', '#D35400']
    : ['#F4E4C1', '#1ABC9C', '#F1C40F', '#E74C3C', '#FFFFFF', '#ECF0F1'];
};

export function SettingsTab(props: any) {
  const {
    themeColor, setThemeColor,
    themeFont, setThemeFont,
    fontSize, setFontSize,
    bgColor, setBgColor,
    bgImageUrl, setBgImageUrl,
    buttonShape, setButtonShape,
    layoutStyle, setLayoutStyle,
    headerStyle, setHeaderStyle,
    navStyle, setNavStyle,
    cardBgColor, setCardBgColor,
    logoFile, setLogoFile,
    bgUploadFile, setBgUploadFile,
    selectedRestaurant,
    saveSettings,
    handleUndoSettings,
    settingsHistory,
    saveToHistory,
    loading,
    fileInputRef
  } = props;

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      {/* SOL KOLON - AYARLAR */}
      <div className="flex-1 space-y-8">
        <header className="mb-4">
          <h1 className="text-4xl font-bold uppercase mb-2">Görünüm Ayarları</h1>
          <p className="text-lg text-brand-dark/60 font-bold">Menünüzün renklerini, yazı tiplerini ve genel düzenini özelleştirin. Tüm değişiklikleri yandaki telefondan canlı izleyebilirsiniz.</p>
        </header>

        <form onSubmit={saveSettings} className="space-y-6">
          <div className="bg-[#F4E4C1] border-4 border-brand-dark shadow-pixel p-6 space-y-6">
            <h2 className="text-2xl font-bold uppercase mb-4 border-b-2 border-brand-dark pb-2">Ana Marka & Renk</h2>

            <div>
              <label className="block font-bold mb-2">Restoran Logosu</label>
              {selectedRestaurant?.logo_url && !logoFile && (
                <div className="mb-2"><img src={selectedRestaurant.logo_url} alt="Logo" className="h-16 object-contain" /></div>
              )}
              <input type="file" accept="image/*" onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setLogoFile(e.target.files[0]);
                }
              }} className="block w-full text-sm text-brand-dark file:mr-4 file:py-2 file:px-4 file:border-2 file:border-brand-dark file:bg-brand file:text-surface file:font-bold hover:file:opacity-90 cursor-pointer" />
            </div>

            <div>
              <label className="block font-bold mb-2">Ana Marka Rengi</label>
              <DebouncedColorInput value={themeColor} onChange={setThemeColor} onFocus={saveToHistory} />
            </div>

            {/* Önerilen Renkler */}
            <div>
              <label className="block font-bold mb-2 text-sm opacity-80">Arka Plana Uygun Önerilen Renkler</label>
              <div className="flex gap-2 flex-wrap">
                {getRecommendedColors(bgColor).map(c => (
                  <button 
                    key={c} type="button" 
                    onClick={() => { saveToHistory(); setThemeColor(c); }}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 shadow-sm ${themeColor === c ? 'scale-110 ring-2 ring-offset-1 ring-brand-dark' : ''}`}
                    style={{ backgroundColor: c, borderColor: getTextColorForBackground(c) === '#000000' ? '#00000030' : '#ffffff30' }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#F4E4C1] border-4 border-brand-dark shadow-pixel p-6 space-y-6">
            <h2 className="text-2xl font-bold uppercase mb-4 border-b-2 border-brand-dark pb-2">Arka Plan & Zemin</h2>
            
            <div>
              <label className="block font-bold mb-2">Arka Plan Rengi</label>
              <DebouncedColorInput value={bgColor} onChange={setBgColor} onFocus={saveToHistory} />
            </div>

            <div>
              <label className="block font-bold mb-2">Ürün Kartı Arkaplan Rengi</label>
              <DebouncedColorInput value={cardBgColor} onChange={setCardBgColor} onFocus={saveToHistory} />
            </div>

            <div>
              <label className="block font-bold mb-2">Hazır Arka Plan Seçimi</label>
              <div className="grid grid-cols-2 gap-3">
                {PRESET_BACKGROUNDS.map(preset => (
                  <button
                    key={preset.id} type="button"
                    onClick={() => { saveToHistory(); setBgImageUrl(preset.id); setBgUploadFile(null); }}
                    className={`px-4 py-3 border-2 border-brand-dark font-bold transition-all text-sm ${bgImageUrl === preset.id ? 'bg-brand text-surface shadow-pixel' : 'bg-white hover:bg-brand-light'}`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold mb-2">Veya Kendi Görselinizi Yükleyin</label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  saveToHistory();
                  setBgUploadFile(e.target.files[0]);
                  setBgImageUrl('');
                }
              }} className="block w-full text-sm text-brand-dark file:mr-4 file:py-2 file:px-4 file:border-2 file:border-brand-dark file:bg-white file:text-brand-dark file:font-bold hover:file:bg-brand-light cursor-pointer" />
              {bgUploadFile && <p className="mt-2 text-sm font-bold text-[#5b7a57]">✓ {bgUploadFile.name} seçildi</p>}
            </div>
          </div>

          <div className="bg-[#F4E4C1] border-4 border-brand-dark shadow-pixel p-6 space-y-6">
            <h2 className="text-2xl font-bold uppercase mb-4 border-b-2 border-brand-dark pb-2">Tipografi & Şekiller</h2>
            
            <div>
              <label className="block font-bold mb-2">Yazı Tipi Ailesi</label>
              <select value={themeFont} onChange={e => { saveToHistory(); setThemeFont(e.target.value); }} className="w-full px-4 py-3 border-2 border-brand-dark bg-white font-bold focus:outline-none">
                {FONT_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-2">Yazı Boyutu</label>
              <div className="flex bg-white border-2 border-brand-dark">
                {FONT_SIZE_OPTIONS.map(opt => (
                  <button
                    key={opt.id} type="button"
                    onClick={() => { saveToHistory(); setFontSize(opt.id); }}
                    className={`flex-1 py-2 font-bold text-sm transition-colors border-r-2 border-brand-dark last:border-r-0 ${fontSize === opt.id ? 'bg-brand text-surface' : 'hover:bg-brand-light'}`}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold mb-2">Buton Şekilleri</label>
              <select value={buttonShape} onChange={e => { saveToHistory(); setButtonShape(e.target.value); }} className="w-full px-4 py-3 border-2 border-brand-dark bg-white font-bold focus:outline-none">
                {BUTTON_SHAPE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-[#F4E4C1] border-4 border-brand-dark shadow-pixel p-6 space-y-6">
            <h2 className="text-2xl font-bold uppercase mb-4 border-b-2 border-brand-dark pb-2">Menü Yerleşimi</h2>
            
            <div>
              <label className="block font-bold mb-2">Başlık Tasarımı</label>
              <select value={headerStyle} onChange={e => { saveToHistory(); setHeaderStyle(e.target.value as any); }} className="w-full px-4 py-3 border-2 border-brand-dark bg-white font-bold focus:outline-none">
                {HEADER_STYLE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-2">Kategori Düzeni</label>
              <select value={navStyle} onChange={e => { saveToHistory(); setNavStyle(e.target.value as any); }} className="w-full px-4 py-3 border-2 border-brand-dark bg-white font-bold focus:outline-none">
                {NAV_STYLE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-2">Ürün Düzeni (Layout)</label>
              <select value={layoutStyle} onChange={e => { saveToHistory(); setLayoutStyle(e.target.value as any); }} className="w-full px-4 py-3 border-2 border-brand-dark bg-white font-bold focus:outline-none">
                {LAYOUT_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-4 sticky bottom-4 z-10 p-4 bg-[#F4E4C1] border-4 border-brand-dark shadow-pixel">
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-brand text-surface border-2 border-brand-dark font-bold uppercase text-xl hover:opacity-90 shadow-pixel disabled:opacity-50 transition-transform active:translate-y-1">
              {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
            <button type="button" onClick={handleUndoSettings} disabled={settingsHistory.length === 0} className="px-6 bg-white text-brand-dark border-2 border-brand-dark font-bold uppercase hover:bg-brand-light shadow-pixel disabled:opacity-50 transition-transform active:translate-y-1">
              Geri Al
            </button>
          </div>
        </form>
      </div>

      {/* SAĞ KOLON */}
      <div className="space-y-6 border-l-4 border-brand-dark pl-8 relative w-80 shrink-0">
        <div className="sticky top-4 z-10 w-full mb-6">
          <h2 className="text-xl font-bold uppercase mb-4 flex items-center justify-between">
            <span>Canlı Önizleme</span>
            <span className="text-sm font-normal px-2 py-1 bg-brand-light border-2 border-brand-dark">Demo</span>
          </h2>
          <div className="border-8 border-black rounded-[40px] shadow-2xl overflow-hidden h-[600px] w-full bg-white relative flex flex-col items-center">
            {/* Notch */}
            <div className="absolute top-0 w-1/2 h-6 bg-black rounded-b-xl z-20"></div>

            {/* İçerik */}
            <div 
              className="w-full h-full relative overflow-y-auto"
              style={{ 
                backgroundColor: bgColor,
                backgroundImage: bgUploadFile ? `url(${URL.createObjectURL(bgUploadFile)})` : 
                                 bgImageUrl && bgImageUrl !== 'none' ? PRESET_BACKGROUNDS.find(p => p.id === bgImageUrl)?.css : 'none',
                backgroundSize: bgUploadFile ? 'cover' : '300px',
                backgroundPosition: 'center',
                color: getTextColorForBackground(bgColor)
              }}
            >
              <div className="min-h-full flex flex-col p-4 pt-8" style={{ fontFamily: themeFont }}>
                
                {/* Header */}
                <div className={`w-full ${headerStyle === 'left' ? 'p-4 flex items-center gap-3 text-left' : headerStyle === 'banner' ? 'relative text-center' : 'p-4 text-center'} bg-white/80 backdrop-blur-sm shadow-sm mb-4`} style={{ color: themeColor }}>
                  {headerStyle === 'banner' && <div className="w-full h-16 bg-black/10 border-b-2" style={{ borderColor: themeColor }}></div>}
                  <div className={`bg-gray-100 border-2 overflow-hidden shrink-0 ${
                    headerStyle === 'banner' ? 'w-12 h-12 absolute left-1/2 -translate-x-1/2 -top-6' : 
                    headerStyle === 'left' ? 'w-12 h-12' : 'w-16 h-16 mx-auto mb-2'
                  } ${buttonShape === 'rounded' ? 'rounded-lg' : buttonShape === 'pill' ? 'rounded-full' : 'rounded-none'}`} style={{ borderColor: themeColor }}>
                    {logoFile ? <img src={URL.createObjectURL(logoFile)} alt="Logo" className="w-full h-full object-cover" /> :
                     selectedRestaurant?.logo_url ? <img src={selectedRestaurant.logo_url} alt="Logo" className="w-full h-full object-cover" /> :
                     <div className="w-full h-full flex items-center justify-center font-bold text-xs">LOGO</div>}
                  </div>
                  <div className={headerStyle === 'banner' ? 'pt-8 pb-3 px-2' : 'flex-1'}>
                    <div className={`font-bold uppercase ${headerStyle === 'left' ? 'text-lg leading-tight' : 'text-xl'}`}>{selectedRestaurant?.name || 'Restoran Adı'}</div>
                    <div className={`${headerStyle === 'left' ? 'text-xs' : 'text-sm'} opacity-70`}>{selectedRestaurant?.description || 'Kısa restoran açıklaması burada yer alır.'}</div>
                  </div>
                </div>

                {/* Nav */}
                {navStyle === 'tabs' && (
                  <div className="w-full px-2 py-3 flex gap-2 overflow-hidden border-b-2 bg-white/50 mb-4" style={{ borderColor: `${themeColor}40` }}>
                    <div className={`px-3 py-1 font-bold text-[10px] border-2 shadow-sm whitespace-nowrap`} style={{ backgroundColor: themeColor, color: 'white', borderColor: themeColor, borderRadius: buttonShape === 'pill' ? '99px' : buttonShape === 'rounded' ? '8px' : '0' }}>Popüler</div>
                    <div className={`px-3 py-1 font-bold text-[10px] border-2 shadow-sm whitespace-nowrap bg-white`} style={{ color: themeColor, borderColor: themeColor, borderRadius: buttonShape === 'pill' ? '99px' : buttonShape === 'rounded' ? '8px' : '0' }}>Tatlılar</div>
                    <div className={`px-3 py-1 font-bold text-[10px] border-2 shadow-sm whitespace-nowrap bg-white`} style={{ color: themeColor, borderColor: themeColor, borderRadius: buttonShape === 'pill' ? '99px' : buttonShape === 'rounded' ? '8px' : '0' }}>İçecekler</div>
                  </div>
                )}

                {/* İçerik Gövdesi */}
                <div className="flex-1 w-full p-2 flex flex-col gap-3">
                  {layoutStyle === 'list' && (
                    <>
                      <div className={`w-full p-2 border-2 shadow-sm flex gap-2`} style={{ borderColor: themeColor, backgroundColor: cardBgColor, borderRadius: buttonShape === 'pill' ? '12px' : buttonShape === 'rounded' ? '8px' : '0' }}>
                        <div className="w-10 h-10 bg-black/10 shrink-0" style={{ borderRadius: buttonShape === 'pill' ? '99px' : buttonShape === 'rounded' ? '4px' : '0' }}></div>
                        <div className="flex-1 mt-1">
                          <div className="h-2 w-3/4 bg-black/20 rounded mb-1"></div>
                          <div className="h-1.5 w-1/2 bg-black/10 rounded"></div>
                        </div>
                      </div>
                      <div className={`w-full p-2 border-2 shadow-sm flex gap-2`} style={{ borderColor: themeColor, backgroundColor: cardBgColor, borderRadius: buttonShape === 'pill' ? '12px' : buttonShape === 'rounded' ? '8px' : '0' }}>
                        <div className="w-10 h-10 bg-black/10 shrink-0" style={{ borderRadius: buttonShape === 'pill' ? '99px' : buttonShape === 'rounded' ? '4px' : '0' }}></div>
                        <div className="flex-1 mt-1">
                          <div className="h-2 w-2/3 bg-black/20 rounded mb-1"></div>
                          <div className="h-1.5 w-1/3 bg-black/10 rounded"></div>
                        </div>
                      </div>
                    </>
                  )}
                  {layoutStyle === 'grid' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`p-2 border-2 shadow-sm`} style={{ borderColor: themeColor, backgroundColor: cardBgColor, borderRadius: buttonShape === 'pill' ? '12px' : buttonShape === 'rounded' ? '8px' : '0' }}>
                        <div className="w-full h-12 bg-black/10 mb-2" style={{ borderRadius: buttonShape === 'pill' ? '8px' : buttonShape === 'rounded' ? '4px' : '0' }}></div>
                        <div className="h-1.5 w-3/4 bg-black/20 rounded"></div>
                      </div>
                      <div className={`p-2 border-2 shadow-sm`} style={{ borderColor: themeColor, backgroundColor: cardBgColor, borderRadius: buttonShape === 'pill' ? '12px' : buttonShape === 'rounded' ? '8px' : '0' }}>
                        <div className="w-full h-12 bg-black/10 mb-2" style={{ borderRadius: buttonShape === 'pill' ? '8px' : buttonShape === 'rounded' ? '4px' : '0' }}></div>
                        <div className="h-1.5 w-2/3 bg-black/20 rounded"></div>
                      </div>
                    </div>
                  )}
                  {layoutStyle === 'canvas' && (
                    <div className="relative w-full h-full border-2 bg-white/30 backdrop-blur-sm" style={{ borderColor: `${themeColor}40`, borderRadius: buttonShape === 'pill' ? '12px' : buttonShape === 'rounded' ? '8px' : '0' }}>
                      <div className="absolute top-4 left-4 p-1 px-2 text-[8px] border bg-white shadow-sm font-bold" style={{ color: themeColor, borderColor: themeColor }}>İçecekler</div>
                      <div className="absolute top-12 left-10 p-1 px-2 text-[8px] border bg-white shadow-sm font-bold" style={{ color: themeColor, borderColor: themeColor }}>Tatlılar</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
