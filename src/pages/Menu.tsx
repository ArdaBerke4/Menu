import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { useParams } from 'react-router-dom';
import { ProductOptionsModal } from '../components/menu/ProductOptionsModal';
import type { ProductOption } from '../types/admin';
import type { SelectedOption } from '../types/pos';


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
  layout_style?: 'list' | 'grid';
  header_style?: 'center' | 'left' | 'banner';
  nav_style?: 'scroll' | 'tabs';
  card_bg_color?: string;
}

interface Category { id: string; name: string; restaurant_id: string; pos_x?: number; pos_y?: number; }
interface Product { id: string; name: string; description?: string; price: number; category_id: string; image_url?: string; options?: ProductOption[]; }
interface CartItem { id: string; product: Product; quantity: number; note?: string; selected_options?: SelectedOption[]; }
interface Campaign { id: string; restaurant_id: string; name: string; discount_percent: number; category_id: string | null; is_active: boolean; }

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
  sendOrder: string;
  orderSuccess: string;
  callWaiter: string;
  waiterCalled: string;
  requestBill: string;
  billRequested: string;
  selectPaymentMethod: string;
  cash: string;
  creditCard: string;
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
    sendOrder: 'Siparişi Gönder', orderSuccess: 'Siparişiniz alındı! ✓',
    callWaiter: 'Garson Çağır', waiterCalled: 'Garson Çağrıldı! 🔔',
    requestBill: 'Hesap İste', billRequested: 'Hesap İstendi! 🧾',
    selectPaymentMethod: 'Ödeme Yöntemi Seçin', cash: 'Nakit 💵', creditCard: 'Kredi Kartı 💳',
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
    sendOrder: 'Send Order', orderSuccess: 'Order received! ✓',
    callWaiter: 'Call Waiter', waiterCalled: 'Waiter Called! 🔔',
    requestBill: 'Request Bill', billRequested: 'Bill Requested! 🧾',
    selectPaymentMethod: 'Select Payment Method', cash: 'Cash 💵', creditCard: 'Credit Card 💳',
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
    sendOrder: 'Bestellung Senden', orderSuccess: 'Bestellung erhalten! ✓',
    callWaiter: 'Kellner Rufen', waiterCalled: 'Kellner Gerufen! 🔔',
    requestBill: 'Rechnung Anfordern', billRequested: 'Rechnung Angefordert! 🧾',
    selectPaymentMethod: 'Zahlungsmethode Wählen', cash: 'Bargeld 💵', creditCard: 'Kreditkarte 💳',
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
    sendOrder: 'إرسال الطلب', orderSuccess: 'تم استلام الطلب! ✓',
    callWaiter: 'استدعاء النادل', waiterCalled: 'تم استدعاء النادل! 🔔',
    requestBill: 'طلب الفاتورة', billRequested: 'تم طلب الفاتورة! 🧾',
    selectPaymentMethod: 'اختر طريقة الدفع', cash: 'نقداً 💵', creditCard: 'بطاقة ائتمان 💳',
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
    sendOrder: 'Отправить Заказ', orderSuccess: 'Заказ принят! ✓',
    callWaiter: 'Позвать Официанта', waiterCalled: 'Официант Вызван! 🔔',
    requestBill: 'Попросить Счет', billRequested: 'Счет Запрошен! 🧾',
    selectPaymentMethod: 'Выберите способ оплаты', cash: 'Наличные 💵', creditCard: 'Кредитная Карта 💳',
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
    sendOrder: 'Envoyer la Commande', orderSuccess: 'Commande reçue! ✓',
    callWaiter: 'Appeler le Serveur', waiterCalled: 'Serveur Appelé! 🔔',
    requestBill: 'Demander l\'Addition', billRequested: 'Addition Demandée! 🧾',
    selectPaymentMethod: 'Sélectionnez le mode de paiement', cash: 'Espèces 💵', creditCard: 'Carte de Crédit 💳',
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
const getDynamicFontStyles = (size?: string) => {
  const baseSize = parseInt(size || '16') || (size === 'small' ? 14 : size === 'large' ? 20 : size === 'xlarge' ? 24 : 16);
  return {
    cat: { fontSize: `${baseSize * 1.25}px` },
    product: { fontSize: `${baseSize}px` },
    desc: { fontSize: `${Math.max(10, baseSize * 0.75)}px` },
    price: { fontSize: `${baseSize * 1.125}px` },
  };
};

