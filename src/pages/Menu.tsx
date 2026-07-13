import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { useParams } from 'react-router-dom';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface Restaurant {
  id: string;
  name: string;
  user_id: string;
  logo_url?: string;
  primary_color?: string;
  font_family?: string;
  font_size?: string;
  background_color?: string;
  background_image_url?: string;
  button_shape?: string;
  description?: string;
  address?: string;
  layout_style?: 'list' | 'grid' | 'canvas';
}

interface Category { id: string; name: string; restaurant_id: string; pos_x?: number; pos_y?: number; }
interface Product { id: string; name: string; description?: string; price: number; category_id: string; image_url?: string; }
interface CartItem { product: Product; quantity: number; }

// --- DİL SİSTEMİ ---
type LangCode = 'tr' | 'en' | 'de' | 'ar' | 'ru' | 'fr';

const LANGUAGES: Record<LangCode, { flag: string; label: string; rtl?: boolean }> = {
  tr: { flag: '🇹🇷', label: 'Türkçe' },
  en: { flag: '🇬🇧', label: 'English' },
  de: { flag: '🇩🇪', label: 'Deutsch' },
  ar: { flag: '🇸🇦', label: 'العربية', rtl: true },
  ru: { flag: '🇷🇺', label: 'Русский' },
  fr: { flag: '🇫🇷', label: 'Français' },
};

const T: Record<LangCode, {
  subtitle: string;
  sortBy: string;
  cheapest: string;
  priciest: string;
  resetSort: string;
  loading: string;
  notFound: string;
  developer: string;
  mapsLink: string;
  cart: string;
  total: string;
  emptyCart: string;
}> = {
  tr: {
    subtitle: '~ Dijital Menü ~',
    sortBy: 'SIRALAMA:',
    cheapest: 'Ucuzdan ↑',
    priciest: 'Pahalıdan ↓',
    resetSort: '✕',
    loading: 'Yükleniyor...',
    notFound: 'Böyle bir menü bulunamadı (Geçersiz QR).',
    developer: 'Geliştirici: Arda Berke Aday',
    mapsLink: 'Haritada Göster ↗',
    cart: 'Sepetim', total: 'Toplam', emptyCart: 'Sepetiniz boş.',
  },
  en: {
    subtitle: '~ Digital Menu ~',
    sortBy: 'SORT BY:',
    cheapest: 'Cheapest ↑',
    priciest: 'Priciest ↓',
    resetSort: '✕',
    loading: 'Loading...',
    notFound: 'Menu not found (Invalid QR code).',
    developer: 'Developer: Arda Berke Aday',
    mapsLink: 'View on Maps ↗',
    cart: 'My Cart', total: 'Total', emptyCart: 'Your cart is empty.',
  },
  de: {
    subtitle: '~ Digitale Speisekarte ~',
    sortBy: 'SORTIEREN:',
    cheapest: 'Günstigste ↑',
    priciest: 'Teuerste ↓',
    resetSort: '✕',
    loading: 'Lädt...',
    notFound: 'Menü nicht gefunden (Ungültiger QR-Code).',
    developer: 'Entwickler: Arda Berke Aday',
    mapsLink: 'Auf Karte anzeigen ↗',
    cart: 'Warenkorb', total: 'Gesamt', emptyCart: 'Warenkorb ist leer.',
  },
  ar: {
    subtitle: '~ القائمة الرقمية ~',
    sortBy: 'ترتيب:',
    cheapest: 'الأرخص ↑',
    priciest: 'الأغلى ↓',
    resetSort: '✕',
    loading: '...جار التحميل',
    notFound: '.(القائمة غير موجودة (رمز QR غير صالح',
    developer: 'المطوّر: Arda Berke Aday',
    mapsLink: '↗ عرض على الخريطة',
    cart: 'عربة التسوق', total: 'المجموع', emptyCart: 'عربة التسوق فارغة.',
  },
  ru: {
    subtitle: '~ Цифровое Меню ~',
    sortBy: 'СОРТИРОВКА:',
    cheapest: 'Дешевле ↑',
    priciest: 'Дороже ↓',
    resetSort: '✕',
    loading: 'Загрузка...',
    notFound: 'Меню не найдено (Недействительный QR-код).',
    developer: 'Разработчик: Arda Berke Aday',
    mapsLink: 'Показать на карте ↗',
    cart: 'Корзина', total: 'Итого', emptyCart: 'Ваша корзина пуста.',
  },
  fr: {
    subtitle: '~ Menu Numérique ~',
    sortBy: 'TRIER:',
    cheapest: 'Moins cher ↑',
    priciest: 'Plus cher ↓',
    resetSort: '✕',
    loading: 'Chargement...',
    notFound: 'Menu introuvable (QR code invalide).',
    developer: 'Développeur: Arda Berke Aday',
    mapsLink: 'Voir sur Maps ↗',
    cart: 'Mon Panier', total: 'Total', emptyCart: 'Votre panier est vide.',
  },
};

