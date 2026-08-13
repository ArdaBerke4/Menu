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



export const BUTTON_SHAPE_OPTIONS = [
  { id: 'square', name: 'Keskin Köşeli' },
  { id: 'rounded', name: 'Hafif Yuvarlak' },
  { id: 'pill', name: 'Tam Yuvarlak (Hap)' },
];

export const LAYOUT_OPTIONS = [
  { id: 'list', name: 'Dikey Liste' },
  { id: 'grid', name: 'Yan Yana (Izgara)' },
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

export const getDynamicFontStyles = (size?: string) => {
  const baseSize = parseInt(size || '16') || (size === 'small' ? 14 : size === 'large' ? 20 : size === 'xlarge' ? 24 : 16);
  return {
    cat: { fontSize: `${baseSize * 1.25}px` },
    product: { fontSize: `${baseSize}px` },
    desc: { fontSize: `${Math.max(10, baseSize * 0.75)}px` },
    price: { fontSize: `${baseSize * 1.125}px` },
  };
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
          <p className="text-lg text-admin-text/60 font-bold">Menünüzün renklerini, yazı tiplerini ve genel düzenini özelleştirin. Tüm değişiklikleri yandaki telefondan canlı izleyebilirsiniz.</p>
        </header>

        <form onSubmit={saveSettings} className="space-y-6">
          <div className="bg-admin-bg border-4 border-admin-border shadow-admin-pixel p-6 space-y-4">
            <h2 className="text-2xl font-bold uppercase mb-2 border-b-2 border-admin-border pb-2">Hazır Temalar</h2>
            <p className="text-sm opacity-80 font-bold mb-4">Aşağıdaki hazır temalardan birini seçerek renkleri ve fontları hızlıca ayarlayabilirsiniz.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { id: 'classic', name: 'Klasik Kahve', theme: '#8B5A2B', bg: '#F4E4C1', card: '#FFFFFF', font: '"VT323", monospace' },
                { id: 'dark', name: 'Karanlık (Dark)', theme: '#D4A373', bg: '#1E1E1E', card: '#2D2D2D', font: '"Inter", sans-serif' },
                { id: 'light', name: 'Aydınlık (Light)', theme: '#2C3E50', bg: '#F8F9FA', card: '#FFFFFF', font: '"Inter", sans-serif' },
                { id: 'elegant', name: 'Zarif', theme: '#9E7676', bg: '#FFF8F3', card: '#FFFFFF', font: '"Playfair Display", serif' },
                { id: 'retro', name: 'Retro Yeşil', theme: '#4ADE80', bg: '#000000', card: '#1A1A1A', font: '"VT323", monospace' },
              ].map(theme => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    saveToHistory();
                    setThemeColor(theme.theme);
                    setBgColor(theme.bg);
                    setCardBgColor(theme.card);
                    setThemeFont(theme.font);
                  }}
                  className="p-3 border-2 border-admin-border hover:scale-105 transition-transform flex items-center gap-3 text-left bg-admin-surface shadow-admin-pixel-sm hover:shadow-admin-pixel"
                >
                  <div className="w-8 h-8 border-2 border-admin-border shrink-0" style={{ backgroundColor: theme.theme }}></div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm uppercase truncate">{theme.name}</div>
                    <div className="text-xs opacity-60 italic truncate">Font: {theme.font.split(',')[0].replace(/"/g, '')}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-admin-bg border-4 border-admin-border shadow-admin-pixel p-6 space-y-6">
            <h2 className="text-2xl font-bold uppercase mb-4 border-b-2 border-admin-border pb-2">Ana Marka & Renk</h2>

            <div>
              <label className="block font-bold mb-2">Restoran Logosu</label>
              {selectedRestaurant?.logo_url && !logoFile && (
                <div className="mb-2"><img src={selectedRestaurant.logo_url} alt="Logo" className="h-16 object-contain" /></div>
              )}
              <input type="file" accept="image/*" onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setLogoFile(e.target.files[0]);
                }
              }} className="block w-full text-sm text-admin-text file:mr-4 file:py-2 file:px-4 file:border-2 file:border-admin-border file:bg-brand file:text-surface file:font-bold hover:file:opacity-90 cursor-pointer" />
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

          <div className="bg-admin-bg border-4 border-admin-border shadow-admin-pixel p-6 space-y-6">
            <h2 className="text-2xl font-bold uppercase mb-4 border-b-2 border-admin-border pb-2">Arka Plan & Zemin</h2>
            
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
                    className={`px-4 py-3 border-2 border-admin-border font-bold transition-all text-sm ${bgImageUrl === preset.id ? 'bg-brand text-surface shadow-admin-pixel' : 'bg-admin-surface hover:bg-brand-light'}`}
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
              }} className="block w-full text-sm text-admin-text file:mr-4 file:py-2 file:px-4 file:border-2 file:border-admin-border file:bg-admin-surface file:text-admin-text file:font-bold hover:file:bg-brand-light cursor-pointer" />
              {bgUploadFile && <p className="mt-2 text-sm font-bold text-[#5b7a57]">✓ {bgUploadFile.name} seçildi</p>}
            </div>
          </div>

          <div className="bg-admin-bg border-4 border-admin-border shadow-admin-pixel p-6 space-y-6">
            <h2 className="text-2xl font-bold uppercase mb-4 border-b-2 border-admin-border pb-2">Tipografi & Şekiller</h2>
            
            <div>
              <label className="block font-bold mb-2">Yazı Tipi Ailesi</label>
              <select value={themeFont} onChange={e => { saveToHistory(); setThemeFont(e.target.value); }} className="w-full px-4 py-3 border-2 border-admin-border bg-admin-surface font-bold focus:outline-none">
                {FONT_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-2">Yazı Boyutu ({parseInt(fontSize || '16') || (fontSize === 'small' ? 14 : fontSize === 'large' ? 20 : fontSize === 'xlarge' ? 24 : 16)}px)</label>
              <div className="bg-admin-surface border-2 border-admin-border p-4 flex items-center gap-4">
                  <span className="text-sm font-bold">A</span>
                  <input 
                    type="range" 
                    min="12" 
                    max="28" 
                    step="1" 
                    value={parseInt(fontSize || '16') || (fontSize === 'small' ? 14 : fontSize === 'large' ? 20 : fontSize === 'xlarge' ? 24 : 16)}
                    onChange={(e) => { setFontSize(e.target.value); }}
                    onMouseUp={saveToHistory}
                    onTouchEnd={saveToHistory}
                    className="flex-1 accent-brand cursor-pointer"
                  />
                  <span className="text-2xl font-bold">A</span>
                </div>
              </div>
  
              <div>
                <label className="block font-bold mb-2">Buton Şekilleri</label>
              <select value={buttonShape} onChange={e => { saveToHistory(); setButtonShape(e.target.value); }} className="w-full px-4 py-3 border-2 border-admin-border bg-admin-surface font-bold focus:outline-none">
                {BUTTON_SHAPE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-admin-bg border-4 border-admin-border shadow-admin-pixel p-6 space-y-6">
            <h2 className="text-2xl font-bold uppercase mb-4 border-b-2 border-admin-border pb-2">Menü Yerleşimi</h2>
            
            <div>
              <label className="block font-bold mb-2">Başlık Tasarımı</label>
              <select value={headerStyle} onChange={e => { saveToHistory(); setHeaderStyle(e.target.value as any); }} className="w-full px-4 py-3 border-2 border-admin-border bg-admin-surface font-bold focus:outline-none">
                {HEADER_STYLE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-2">Kategori Düzeni</label>
              <select value={navStyle} onChange={e => { saveToHistory(); setNavStyle(e.target.value as any); }} className="w-full px-4 py-3 border-2 border-admin-border bg-admin-surface font-bold focus:outline-none">
                {NAV_STYLE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-2">Ürün Düzeni (Layout)</label>
              <select value={layoutStyle} onChange={e => { saveToHistory(); setLayoutStyle(e.target.value as any); }} className="w-full px-4 py-3 border-2 border-admin-border bg-admin-surface font-bold focus:outline-none">
                {LAYOUT_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-4 sticky bottom-4 z-10 p-4 bg-admin-bg border-4 border-admin-border shadow-admin-pixel">
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-brand text-surface border-2 border-admin-border font-bold uppercase text-xl hover:opacity-90 shadow-admin-pixel disabled:opacity-50 transition-transform active:translate-y-1">
              {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
            <button type="button" onClick={handleUndoSettings} disabled={settingsHistory.length === 0} className="px-6 bg-admin-surface text-admin-text border-2 border-admin-border font-bold uppercase hover:bg-brand-light shadow-admin-pixel disabled:opacity-50 transition-transform active:translate-y-1">
              Geri Al
            </button>
          </div>
        </form>
      </div>

      {/* SAĞ KOLON */}
      <div className="space-y-6 border-l-4 border-admin-border pl-8 relative w-80 shrink-0">
        <div className="sticky top-4 z-10 w-full mb-6">
          <h2 className="text-xl font-bold uppercase mb-4 flex items-center justify-between">
            <span>Canlı Önizleme</span>
            <span className="text-sm font-normal px-2 py-1 bg-brand-light border-2 border-admin-border">Demo</span>
          </h2>
          <div className="border-8 border-black rounded-[40px] shadow-2xl overflow-hidden h-[600px] w-full bg-admin-surface relative flex flex-col items-center">
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
                <div className={`w-full ${headerStyle === 'left' ? 'p-4 flex items-center gap-3 text-left' : headerStyle === 'banner' ? 'relative text-center' : 'p-4 text-center'} bg-admin-surface/80 backdrop-blur-sm shadow-sm mb-4`} style={{ color: themeColor, ...getDynamicFontStyles(fontSize).price }}>
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
                    <div className="font-bold uppercase leading-tight" style={getDynamicFontStyles(fontSize).cat}>{selectedRestaurant?.name || 'Restoran Adı'}</div>
                    <div className="opacity-70" style={getDynamicFontStyles(fontSize).desc}>{selectedRestaurant?.description || 'Kısa restoran açıklaması burada yer alır.'}</div>
                  </div>
                </div>

                {/* Nav */}
                {navStyle === 'tabs' && (
                  <div className="w-full px-2 py-3 flex gap-2 overflow-hidden border-b-2 bg-admin-surface/50 mb-4" style={{ borderColor: `${themeColor}40` }}>
                    <div className="px-3 py-1 font-bold border-2 shadow-sm whitespace-nowrap" style={{ backgroundColor: themeColor, color: 'white', borderColor: themeColor, borderRadius: buttonShape === 'pill' ? '99px' : buttonShape === 'rounded' ? '8px' : '0', ...getDynamicFontStyles(fontSize).desc }}>Popüler</div>
                    <div className="px-3 py-1 font-bold border-2 shadow-sm whitespace-nowrap bg-admin-surface" style={{ color: themeColor, borderColor: themeColor, borderRadius: buttonShape === 'pill' ? '99px' : buttonShape === 'rounded' ? '8px' : '0', ...getDynamicFontStyles(fontSize).desc }}>Tatlılar</div>
                    <div className="px-3 py-1 font-bold border-2 shadow-sm whitespace-nowrap bg-admin-surface" style={{ color: themeColor, borderColor: themeColor, borderRadius: buttonShape === 'pill' ? '99px' : buttonShape === 'rounded' ? '8px' : '0', ...getDynamicFontStyles(fontSize).desc }}>İçecekler</div>
                  </div>
                )}

                {/* İçerik Gövdesi */}
                <div className="flex-1 w-full p-2 flex flex-col gap-3">
                  {layoutStyle === 'list' && (
                    <>
                      <div className={`w-full p-3 border-2 shadow-sm flex gap-3`} style={{ borderColor: themeColor, backgroundColor: cardBgColor, borderRadius: buttonShape === 'pill' ? '12px' : buttonShape === 'rounded' ? '8px' : '0' }}>
                        <div className="w-16 h-16 bg-black/10 shrink-0 flex items-center justify-center overflow-hidden" style={{ borderRadius: buttonShape === 'pill' ? '99px' : buttonShape === 'rounded' ? '4px' : '0' }}>
                          <span className="text-xl">☕</span>
                        </div>
                        <div className="flex-1 flex flex-col min-w-0" style={{ color: getTextColorForBackground(cardBgColor) }}>
                          <div className="font-bold leading-tight mb-1 line-clamp-2" style={getDynamicFontStyles(fontSize).product}>Filtre Kahve</div>
                          <div className="opacity-70 line-clamp-2 mb-3" style={getDynamicFontStyles(fontSize).desc}>Taze demlenmiş yöresel</div>
                          <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                            <div className="font-bold flex items-center" style={{ color: themeColor, ...getDynamicFontStyles(fontSize).price }}>
                              95 ₺
                            </div>
                            <div className="w-8 h-8 shrink-0 border-2 flex items-center justify-center font-bold" style={{ borderColor: themeColor, backgroundColor: themeColor, color: 'white', borderRadius: buttonShape === 'pill' ? '99px' : buttonShape === 'rounded' ? '4px' : '0' }}>+</div>
                          </div>
                        </div>
                      </div>
                      <div className={`w-full p-3 border-2 shadow-sm flex gap-3`} style={{ borderColor: themeColor, backgroundColor: cardBgColor, borderRadius: buttonShape === 'pill' ? '12px' : buttonShape === 'rounded' ? '8px' : '0' }}>
                        <div className="w-16 h-16 bg-black/10 shrink-0 flex items-center justify-center overflow-hidden" style={{ borderRadius: buttonShape === 'pill' ? '99px' : buttonShape === 'rounded' ? '4px' : '0' }}>
                          <span className="text-xl">🍰</span>
                        </div>
                        <div className="flex-1 flex flex-col min-w-0" style={{ color: getTextColorForBackground(cardBgColor) }}>
                          <div className="font-bold leading-tight mb-1 line-clamp-2" style={getDynamicFontStyles(fontSize).product}>Cheesecake</div>
                          <div className="opacity-70 line-clamp-2 mb-3" style={getDynamicFontStyles(fontSize).desc}>Orman meyveli</div>
                          <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                            <div className="font-bold flex items-center" style={{ color: themeColor, ...getDynamicFontStyles(fontSize).price }}>
                              140 ₺
                            </div>
                            <div className="w-8 h-8 shrink-0 border-2 flex items-center justify-center font-bold" style={{ borderColor: themeColor, backgroundColor: themeColor, color: 'white', borderRadius: buttonShape === 'pill' ? '99px' : buttonShape === 'rounded' ? '4px' : '0' }}>+</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {layoutStyle === 'grid' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`p-3 border-2 shadow-sm flex flex-col`} style={{ borderColor: themeColor, backgroundColor: cardBgColor, borderRadius: buttonShape === 'pill' ? '12px' : buttonShape === 'rounded' ? '8px' : '0' }}>
                        <div className="w-full h-24 bg-black/10 mb-3 flex items-center justify-center overflow-hidden" style={{ borderRadius: buttonShape === 'pill' ? '8px' : buttonShape === 'rounded' ? '4px' : '0' }}>
                          <span className="text-3xl">🍔</span>
                        </div>
                        <div className="font-bold mb-1 line-clamp-2" style={{ color: getTextColorForBackground(cardBgColor), ...getDynamicFontStyles(fontSize).product }}>Burger</div>
                        <div className="font-bold mt-auto" style={{ color: themeColor, ...getDynamicFontStyles(fontSize).price }}>210 ₺</div>
                      </div>
                      <div className={`p-3 border-2 shadow-sm flex flex-col`} style={{ borderColor: themeColor, backgroundColor: cardBgColor, borderRadius: buttonShape === 'pill' ? '12px' : buttonShape === 'rounded' ? '8px' : '0' }}>
                        <div className="w-full h-24 bg-black/10 mb-3 flex items-center justify-center overflow-hidden" style={{ borderRadius: buttonShape === 'pill' ? '8px' : buttonShape === 'rounded' ? '4px' : '0' }}>
                          <span className="text-3xl">🍹</span>
                        </div>
                        <div className="font-bold mb-1 line-clamp-2" style={{ color: getTextColorForBackground(cardBgColor), ...getDynamicFontStyles(fontSize).product }}>Limonata</div>
                        <div className="font-bold mt-auto" style={{ color: themeColor, ...getDynamicFontStyles(fontSize).price }}>85 ₺</div>
                      </div>
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