export default function Menu() {
  const { slug } = useParams();
  const [toast, setToast] = useState<string | null>(null);
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);
  const [hasCalledWaiter, setHasCalledWaiter] = useState(false);
  const [isRequestingBill, setIsRequestingBill] = useState(false);
  const [hasRequestedBill, setHasRequestedBill] = useState(false);
  const [billMethodOpen, setBillMethodOpen] = useState(false);
  const [tableBillOrders, setTableBillOrders] = useState<any[]>([]);
  const [tableBillItems, setTableBillItems] = useState<any[]>([]);
  const [isBillLoading, setIsBillLoading] = useState(false);
  
  // MASADAN SİPARİŞ (POS) STATE'LERİ
  const [tableId, setTableId] = useState<string | null>(null);
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortByPrice, setSortByPrice] = useState<null | 'asc' | 'desc'>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // DRAG TO SCROLL FOR TABS
  const tabsRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tabsRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - tabsRef.current.offsetLeft);
    setScrollLeft(tabsRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tabsRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsRef.current.offsetLeft;
    const walk = (x - startX); // Reduced speed multiplier from 2 to 1
    tabsRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    if (categories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  // OPTIMIZATION: Memoize products by category and sort them so we don't do it on every render
  const categoryProductsMap = React.useMemo(() => {
    const map: Record<string, Product[]> = {};
    categories.forEach(c => { map[c.id] = []; });
    products.forEach(p => {
      if (map[p.category_id]) map[p.category_id].push(p);
    });
    
    // Sort products inside each category
    for (const catId in map) {
      map[catId].sort((a, b) => {
        if (sortByPrice === 'asc') return a.price - b.price;
        if (sortByPrice === 'desc') return b.price - a.price;
        return 0; // maintain original order if no sort
      });
    }
    return map;
  }, [products, categories, sortByPrice]);

  // KAMPANYA
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Kampanyalı fiyat hesapla
  const getDiscountedPrice = (product: Product): { original: number; discounted: number | null; percent: number } => {
    // En yüksek indirimi uygula (birden fazla kampanya varsa)
    let maxDiscount = 0;
    for (const camp of campaigns) {
      if (!camp.is_active) continue;
      if (camp.category_id === null || camp.category_id === product.category_id) {
        if (camp.discount_percent > maxDiscount) maxDiscount = camp.discount_percent;
      }
    }
    if (maxDiscount > 0) {
      return {
        original: product.price,
        discounted: parseFloat((product.price * (1 - maxDiscount / 100)).toFixed(2)),
        percent: maxDiscount
      };
    }
    return { original: product.price, discounted: null, percent: 0 };
  };

  // SEPET STATE'İ
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProductForOptions, setSelectedProductForOptions] = useState<Product | null>(null);

  const handleAddToCartClick = (product: Product) => {
    if (product.options && product.options.length > 0) {
      setSelectedProductForOptions(product);
    } else {
      addToCart(product, 1, '', []);
    }
  };

  const addToCart = (product: Product, quantity = 1, note = '', selected_options: SelectedOption[] = []) => {
    setCart(prev => {
      const newItemId = Math.random().toString(36).substr(2, 9);
      if (selected_options.length > 0 || note) {
        return [...prev, { id: newItemId, product, quantity, note, selected_options }];
      }
      const existing = prev.find(item => item.product.id === product.id && (!item.selected_options || item.selected_options.length === 0) && !item.note);
      if (existing) {
        return prev.map(item => item.id === existing.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { id: newItemId, product, quantity, note, selected_options }];
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === cartItemId) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const handleCallWaiter = async () => {
    if (!tableId || hasCalledWaiter) return;
    setIsCallingWaiter(true);
    const { error } = await supabase.from('tables').update({ needs_waiter: true }).eq('id', tableId);
    if (!error) {
      setHasCalledWaiter(true);
      setToast(t.waiterCalled);
      setTimeout(() => setToast(null), 3000);
      setTimeout(() => setHasCalledWaiter(false), 30000); // 30 sn cooldown
    } else {
      setToast('Hata: Garson çağrılamadı');
      setTimeout(() => setToast(null), 3000);
    }
    setIsCallingWaiter(false);
  };

  useEffect(() => {
    if (billMethodOpen && tableId) {
      const fetchBill = async () => {
        setIsBillLoading(true);
        const { data: ordersData } = await supabase.from('orders').select('*').eq('table_id', tableId).not('status', 'in', '("paid","cancelled")');
        if (ordersData && ordersData.length > 0) {
          setTableBillOrders(ordersData);
          const orderIds = ordersData.map((o: any) => o.id);
          const { data: itemsData } = await supabase.from('order_items').select('*').in('order_id', orderIds);
          if (itemsData) setTableBillItems(itemsData);
        } else {
          setTableBillOrders([]);
          setTableBillItems([]);
        }
        setIsBillLoading(false);
      };
      fetchBill();
    }
  }, [billMethodOpen, tableId]);

  const billTotal = tableBillItems.filter(i => i.status !== 'cancelled').reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);

  const handleRequestBill = async (method: 'cash' | 'card') => {
    if (!tableId || hasRequestedBill) return;
    setIsRequestingBill(true);
    setBillMethodOpen(false);
    const { error } = await supabase.from('tables').update({ wants_bill: method }).eq('id', tableId);
    if (!error) {
      setHasRequestedBill(true);
      setToast(t.billRequested);
      setTimeout(() => setToast(null), 3000);
      setTimeout(() => setHasRequestedBill(false), 60000); // 60 sn cooldown
    } else {
      setToast('Hata: Hesap istenemedi');
      setTimeout(() => setToast(null), 3000);
    }
    setIsRequestingBill(false);
  };

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalPrice = cart.reduce((acc, item) => {
    const priceInfo = getDiscountedPrice(item.product);
    const effectivePrice = priceInfo.discounted ?? priceInfo.original;
    const optionsTotal = (item.selected_options || []).reduce((sum, opt) => sum + opt.price, 0);
    return acc + ((effectivePrice + optionsTotal) * item.quantity);
  }, 0);

  // MASADAN SİPARİŞ (POS) STATE'LERİ
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const table = params.get('table');
    if (table) setTableId(table);
  }, []);

  const submitOrder = async () => {
    if (!tableId || !restaurant || cart.length === 0) return;
    setIsSubmitting(true);
    
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          restaurant_id: restaurant.id,
          table_id: tableId,
          total_amount: cartTotalPrice
        })
        .select()
        .single();
        
      if (orderError) throw orderError;
      
      const itemsToInsert = cart.map(item => {
        const priceInfo = getDiscountedPrice(item.product);
        const effectivePrice = priceInfo.discounted ?? priceInfo.original;
        return {
          order_id: order.id,
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: effectivePrice,
          note: item.note,
          selected_options: item.selected_options
        };
      });
      
      const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;
      
      setCart([]);
      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        setCartOpen(false);
      }, 3000);
    } catch (err) {
      console.error('Sipariş hatası:', err);
      alert('Sipariş gönderilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // DİL STATE'İ
  const [lang, setLang] = useState<LangCode>(detectLang);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // ÇEVİRİ STATE'İ
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Dil değiştiğinde çevirileri getir
  useEffect(() => {
    if (lang === 'tr') {
      setTranslations({});
      return;
    }

    const cacheKey = `trans_${restaurant?.id}_${lang}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setTranslations(JSON.parse(cached));
      return;
    }

    const translateBatch = async () => {
      setIsTranslating(true);
      const textsToTranslate = new Set<string>();
      categories.forEach(c => { if (c.name) textsToTranslate.add(c.name); });
      products.forEach(p => {
        if (p.name) textsToTranslate.add(p.name);
        if (p.description) textsToTranslate.add(p.description);
      });

      const textArray = Array.from(textsToTranslate);
      if (textArray.length === 0) {
        setIsTranslating(false);
        return;
      }

      const newTranslations: Record<string, string> = {};
      let batch: string[] = [];
      let batchLength = 0;
      
      const translateAndStore = async (texts: string[]) => {
        try {
          const combined = texts.join('\n');
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=tr&tl=${lang}&dt=t&q=${encodeURIComponent(combined)}`;
          const response = await fetch(url);
          const data = await response.json();
          let translatedCombined = data[0].map((item: any) => item[0]).join('');
          const translatedArray = translatedCombined.split('\n');
          
          texts.forEach((original, idx) => {
            newTranslations[original] = translatedArray[idx]?.trim() || original;
          });
        } catch (error) {
          console.error("Translation error", error);
        }
      };

      for (const text of textArray) {
        if (batchLength + text.length > 1000) {
          await translateAndStore(batch);
          batch = [text];
          batchLength = text.length;
        } else {
          batch.push(text);
          batchLength += text.length + 1;
        }
      }
      if (batch.length > 0) {
        await translateAndStore(batch);
      }

      setTranslations(newTranslations);
      sessionStorage.setItem(cacheKey, JSON.stringify(newTranslations));
      setIsTranslating(false);
    };

    translateBatch();
  }, [lang, categories, products, restaurant?.id]);

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
      if (!slug) return;
      const { data: restData } = await supabase.from('restaurants').select('*').eq('slug', slug).single();
      if (restData) {
        setRestaurant(restData);
        const { data: catData } = await supabase.from('categories').select('*').eq('restaurant_id', restData.id);
        if (catData) {
          setCategories(catData);
          const categoryIds = catData.map(c => c.id);
          const { data: prodData } = await supabase.from('products').select('*').in('category_id', categoryIds);
          if (prodData) setProducts(prodData);
        }
        // Kampanyaları çek
        const { data: campData } = await supabase.from('campaigns').select('*').eq('restaurant_id', restData.id).eq('is_active', true);
        if (campData) setCampaigns(campData);
      }
      setLoading(false);
    };
    fetchMenu();
  }, [slug]);

  const t = T[lang];
  const isRTL = LANGUAGES[lang].rtl ?? false;

  useEffect(() => {
    if (!restaurant) return;
    const bgValue = restaurant.background_image_url || '';
    const isCustomPhoto = bgValue.startsWith('http') || bgValue.startsWith('data:');
    
    document.body.style.backgroundColor = restaurant.background_color || '#F4E4C1';
    document.body.style.backgroundImage = bgValue ? (isCustomPhoto ? `url(${bgValue})` : bgValue) : 'none';
    document.body.style.backgroundSize = isCustomPhoto ? 'cover' : 'auto';
    document.body.style.backgroundRepeat = isCustomPhoto ? 'no-repeat' : 'repeat';
    document.body.style.backgroundAttachment = 'fixed';

    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundAttachment = '';
    };
  }, [restaurant]);

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

  const menuStyle = {
    fontFamily: (restaurant.font_family || '"VT323", monospace').includes('VT323') ? '"VT323", "Press Start 2P", monospace' : restaurant.font_family,
    '--theme-color': restaurant.primary_color || '#8B5A2B',
    direction: isRTL ? 'rtl' : 'ltr',
  } as React.CSSProperties;

  const borderRadiusValue =
    restaurant.button_shape === 'pill' ? '999px' :
    restaurant.button_shape === 'rounded' ? '0.75rem' : '0px';

  const radiusClass =
    restaurant.button_shape === 'rounded' ? 'rounded-xl' :
    restaurant.button_shape === 'pill' ? 'rounded-full' : 'rounded-none';

  const themeColor = restaurant.primary_color || '#8B5A2B';
  const cardBgColor = restaurant.card_bg_color || '#FFFFFF';
  const fs = getDynamicFontStyles(restaurant.font_size);

  const mapsUrl = restaurant.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`
    : null;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 text-ink tracking-wide transition-all" style={menuStyle}>

      {/* HEADER */}
      <header
        className={`w-full max-w-md mt-8 mb-6 bg-white/80 shadow-sm border-2 backdrop-blur-sm ${
          restaurant.header_style === 'left' ? 'p-6 flex flex-row items-center text-left gap-6' : 
          restaurant.header_style === 'banner' ? 'relative p-0 overflow-hidden' : 
          'p-6 text-center'
        }`}
        style={{ borderColor: themeColor, borderRadius: borderRadiusValue }}
      >
        {restaurant.header_style === 'banner' ? (
          <>
            <div className="w-full h-32 bg-brand-light border-b-2" style={{ borderColor: themeColor, backgroundImage: `url(${restaurant.background_image_url || ''})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
            <div className="px-6 pb-6 pt-12 relative text-center">
              <div
                className={`w-24 h-24 bg-[#F4E4C1] border-4 absolute -top-12 left-1/2 -translate-x-1/2 flex items-center justify-center text-5xl font-bold uppercase overflow-hidden shadow-sm ${radiusClass === 'rounded-full' ? 'rounded-full' : 'rounded-none'}`}
                style={{ borderColor: themeColor, color: themeColor }}
              >
                {restaurant.logo_url ? <img src={restaurant.logo_url} alt="Logo" loading="lazy" className="w-full h-full object-cover" /> : restaurant.name.charAt(0)}
              </div>
              <h1 className="text-4xl font-bold uppercase pb-1" style={{ color: themeColor }}>{restaurant.name}</h1>
              <p className="mt-1 text-lg uppercase tracking-widest font-bold opacity-80" style={{ color: themeColor }}>{t.subtitle}</p>
              {restaurant.description && (
                <div className="mt-4 pt-4 border-t-2" style={{ borderColor: `${themeColor}40` }}>
                  <p className="text-lg leading-relaxed italic opacity-90" style={{ color: themeColor }}>{translations[restaurant.description] || restaurant.description}</p>
                </div>
              )}
            </div>
          </>
        ) : restaurant.header_style === 'left' ? (
          <>
            <div
              className={`w-24 h-24 shrink-0 bg-[#F4E4C1] border-4 flex items-center justify-center text-5xl font-bold uppercase overflow-hidden ${radiusClass === 'rounded-full' ? 'rounded-full' : 'rounded-none'}`}
              style={{ borderColor: themeColor, color: themeColor }}
            >
              {restaurant.logo_url ? <img src={restaurant.logo_url} alt="Logo" loading="lazy" className="w-full h-full object-cover" /> : restaurant.name.charAt(0)}
            </div>
            <div className="flex-1">
                    
              <h1 className="text-3xl font-bold uppercase leading-tight" style={{ color: themeColor }}>{restaurant.name}</h1>
              <p className="mt-1 text-sm uppercase tracking-widest font-bold opacity-80" style={{ color: themeColor }}>{t.subtitle}</p>
              {restaurant.description && (
                <p className="mt-3 text-sm leading-relaxed italic opacity-90 border-l-2 pl-3" style={{ color: themeColor, borderColor: `${themeColor}40` }}>
                  {translations[restaurant.description] || restaurant.description}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <div
              className={`w-24 h-24 bg-[#F4E4C1] border-4 mx-auto mb-4 flex items-center justify-center text-5xl font-bold uppercase overflow-hidden ${radiusClass === 'rounded-full' ? 'rounded-full' : 'rounded-none'}`}
              style={{ borderColor: themeColor, color: themeColor }}
            >
              {restaurant.logo_url ? <img src={restaurant.logo_url} alt="Logo" loading="lazy" className="w-full h-full object-cover" /> : restaurant.name.charAt(0)}
            </div>
            <h1 className="text-4xl font-bold uppercase pb-2" style={{ color: themeColor }}>{restaurant.name}</h1>
            <p className="mt-1 text-lg uppercase tracking-widest font-bold opacity-80" style={{ color: themeColor }}>{t.subtitle}</p>
            {restaurant.description && (
              <div className="mt-4 pt-4 border-t-2" style={{ borderColor: `${themeColor}40` }}>
                <p className="text-lg leading-relaxed italic opacity-90" style={{ color: themeColor }}>{translations[restaurant.description] || restaurant.description}</p>
              </div>
            )}
          </>
        )}
      </header>

      {/* SIRALAMA ÇUBUĞU */}
      {true && (
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
      <main className={`w-full ${restaurant.layout_style === 'grid' ? 'max-w-4xl' : 'max-w-md'} space-y-10`}>
        
          <div className="space-y-10">
            {restaurant.nav_style === 'tabs' && (
              <div 
                ref={tabsRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                className={`flex overflow-x-auto gap-3 pb-4 mb-2 sticky top-[80px] z-10 pt-2 cursor-grab active:cursor-grabbing ${isDragging ? '' : 'snap-x'}`} 
                style={{ scrollbarWidth: 'none' }}
              >
                {categories.filter(c => (categoryProductsMap[c.id] || []).length > 0).map(category => (
                  <button
                    key={`tab-${category.id}`}
                    onClick={() => setActiveCategoryId(category.id)}
                    className={`shrink-0 px-5 py-2 font-bold uppercase transition-all snap-start ${radiusClass} border-2 shadow-sm text-sm`}
                    style={{
                      borderColor: themeColor,
                      backgroundColor: activeCategoryId === category.id ? themeColor : 'white',
                      color: activeCategoryId === category.id ? 'white' : themeColor,
                    }}
                  >
                    {translations[category.name] || category.name}
                  </button>
                ))}
              </div>
            )}
            {categories.filter(c => restaurant.nav_style === 'tabs' ? c.id === activeCategoryId : true).map(category => {
              const categoryProducts = categoryProductsMap[category.id] || [];

              if (categoryProducts.length === 0) return null;

              return (
                <div key={category.id} className="space-y-4">
                  <div
                    className={`text-surface px-6 py-2 border-2 inline-block font-bold uppercase shadow-sm ${radiusClass} ${fs.cat}`}
                    style={{ backgroundColor: themeColor, borderColor: themeColor, ...fs.cat }}
                  >
                    {translations[category.name] || category.name}
                  </div>

                  <div className={restaurant.layout_style === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                    {categoryProducts.map(product => {
                      const priceInfo = getDiscountedPrice(product);
                      return (
                      <div
                        key={product.id}
                        className={`border-4 p-4 shadow-sm flex gap-4 backdrop-blur-sm ${radiusClass}`}
                        style={{ borderColor: themeColor, backgroundColor: cardBgColor }}
                      >
                        {product.image_url && (
                          <div
                            className={`w-20 h-20 border-2 bg-white shrink-0 overflow-hidden ${radiusClass === 'rounded-full' ? 'rounded-full' : 'rounded-none'}`}
                            style={{ borderColor: themeColor }}
                          >
                            <img src={product.image_url} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 flex flex-col min-w-0">
                          <h3 className="font-bold uppercase leading-tight mb-1 line-clamp-2" style={{ color: themeColor, ...fs.product }}>
                            {translations[product.name] || product.name}
                          </h3>
                          {product.description && (
                            <p className="opacity-70 leading-relaxed mb-3 line-clamp-2" style={fs.desc}>{translations[product.description] || product.description}</p>
                          )}
                          <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              {priceInfo.discounted !== null ? (
                                <>
                                  <span className="text-xs font-bold px-2 py-0.5 bg-red-500 text-white" style={{ borderRadius: borderRadiusValue }}>%{priceInfo.percent}</span>
                                  <span className="line-through opacity-50 text-sm font-bold" style={{ color: themeColor }}>{priceInfo.original} ₺</span>
                                  <div
                                    className={`bg-white border-2 px-3 py-1 font-bold whitespace-nowrap ${radiusClass}`} style={{ borderColor: themeColor, color: themeColor, ...fs.price }}
                                  >
                                    {priceInfo.discounted} ₺
                                  </div>
                                </>
                              ) : (
                                <div
                                  className={`bg-white border-2 px-3 py-1 font-bold whitespace-nowrap ${radiusClass}`} style={{ borderColor: themeColor, color: themeColor, ...fs.price }}
                                >
                                  {product.price} ₺
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleAddToCartClick(product)}
                              className={`w-10 h-10 shrink-0 flex items-center justify-center border-2 font-bold text-2xl transition-all hover:scale-105 active:scale-95 ${radiusClass}`}
                              style={{ borderColor: themeColor, backgroundColor: themeColor, color: 'white' }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

      </main>

      <footer className="w-full max-w-md mx-auto mt-auto pt-8 pb-20 flex flex-col items-center gap-8 text-center">
        {restaurant.address && mapsUrl && (
          <div className="w-full bg-white/80 p-5 shadow-sm border-2 backdrop-blur-sm" style={{ borderColor: themeColor, borderRadius: borderRadiusValue }}>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-2 px-4 py-3 border-2 font-bold text-lg transition-all hover:opacity-80 active:scale-95 w-full"
              style={{ borderColor: themeColor, color: themeColor, backgroundColor: `${themeColor}15`, borderRadius: borderRadiusValue }}
            >
              <span className="text-3xl">📍</span>
              <span className="leading-tight">{translations[restaurant.address] || restaurant.address}</span>
              <span className="text-sm opacity-70 shrink-0 border-b" style={{ borderColor: themeColor }}>{t.mapsLink}</span>
            </a>
          </div>
        )}
        <p className="text-lg font-bold opacity-80 uppercase" style={{ color: themeColor }}>{t.developer}</p>
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
            {isTranslating ? '⏳' : LANGUAGES[lang].flag}
          </span>
        </button>
      </div>

      {/* GARSON ÇAĞIR BUTONU */}
      {tableId && (
        <div className="fixed bottom-24 left-6 z-50 flex flex-col gap-3">
          <button
            onClick={() => setBillMethodOpen(true)}
            disabled={isRequestingBill || hasRequestedBill}
            className="flex items-center justify-center w-14 h-14 rounded-full border-4 shadow-pixel font-bold text-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
            style={{ backgroundColor: hasRequestedBill ? '#a3c79e' : '#F4E4C1', borderColor: themeColor, color: themeColor }}
            title={t.requestBill}
          >
            🧾
          </button>
          
          <button
            onClick={handleCallWaiter}
            disabled={isCallingWaiter || hasCalledWaiter}
            className="flex items-center justify-center w-14 h-14 rounded-full border-4 shadow-pixel font-bold text-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
            style={{ backgroundColor: hasCalledWaiter ? '#a3c79e' : '#F4E4C1', borderColor: themeColor, color: themeColor }}
            title={t.callWaiter}
          >
            🔔
          </button>
        </div>
      )}

      {/* HESAP İSTE (ÖDEME YÖNTEMİ) MODAL */}
      {billMethodOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setBillMethodOpen(false)}>
          <div 
            className="w-full max-w-sm bg-white border-4 shadow-2xl flex flex-col max-h-[90vh]"
            style={{ borderColor: themeColor, borderRadius: borderRadiusValue }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b-2" style={{ borderColor: themeColor }}>
              <h2 className="text-xl font-bold uppercase" style={{ color: themeColor }}>{t.requestBill}</h2>
              <button onClick={() => setBillMethodOpen(false)} className="text-3xl hover:opacity-70">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-[#fdfbf7] font-mono text-[#1a1a1a]">
              {isBillLoading ? (
                <div className="text-center py-8 font-sans">{t.loading}</div>
              ) : tableBillOrders.length === 0 ? (
                <div className="text-center py-8 font-sans">Aktif sipariş bulunamadı.</div>
              ) : (
                <div className="border-2 border-dashed border-[#1a1a1a]/30 p-4 relative">
                  <div className="text-center mb-4 border-b-2 border-dashed border-[#1a1a1a]/30 pb-2">
                    <h3 className="font-bold text-xl tracking-widest">ADİSYON</h3>
                  </div>
                  <div className="space-y-2 mb-4">
                    {tableBillItems.filter(i => i.status !== 'cancelled').map(item => (
                      <div key={item.id} className="flex justify-between items-start text-sm">
                        <div className="flex-1 pr-2">
                          <span className="font-bold">{item.quantity}x</span> {item.product_name}
                        </div>
                        <span className="font-bold shrink-0">₺{(item.unit_price * item.quantity).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t-2 border-dashed border-[#1a1a1a]/30 pt-2 flex justify-between items-center font-bold text-lg">
                    <span>TOPLAM</span>
                    <span>₺{billTotal.toFixed(0)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t-2 flex flex-col gap-3" style={{ borderColor: themeColor }}>
              <div className="text-center text-sm font-bold uppercase mb-1" style={{ color: themeColor }}>{t.selectPaymentMethod}</div>
              <button 
                onClick={() => handleRequestBill('cash')}
                disabled={isBillLoading || tableBillOrders.length === 0}
                className="w-full py-3 text-lg font-bold border-2 transition-all hover:bg-slate-50 disabled:opacity-50"
                style={{ borderColor: themeColor, color: themeColor, borderRadius: borderRadiusValue }}
              >
                {t.cash}
              </button>
              <button 
                onClick={() => handleRequestBill('card')}
                disabled={isBillLoading || tableBillOrders.length === 0}
                className="w-full py-3 text-lg font-bold border-2 transition-all hover:bg-slate-50 disabled:opacity-50"
                style={{ borderColor: themeColor, color: themeColor, borderRadius: borderRadiusValue }}
              >
                {t.creditCard}
              </button>
            </div>
          </div>
        </div>
      )}

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
                <div key={item.id} className="flex justify-between items-center gap-4">
                  <div className="flex-1 leading-tight">
                    <div className="font-bold uppercase" style={{ color: themeColor }}>{translations[item.product.name] || item.product.name}</div>
                    <div className="font-bold opacity-80">{item.product.price} ₺</div>
                  
                    {item.selected_options && item.selected_options.length > 0 && (
                      <div className="text-xs mt-1 opacity-70">
                        {item.selected_options.map((opt, i) => (
                          <div key={i}>+ {opt.choiceName} {opt.price > 0 && `(${opt.price} ₺)`}</div>
                        ))}
                      </div>
                    )}
                    {item.note && (
                      <div className="text-xs mt-1 opacity-70 italic">Not: {item.note}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 border-2 px-2 py-1 shrink-0" style={{ borderColor: themeColor, borderRadius: borderRadiusValue }}>
                    <button onClick={() => updateQuantity(item.id, -1)} className="text-xl font-bold px-2 hover:opacity-70">-</button>
                    <span className="font-bold text-lg w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="text-xl font-bold px-2 hover:opacity-70">+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t-2" style={{ borderColor: themeColor }}>
              <div className="flex justify-between items-center text-2xl font-bold uppercase mb-4" style={{ color: themeColor }}>
                <span>{t.total}:</span>
                <span>{cartTotalPrice} ₺</span>
              </div>
              {orderSuccess && (
                <div className="mb-4 text-center p-3 bg-green-100 text-green-800 border-2 border-green-400 font-bold uppercase rounded">
                  {t.orderSuccess}
                </div>
              )}
              
              {tableId ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCartOpen(false)}
                    className="w-1/3 py-3 text-xl font-bold border-2 transition-all active:scale-95 text-white"
                    style={{ backgroundColor: '#9ca3af', borderColor: '#9ca3af', borderRadius: borderRadiusValue }}
                  >
                    Kapat
                  </button>
                  <button 
                    onClick={submitOrder}
                    disabled={isSubmitting || cart.length === 0}
                    className="w-2/3 py-3 text-xl font-bold border-2 transition-all active:scale-95 text-white disabled:opacity-50"
                    style={{ backgroundColor: themeColor, borderColor: themeColor, borderRadius: borderRadiusValue }}
                  >
                    {isSubmitting ? t.loading : t.sendOrder}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setCartOpen(false)}
                  className="w-full py-3 text-xl font-bold border-2 transition-all active:scale-95 text-white"
                  style={{ backgroundColor: themeColor, borderColor: themeColor, borderRadius: borderRadiusValue }}
                >
                  Kapat
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedProductForOptions && (
        <ProductOptionsModal
          product={selectedProductForOptions}
          onClose={() => setSelectedProductForOptions(null)}
          onAddToCart={(quantity, note, selectedOptions) => {
            addToCart(selectedProductForOptions, quantity, note, selectedOptions);
            setSelectedProductForOptions(null);
          }}
        />
      )}

      {/* TOAST BİLDİRİMİ */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-brand-dark text-white px-6 py-3 rounded-full shadow-2xl font-bold border-2 border-white animate-bounce">
          {toast}
        </div>
      )}

    </div>
  );
}