const detectLang = (): LangCode => {
  const saved = localStorage.getItem('menuLang') as LangCode | null;
  if (saved && LANGUAGES[saved]) return saved;
  const browser = navigator.language.split('-')[0].toLowerCase() as LangCode;
  if (LANGUAGES[browser]) return browser;
  return 'tr';
};
// -------------------

// Yazı boyutu Tailwind sınıfları
const getFontSizeClasses = (size?: string) => {
  switch (size) {
    case 'small':  return { cat: 'text-lg',  product: 'text-lg',  desc: 'text-sm',  price: 'text-lg'  };
    case 'large':  return { cat: 'text-3xl', product: 'text-3xl', desc: 'text-xl',  price: 'text-2xl' };
    case 'xlarge': return { cat: 'text-4xl', product: 'text-4xl', desc: 'text-2xl', price: 'text-3xl' };
    default:       return { cat: 'text-2xl', product: 'text-2xl', desc: 'text-lg',  price: 'text-xl'  };
  }
};

export default function Menu() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortByPrice, setSortByPrice] = useState<null | 'asc' | 'desc'>(null);

  // SEPET STATE'İ
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalPrice = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  // DİL STATE'İ
  const [lang, setLang] = useState<LangCode>(detectLang);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Dil değiştirme
  const changeLang = (code: LangCode) => {
    setLang(code);
    localStorage.setItem('menuLang', code);
    setLangOpen(false);
  };

  // Dışarı tıklayınca kapat
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      if (!id) return;
      const { data: restData } = await supabase.from('restaurants').select('*').eq('id', id).single();
      if (restData) {
        setRestaurant(restData);
        const { data: catData } = await supabase.from('categories').select('*').eq('restaurant_id', restData.id);
        if (catData) {
          setCategories(catData);
          const categoryIds = catData.map(c => c.id);
          const { data: prodData } = await supabase.from('products').select('*').in('category_id', categoryIds);
          if (prodData) setProducts(prodData);
        }
      }
      setLoading(false);
    };
    fetchMenu();
  }, [id]);

  const t = T[lang];
  const isRTL = LANGUAGES[lang].rtl ?? false;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-pixel text-3xl">
      {T[lang].loading}
    </div>
  );
  if (!restaurant) return (
    <div className="min-h-screen flex items-center justify-center font-pixel text-2xl text-center p-8">
      {T[lang].notFound}
    </div>
  );

  const bgValue = restaurant.background_image_url || '';
  const isCustomPhoto = bgValue.startsWith('http') || bgValue.startsWith('data:');

  const menuStyle = {
    fontFamily: restaurant.font_family || '"VT323", monospace',
    '--theme-color': restaurant.primary_color || '#8B5A2B',
    backgroundColor: restaurant.background_color || '#F4E4C1',
    backgroundImage: bgValue ? (isCustomPhoto ? `url(${bgValue})` : bgValue) : 'none',
    backgroundSize: isCustomPhoto ? 'cover' : 'auto',
    backgroundRepeat: isCustomPhoto ? 'no-repeat' : 'repeat',
    backgroundAttachment: 'fixed',
    direction: isRTL ? 'rtl' : 'ltr',
  } as React.CSSProperties;

  const borderRadiusValue =
    restaurant.button_shape === 'pill' ? '999px' :
    restaurant.button_shape === 'rounded' ? '0.75rem' : '0px';

  const radiusClass =
    restaurant.button_shape === 'rounded' ? 'rounded-xl' :
    restaurant.button_shape === 'pill' ? 'rounded-full' : 'rounded-none';

  const themeColor = restaurant.primary_color || '#8B5A2B';
  const fs = getFontSizeClasses(restaurant.font_size);

  const mapsUrl = restaurant.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`
    : null;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 text-ink tracking-wide transition-all" style={menuStyle}>

      {/* HEADER */}
      <header
        className="w-full max-w-md text-center mt-8 mb-6 bg-white/80 p-6 shadow-sm border-2 backdrop-blur-sm"
        style={{ borderColor: themeColor, borderRadius: borderRadiusValue }}
      >
        <div
          className={`w-24 h-24 bg-[#F4E4C1] border-4 mx-auto mb-4 flex items-center justify-center text-5xl font-bold uppercase overflow-hidden ${radiusClass === 'rounded-full' ? 'rounded-full' : 'rounded-none'}`}
          style={{ borderColor: themeColor, color: themeColor }}
        >
          {restaurant.logo_url
            ? <img src={restaurant.logo_url} alt="Logo" loading="lazy" className="w-full h-full object-cover" />
            : restaurant.name.charAt(0)
          }
        </div>

        <h1 className="text-4xl font-bold uppercase pb-2" style={{ color: themeColor }}>
          {restaurant.name}
        </h1>
        <p className="mt-1 text-lg uppercase tracking-widest font-bold" style={{ color: themeColor }}>
          {t.subtitle}
        </p>

        {restaurant.description && (
          <div className="mt-4 pt-4 border-t-2" style={{ borderColor: `${themeColor}40` }}>
            <p className="text-lg leading-relaxed italic opacity-90" style={{ color: themeColor }}>
              {restaurant.description}
            </p>
          </div>
        )}

        {restaurant.address && mapsUrl && (
          <div className="mt-4 pt-4 border-t-2" style={{ borderColor: `${themeColor}40` }}>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border-2 font-bold text-lg transition-all hover:opacity-80 active:scale-95"
              style={{ borderColor: themeColor, color: themeColor, backgroundColor: `${themeColor}15`, borderRadius: borderRadiusValue }}
            >
              <span>📍</span>
              <span className="leading-tight">{restaurant.address}</span>
              <span className="text-sm opacity-70 shrink-0">{t.mapsLink}</span>
            </a>
          </div>
        )}
      </header>

      {/* SIRALAMA ÇUBUĞU (Kanvas Modunda Gizle) */}
      {restaurant.layout_style !== 'canvas' && (
        <div className="w-full max-w-md mb-6 sticky top-4 z-10">
          <div
            className="flex items-center justify-between gap-2 px-4 py-3 border-2 shadow-sm backdrop-blur-sm bg-white/90"
            style={{ borderColor: themeColor, borderRadius: borderRadiusValue }}
          >
            <span className="font-bold text-lg" style={{ color: themeColor }}>{t.sortBy}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSortByPrice(sortByPrice === 'asc' ? null : 'asc')}
                className="px-3 py-1 font-bold text-lg border-2 transition-all active:scale-95"
                style={{ borderColor: themeColor, backgroundColor: sortByPrice === 'asc' ? themeColor : 'white', color: sortByPrice === 'asc' ? 'white' : themeColor, borderRadius: borderRadiusValue }}
              >
                {t.cheapest}
              </button>
              <button
                onClick={() => setSortByPrice(sortByPrice === 'desc' ? null : 'desc')}
                className="px-3 py-1 font-bold text-lg border-2 transition-all active:scale-95"
                style={{ borderColor: themeColor, backgroundColor: sortByPrice === 'desc' ? themeColor : 'white', color: sortByPrice === 'desc' ? 'white' : themeColor, borderRadius: borderRadiusValue }}
              >
                {t.priciest}
              </button>
              {sortByPrice && (
                <button
                  onClick={() => setSortByPrice(null)}
                  className="px-3 py-1 font-bold text-lg border-2 transition-all active:scale-95"
                  style={{ borderColor: themeColor, backgroundColor: 'white', color: themeColor, borderRadius: borderRadiusValue }}
                >
                  {t.resetSort}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ÜRÜN LİSTESİ */}
      <main className={`w-full ${restaurant.layout_style === 'canvas' ? 'max-w-none flex-1 overflow-hidden' : restaurant.layout_style === 'grid' ? 'max-w-4xl' : 'max-w-md'} ${restaurant.layout_style !== 'canvas' ? 'space-y-10' : ''}`}>
        
        {restaurant.layout_style === 'canvas' ? (
          <div className="w-full h-[60vh] border-4 bg-white/50 backdrop-blur-md relative cursor-grab active:cursor-grabbing overflow-hidden" style={{ borderColor: themeColor, borderRadius: borderRadiusValue }}>
            <div className="absolute top-2 left-0 right-0 text-center pointer-events-none z-10 opacity-70 font-bold" style={{ color: themeColor }}>
              İki parmağınızla yakınlaştırın, sürükleyerek gezin.
            </div>
            <TransformWrapper initialScale={1} minScale={0.5} maxScale={3} centerOnInit>
              <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                <div className="w-[1200px] h-[1200px] relative">
                  {categories.map(category => {
                    const categoryProducts = products.filter(p => p.category_id === category.id).sort((a, b) => (sortByPrice === 'asc' ? a.price - b.price : sortByPrice === 'desc' ? b.price - a.price : 0));
                    if (categoryProducts.length === 0) return null;
                    return (
                      <div key={category.id} className="absolute space-y-3" style={{ left: category.pos_x || 0, top: category.pos_y || 0, width: '300px' }}>
                        <div className={`text-surface px-4 py-2 border-2 inline-block font-bold uppercase shadow-sm ${radiusClass} ${fs.cat}`} style={{ backgroundColor: themeColor, borderColor: themeColor }}>
                          {category.name}
                        </div>
                        <div className="space-y-2">
                          {categoryProducts.map(product => (
                            <div key={product.id} className={`bg-white/95 border-2 p-3 shadow-sm flex flex-col gap-2 ${radiusClass}`} style={{ borderColor: themeColor }}>
                              <div className="flex gap-3 h-full">
                                {product.image_url && (
                                  <div className={`w-14 h-14 border bg-white shrink-0 overflow-hidden ${radiusClass === 'rounded-full' ? 'rounded-full' : 'rounded-none'}`} style={{ borderColor: themeColor }}>
                                    <img src={product.image_url} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <div className="flex-1 leading-tight flex flex-col justify-center">
                                  <h3 className={`font-bold uppercase ${fs.product}`} style={{ color: themeColor }}>{product.name}</h3>
                                  {product.description && <p className={`text-ink/80 leading-snug mt-1 ${fs.desc}`}>{product.description}</p>}
                                </div>
                                <div className="flex flex-col justify-between items-end shrink-0 gap-1">
                                  <div className={`font-bold ${fs.price}`} style={{ color: themeColor }}>{product.price} ₺</div>
                                  <button
                                    onClick={() => addToCart(product)}
                                    className={`w-8 h-8 flex items-center justify-center border-2 font-bold text-lg transition-all hover:scale-105 active:scale-95 ${radiusClass}`}
                                    style={{ borderColor: themeColor, backgroundColor: themeColor, color: 'white' }}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TransformComponent>
            </TransformWrapper>
          </div>
        ) : (
          <div className={restaurant.layout_style === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-8" : "space-y-10"}>
            {categories.map(category => {
              const categoryProducts = products
                .filter(p => p.category_id === category.id)
                .sort((a, b) => {
                  if (sortByPrice === 'asc') return a.price - b.price;
                  if (sortByPrice === 'desc') return b.price - a.price;
                  return 0;
                });

              if (categoryProducts.length === 0) return null;

              return (
                <div key={category.id} className="space-y-4">
                  <div
                    className={`text-surface px-6 py-2 border-2 inline-block font-bold uppercase shadow-sm ${radiusClass} ${fs.cat}`}
                    style={{ backgroundColor: themeColor, borderColor: themeColor }}
                  >
                    {category.name}
                  </div>

                  <div className={restaurant.layout_style === 'grid' ? "grid grid-cols-1 gap-4" : "space-y-4"}>
                    {categoryProducts.map(product => (
                      <div
                        key={product.id}
                        className={`bg-white/95 border-4 p-4 shadow-sm flex gap-4 backdrop-blur-sm ${radiusClass}`}
                        style={{ borderColor: themeColor }}
                      >
                        {product.image_url && (
                          <div
                            className={`w-20 h-20 border-2 bg-white shrink-0 overflow-hidden ${radiusClass === 'rounded-full' ? 'rounded-full' : 'rounded-none'}`}
                            style={{ borderColor: themeColor }}
                          >
                            <img src={product.image_url} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 flex flex-col justify-center">
                          <h3 className={`font-bold uppercase leading-none mb-2 ${fs.product}`} style={{ color: themeColor }}>
                            {product.name}
                          </h3>
                          {product.description && (
                            <p className={`text-ink/80 leading-snug ${fs.desc}`}>{product.description}</p>
                          )}
                        </div>
                        <div className="flex flex-col justify-between items-end shrink-0 gap-2">
                          <div
                            className={`bg-white border-2 px-3 py-1 font-bold whitespace-nowrap ${radiusClass} ${fs.price}`}
                            style={{ borderColor: themeColor, color: themeColor }}
                          >
                            {product.price} ₺
                          </div>
                          <button
                            onClick={() => addToCart(product)}
                            className={`w-10 h-10 flex items-center justify-center border-2 font-bold text-2xl transition-all hover:scale-105 active:scale-95 ${radiusClass}`}
                            style={{ borderColor: themeColor, backgroundColor: themeColor, color: 'white' }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="mt-auto pt-16 pb-20 text-lg font-bold opacity-80 uppercase" style={{ color: themeColor }}>
        <p>{t.developer}</p>
      </footer>

      {/* DİL SEÇİCİ — Sağ Alt Köşe */}
      <div
        ref={langRef}
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
      >
        {/* DİL PANELİ */}
        <div
          className={`flex flex-col gap-1 bg-white/95 backdrop-blur-sm border-2 shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${langOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
          style={{ borderColor: themeColor, borderRadius: borderRadiusValue }}
        >
          {(Object.entries(LANGUAGES) as [LangCode, typeof LANGUAGES[LangCode]][]).map(([code, info]) => (
            <button
              key={code}
              onClick={() => changeLang(code)}
              className="flex items-center gap-3 px-4 py-3 font-bold text-lg transition-all hover:opacity-80 whitespace-nowrap"
              style={{
                backgroundColor: lang === code ? `${themeColor}20` : 'transparent',
                color: themeColor,
                borderBottom: `1px solid ${themeColor}20`,
              }}
            >
              <span className="text-2xl">{info.flag}</span>
              <span>{info.label}</span>
              {lang === code && <span className="ml-auto text-sm">✓</span>}
            </button>
          ))}
        </div>

        {/* BAYRAK BUTONU */}
        <button
          onClick={() => setLangOpen(!langOpen)}
          className="w-14 h-14 flex items-center justify-center border-4 shadow-lg text-3xl transition-all hover:scale-110 active:scale-95"
          style={{
            backgroundColor: 'white',
            borderColor: themeColor,
            borderRadius: restaurant.button_shape === 'pill' ? '999px' : restaurant.button_shape === 'rounded' ? '0.75rem' : '0px',
            boxShadow: `0 4px 12px ${themeColor}40`,
          }}
          title={LANGUAGES[lang].label}
        >
          <span style={{ filter: langOpen ? 'brightness(0.85)' : 'none', transition: 'filter 0.2s' }}>
            {LANGUAGES[lang].flag}
          </span>
        </button>
      </div>

      {/* SEPET BUTONU */}
      {cartTotalItems > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 left-6 z-50 flex items-center gap-3 px-5 py-3 font-bold border-4 shadow-xl transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: 'white',
            borderColor: themeColor,
            color: themeColor,
            borderRadius: restaurant.button_shape === 'pill' ? '999px' : restaurant.button_shape === 'rounded' ? '1rem' : '0px',
            boxShadow: `0 4px 15px ${themeColor}40`,
          }}
        >
          <span className="text-2xl">🛒</span>
          <span className="text-xl">{cartTotalItems}</span>
        </button>
      )}

      {/* SEPET MODAL */}
      {cartOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setCartOpen(false)}>
          <div 
            className="w-full max-w-md bg-white border-4 shadow-2xl p-6 flex flex-col max-h-[80vh] overflow-hidden"
            style={{ borderColor: themeColor, borderRadius: borderRadiusValue }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b-2 pb-2" style={{ borderColor: themeColor }}>
              <h2 className="text-3xl font-bold uppercase" style={{ color: themeColor }}>{t.cart}</h2>
              <button onClick={() => setCartOpen(false)} className="text-3xl hover:opacity-70">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 py-2">
              {cart.map(item => (
                <div key={item.product.id} className="flex justify-between items-center gap-4">
                  <div className="flex-1 leading-tight">
                    <div className="font-bold uppercase" style={{ color: themeColor }}>{item.product.name}</div>
                    <div className="font-bold opacity-80">{item.product.price} ₺</div>
                  </div>
                  <div className="flex items-center gap-3 border-2 px-2 py-1 shrink-0" style={{ borderColor: themeColor, borderRadius: borderRadiusValue }}>
                    <button onClick={() => updateQuantity(item.product.id, -1)} className="text-xl font-bold px-2 hover:opacity-70">-</button>
                    <span className="font-bold text-lg w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, 1)} className="text-xl font-bold px-2 hover:opacity-70">+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t-2" style={{ borderColor: themeColor }}>
              <div className="flex justify-between items-center text-2xl font-bold uppercase mb-4" style={{ color: themeColor }}>
                <span>{t.total}:</span>
                <span>{cartTotalPrice} ₺</span>
              </div>
              <button 
                onClick={() => setCartOpen(false)}
                className="w-full py-3 text-xl font-bold border-2 transition-all active:scale-95 text-white"
                style={{ backgroundColor: themeColor, borderColor: themeColor, borderRadius: borderRadiusValue }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}