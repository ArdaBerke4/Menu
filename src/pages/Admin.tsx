import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Draggable from 'react-draggable';
import type { DraggableData, DraggableEvent } from 'react-draggable';

// --- TYPESCRIPT ARAYÜZLERİ ---
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

interface Category {
  id: string;
  name: string;
  restaurant_id: string;
  sort_order?: number;
  pos_x?: number;
  pos_y?: number;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  image_url?: string;
  sort_order?: number;
}

const PRESET_BACKGROUNDS = [
  { id: 'none', name: 'Görsel Yok', css: '' },
  {
    id: 'paper',
    name: 'İnce Kağıt Çizgisi',
    css: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.035) 0px, rgba(0,0,0,0.035) 1px, transparent 1px, transparent 5px)'
  },
  {
    id: 'grid',
    name: 'Kareli Defter',
    css: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.07) 0px, rgba(0,0,0,0.07) 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, rgba(0,0,0,0.07) 0px, rgba(0,0,0,0.07) 1px, transparent 1px, transparent 28px)'
  },
  {
    id: 'weave',
    name: 'Ekose Doku (Kafe)',
    css: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 14px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 14px)'
  },
  {
    id: 'dark',
    name: 'Karanlık Gece',
    css: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 10px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 10px)'
  }
];

const FONT_SIZE_OPTIONS = [
  { value: 'small',  label: 'Küçük',     previewSize: '0.85rem' },
  { value: 'medium', label: 'Normal',    previewSize: '1rem'    },
  { value: 'large',  label: 'Büyük',     previewSize: '1.2rem'  },
  { value: 'xlarge', label: 'Çok Büyük', previewSize: '1.5rem'  },
];

// Yazı boyutuna göre Tailwind sınıf haritası
const getFontSizeClasses = (size?: string) => {
  switch (size) {
    case 'small':  return { cat: 'text-lg',  product: 'text-lg',  desc: 'text-sm',  price: 'text-lg'  };
    case 'large':  return { cat: 'text-3xl', product: 'text-3xl', desc: 'text-xl',  price: 'text-2xl' };
    case 'xlarge': return { cat: 'text-4xl', product: 'text-4xl', desc: 'text-2xl', price: 'text-3xl' };
    default:       return { cat: 'text-2xl', product: 'text-2xl', desc: 'text-lg',  price: 'text-xl'  };
  }
};

const DEFAULT_BG_COLOR = '#F4E4C1';
// -----------------------------

function SortableCategoryItem({ category, onUp, onDown, isFirst, isLast }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between bg-white border-2 border-brand-dark px-4 py-2 mb-2 z-10 relative">
      <div className="flex items-center gap-3">
        <button type="button" {...attributes} {...listeners} className="cursor-grab hover:text-brand text-2xl" title="Sürükle">⣿</button>
        <span className="font-bold truncate">{category.name}</span>
      </div>
      <div className="flex gap-2 shrink-0">
        <button type="button" onClick={() => onUp(category)} disabled={isFirst} className="w-8 h-8 flex items-center justify-center bg-brand-light border-2 border-brand-dark font-bold hover:bg-white disabled:opacity-30">▲</button>
        <button type="button" onClick={() => onDown(category)} disabled={isLast} className="w-8 h-8 flex items-center justify-center bg-brand-light border-2 border-brand-dark font-bold hover:bg-white disabled:opacity-30">▼</button>
      </div>
    </div>
  );
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'menu' | 'about' | 'settings'>('dashboard');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // TOPLU ZAM/İNDİRİM PANELİ STATE'LERİ
  const [bulkMode, setBulkMode] = useState<null | 'increase' | 'decrease'>(null);
  const [bulkValueType, setBulkValueType] = useState<'percent' | 'fixed'>('percent');
  const [bulkValue, setBulkValue] = useState('');

  const [myRestaurants, setMyRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [newRestaurantName, setNewRestaurantName] = useState('');

  // TEMA AYARLARI
  const [themeColor, setThemeColor] = useState('#8B5A2B');
  const [themeFont, setThemeFont] = useState('"VT323", monospace');
  const [fontSize, setFontSize] = useState('medium');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bgColor, setBgColor] = useState(DEFAULT_BG_COLOR);
  const [bgImageUrl, setBgImageUrl] = useState('');
  const [bgUploadFile, setBgUploadFile] = useState<File | null>(null);
  const [buttonShape, setButtonShape] = useState('square');
  const [layoutStyle, setLayoutStyle] = useState<'list' | 'grid' | 'canvas'>('list');

  // RESTORAN HAKKINDA
  const [restaurantDescription, setRestaurantDescription] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');

  // MENÜ YÖNETİMİ
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // ARAMA, FİLTRELEME VE TOPLU İŞLEM
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [sortByPrice, setSortByPrice] = useState<null | 'asc' | 'desc'>(null);

  // Canlı önizleme için hesaplanan değerler
  const previewFs = getFontSizeClasses(fontSize);
  const previewBorderRadius = buttonShape === 'pill' ? '999px' : buttonShape === 'rounded' ? '0.75rem' : '0px';
  const isStandard = bgColor === DEFAULT_BG_COLOR && !bgImageUrl && !bgUploadFile;

  // DND Sensörleri
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const fetchAllRestaurants = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth'); return; }
      const { data: restData } = await supabase.from('restaurants').select('*').eq('user_id', session.user.id).order('id', { ascending: true });
      if (restData) setMyRestaurants(restData);
    };
    fetchAllRestaurants();
  }, [navigate]);

  const handleEnterRestaurant = async (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setThemeColor(restaurant.primary_color || '#8B5A2B');
    setThemeFont(restaurant.font_family || '"VT323", monospace');
    setFontSize(restaurant.font_size || 'medium');
    setBgColor(restaurant.background_color || DEFAULT_BG_COLOR);
    setBgImageUrl(restaurant.background_image_url || '');
    setButtonShape(restaurant.button_shape || 'square');
    setLayoutStyle(restaurant.layout_style || 'list');
    setRestaurantDescription(restaurant.description || '');
    setRestaurantAddress(restaurant.address || '');
    setActiveTab('menu');
    setSearchTerm(''); setFilterCategoryId(''); setSelectedProductIds([]);
    setBulkMode(null); setBulkValue('');
    setSortByPrice(null);

    const { data: catData } = await supabase.from('categories').select('*').eq('restaurant_id', restaurant.id).order('sort_order', { ascending: true });
    if (catData && catData.length > 0) {
      setCategories(catData); setSelectedCategoryId(catData[0].id);
      const categoryIds = catData.map(c => c.id);
      const { data: prodData } = await supabase.from('products').select('*').in('category_id', categoryIds).order('sort_order', { ascending: true });
      if (prodData) setProducts(prodData);
    } else { setCategories([]); setProducts([]); }
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data, error } = await supabase.from('restaurants').insert([{ name: newRestaurantName, user_id: session.user.id }]).select().single();
    if (!error && data) { setMyRestaurants([...myRestaurants, data]); setNewRestaurantName(''); alert("Yeni restoran eklendi!"); }
    setLoading(false);
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selectedRestaurant) return; setLoading(true);
    let finalLogoUrl = selectedRestaurant.logo_url;
    let finalBgImageUrl = bgImageUrl;

    if (logoFile) {
      const fileName = `logo_${Math.random()}.${logoFile.name.split('.').pop()}`;
      const { data: imgData, error } = await supabase.storage.from('product-images').upload(fileName, logoFile);
      if (!error && imgData) finalLogoUrl = supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl;
    }
    if (bgUploadFile) {
      const fileName = `bg_${Math.random()}.${bgUploadFile.name.split('.').pop()}`;
      const { data: bgData, error } = await supabase.storage.from('product-images').upload(fileName, bgUploadFile);
      if (!error && bgData) finalBgImageUrl = supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl;
    }

    const { data, error } = await supabase.from('restaurants').update({
      primary_color: themeColor,
      font_family: themeFont,
      font_size: fontSize,
      logo_url: finalLogoUrl,
      background_color: bgColor,
      background_image_url: finalBgImageUrl,
      button_shape: buttonShape,
      layout_style: layoutStyle,
    }).eq('id', selectedRestaurant.id).select().single();

    if (error) alert("Güncelleme başarısız: " + error.message);
    else if (data) {
      setSelectedRestaurant(data);
      setBgImageUrl(finalBgImageUrl);
      setBgUploadFile(null);
      setMyRestaurants(myRestaurants.map(r => r.id === data.id ? data : r));
      alert("Görünüm ayarları başarıyla kaydedildi!");
    }
    setLoading(false);
  };

  const handleUpdateAbout = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selectedRestaurant) return; setLoading(true);
    const { data, error } = await supabase.from('restaurants').update({
      description: restaurantDescription,
      address: restaurantAddress,
    }).eq('id', selectedRestaurant.id).select().single();
    if (error) alert("Güncelleme başarısız: " + error.message);
    else if (data) {
      setSelectedRestaurant(data);
      setMyRestaurants(myRestaurants.map(r => r.id === data.id ? data : r));
      alert("Restoran bilgileri kaydedildi!");
    }
    setLoading(false);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const nextOrder = categories.length > 0 ? Math.max(...categories.map(c => c.sort_order ?? 0)) + 1 : 0;
    const { data } = await supabase.from('categories').insert([{ name: categoryName, restaurant_id: selectedRestaurant?.id, sort_order: nextOrder }]).select();
    if (data) { setCategoryName(''); setCategories([...categories, data[0]]); if (!selectedCategoryId) setSelectedCategoryId(data[0].id); }
    setLoading(false);
  };

  const moveCategory = async (category: Category, direction: 'up' | 'down') => {
    const sorted = [...categories].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const index = sorted.findIndex(c => c.id === category.id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;
    const current = sorted[index];
    const swapWith = sorted[swapIndex];
    const currentOrder = current.sort_order ?? index;
    const swapOrder = swapWith.sort_order ?? swapIndex;
    setLoading(true);
    await Promise.all([
      supabase.from('categories').update({ sort_order: swapOrder }).eq('id', current.id),
      supabase.from('categories').update({ sort_order: currentOrder }).eq('id', swapWith.id)
    ]);
    setCategories(categories.map(c => {
      if (c.id === current.id) return { ...c, sort_order: swapOrder };
      if (c.id === swapWith.id) return { ...c, sort_order: currentOrder };
      return c;
    }));
    setLoading(false);
  };

  const handleDragEndCategories = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = categories.findIndex(c => c.id === active.id);
      const newIndex = categories.findIndex(c => c.id === over?.id);
      
      const newCategories = arrayMove(categories, oldIndex, newIndex);
      
      // Update sort orders based on new array order
      const updatedCategories = newCategories.map((c, idx) => ({ ...c, sort_order: idx }));
      setCategories(updatedCategories);

      // Async save to db
      const promises = updatedCategories.map(c => supabase.from('categories').update({ sort_order: c.sort_order }).eq('id', c.id));
      await Promise.all(promises);
    }
  };

  const handleCanvasDragStop = (e: DraggableEvent, data: DraggableData, category: Category) => {
    const newX = data.x;
    const newY = data.y;
    setCategories(categories.map(c => c.id === category.id ? { ...c, pos_x: newX, pos_y: newY } : c));
    supabase.from('categories').update({ pos_x: newX, pos_y: newY }).eq('id', category.id).then();
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    let imageUrl = editingProductId ? products.find(p => p.id === editingProductId)?.image_url : null;
    if (imageFile) {
      const fileName = `${Math.random()}.${imageFile.name.split('.').pop()}`;
      const { data: imgData } = await supabase.storage.from('product-images').upload(fileName, imageFile);
      if (imgData) imageUrl = supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl;
    }
    if (editingProductId) {
      const { data } = await supabase.from('products').update({ name: productName, description: productDesc, price: parseFloat(productPrice), category_id: selectedCategoryId, image_url: imageUrl }).eq('id', editingProductId).select();
      if (data) { setProducts(products.map(p => p.id === editingProductId ? data[0] : p)); resetProductForm(); }
    } else {
      const siblingCount = products.filter(p => p.category_id === selectedCategoryId).length;
      const { data } = await supabase.from('products').insert([{ name: productName, description: productDesc, price: parseFloat(productPrice), category_id: selectedCategoryId, image_url: imageUrl, sort_order: siblingCount }]).select();
      if (data) { setProducts([...products, data[0]]); resetProductForm(); }
    }
    setLoading(false);
  };

  const moveProduct = async (product: Product, direction: 'up' | 'down') => {
    const siblings = products.filter(p => p.category_id === product.category_id).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const index = siblings.findIndex(p => p.id === product.id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= siblings.length) return;
    const current = siblings[index];
    const swapWith = siblings[swapIndex];
    const currentOrder = current.sort_order ?? index;
    const swapOrder = swapWith.sort_order ?? swapIndex;
    setLoading(true);
    await Promise.all([
      supabase.from('products').update({ sort_order: swapOrder }).eq('id', current.id),
      supabase.from('products').update({ sort_order: currentOrder }).eq('id', swapWith.id)
    ]);
    setProducts(products.map(p => {
      if (p.id === current.id) return { ...p, sort_order: swapOrder };
      if (p.id === swapWith.id) return { ...p, sort_order: currentOrder };
      return p;
    }));
    setLoading(false);
  };

  const handleEditClick = (product: Product) => {
    setEditingProductId(product.id); setProductName(product.name); setProductDesc(product.description || '');
    setProductPrice(product.price.toString()); setSelectedCategoryId(product.category_id); setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const resetProductForm = () => {
    setEditingProductId(null); setProductName(''); setProductDesc(''); setProductPrice(''); setImageFile(null);
    const fileInput = document.getElementById('imageInput') as HTMLInputElement; if (fileInput) fileInput.value = '';
  };
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Silmek istediğine emin misin?")) return;
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (!error) { setProducts(products.filter(p => p.id !== productId)); if (editingProductId === productId) resetProductForm(); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/auth'); };
  const menuLink = selectedRestaurant ? `${window.location.origin}/menu/${selectedRestaurant.id}` : '';

  const sortedCategories = [...categories].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategoryId === '' ? true : p.category_id === filterCategoryId;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortByPrice === 'asc') return a.price - b.price;
      if (sortByPrice === 'desc') return b.price - a.price;
      if (a.category_id !== b.category_id) {
        const catA = categories.find(c => c.id === a.category_id)?.sort_order ?? 0;
        const catB = categories.find(c => c.id === b.category_id)?.sort_order ?? 0;
        return catA - catB;
      }
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedProductIds(filteredProducts.map(p => p.id));
    else setSelectedProductIds([]);
  };
  const toggleSelectProduct = (productId: string) => {
    if (selectedProductIds.includes(productId)) setSelectedProductIds(selectedProductIds.filter(id => id !== productId));
    else setSelectedProductIds([...selectedProductIds, productId]);
  };

  const handleApplyBulkAction = async () => {
    if (!bulkMode || selectedProductIds.length === 0) return;
    const value = parseFloat(bulkValue.replace(',', '.'));
    if (isNaN(value) || value <= 0) { alert("Lütfen geçerli bir sayı gir."); return; }
    setLoading(true);
    try {
      const updatePromises = selectedProductIds.map(id => {
        const product = products.find(p => p.id === id);
        if (!product) return Promise.resolve(null);
        let newPrice: number;
        if (bulkValueType === 'percent') {
          const multiplier = bulkMode === 'increase' ? (1 + value / 100) : (1 - value / 100);
          newPrice = product.price * multiplier;
        } else {
          newPrice = bulkMode === 'increase' ? product.price + value : product.price - value;
        }
        newPrice = Math.max(0, parseFloat(newPrice.toFixed(2)));
        return supabase.from('products').update({ price: newPrice }).eq('id', id).select().single();
      });
      const results = await Promise.all(updatePromises);
      const updatedProductsList = [...products];
      results.forEach(res => {
        if (res?.data) {
          const index = updatedProductsList.findIndex(p => p.id === res.data.id);
          if (index !== -1) updatedProductsList[index] = res.data;
        }
      });
      setProducts(updatedProductsList);
      setSelectedProductIds([]);
      setBulkMode(null); setBulkValue('');
      alert("İşlem başarılı!");
    } catch { alert("Toplu işlem sırasında bir hata oluştu."); }
    setLoading(false);
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    if (!window.confirm(`Seçili ${selectedProductIds.length} ürünü KALICI OLARAK SİLMEK istediğinize emin misiniz?`)) return;
    setLoading(true);
    const { error } = await supabase.from('products').delete().in('id', selectedProductIds);
    if (!error) { setProducts(products.filter(p => !selectedProductIds.includes(p.id))); setSelectedProductIds([]); alert("Seçili ürünler başarıyla silindi."); }
    setLoading(false);
  };

  // --- DASHBOARD ---
  if (activeTab === 'dashboard') {
    return (
      <div className="min-h-screen bg-surface p-10 font-pixel text-ink">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end border-b-4 border-brand-dark pb-6 mb-10">
            <h1 className="text-5xl font-bold text-brand-dark uppercase">Kontrol Paneli</h1>
            <button onClick={handleLogout} className="bg-[#d97777] text-surface px-6 py-2 border-2 border-brand-dark shadow-pixel font-bold hover:bg-[#e08d8d]">Çıkış Yap</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myRestaurants.map(rest => (
              <div key={rest.id} onClick={() => handleEnterRestaurant(rest)} className="bg-white border-4 border-brand-dark p-6 shadow-pixel cursor-pointer hover:-translate-y-2 flex flex-col items-center text-center transition-transform">
                <div className="w-24 h-24 border-4 mb-4 flex items-center justify-center text-4xl font-bold uppercase overflow-hidden" style={{ backgroundColor: rest.primary_color || '#8B5A2B', borderColor: '#1A1A1A', color: '#FFF' }}>
                  {rest.logo_url ? <img src={rest.logo_url} className="w-full h-full object-cover" /> : rest.name.charAt(0)}
                </div>
                <h2 className="text-3xl font-bold uppercase mb-2">{rest.name}</h2>
                <p className="bg-brand-light px-3 py-1 border-2 border-brand-dark text-sm font-bold">Yönetime Gir ➔</p>
              </div>
            ))}
            <div className="bg-[#e8f4e1] border-4 border-dashed border-[#8fb38a] p-6 flex flex-col justify-center">
              <h2 className="text-2xl font-bold uppercase mb-4 text-center">Yeni Şube Ekle</h2>
              <form onSubmit={handleCreateRestaurant} className="space-y-4">
                <input type="text" required value={newRestaurantName} onChange={(e) => setNewRestaurantName(e.target.value)} placeholder="Şube Adı" className="w-full px-4 py-3 border-2 border-brand-dark focus:outline-none" />
                <button type="submit" className="w-full bg-[#8fb38a] text-brand-dark border-2 border-brand-dark px-4 py-3 font-bold hover:bg-[#a3c79e] shadow-pixel">+ OLUŞTUR</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex font-pixel text-ink text-xl tracking-wide relative">

      {/* HOVER SIDEBAR */}
      <aside className="group fixed top-0 left-0 h-screen w-12 hover:w-64 bg-[#F4E4C1] border-r-4 border-brand-dark transition-all duration-300 ease-in-out z-50 overflow-hidden shadow-[4px_0_0_rgba(26,26,26,0.1)]">
        <div className="absolute inset-0 w-12 flex items-center justify-center group-hover:opacity-0 transition-opacity duration-200">
          <span className="font-bold text-brand-dark -rotate-90 whitespace-nowrap tracking-[0.3em] text-xl">MENÜ &gt;</span>
        </div>
        <div className="w-64 p-6 h-full flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
          <div className="mb-8 border-b-4 border-brand-dark pb-4">
            <h2 className="text-2xl font-bold text-brand-dark uppercase truncate">{selectedRestaurant?.name}</h2>
            <button onClick={() => setActiveTab('dashboard')} className="mt-2 text-sm text-brand underline hover:text-brand-dark">← Tüm Mekanlarıma Dön</button>
          </div>
          <nav className="flex flex-col gap-3 flex-grow">
            <button onClick={() => setActiveTab('menu')} className={`text-left px-4 py-3 border-2 border-brand-dark transition-all ${activeTab === 'menu' ? 'bg-brand text-surface shadow-pixel' : 'bg-brand-light text-brand-dark hover:bg-white'}`}>Envanter (Menü)</button>
            <button onClick={() => setActiveTab('about')} className={`text-left px-4 py-3 border-2 border-brand-dark transition-all ${activeTab === 'about' ? 'bg-brand text-surface shadow-pixel' : 'bg-brand-light text-brand-dark hover:bg-white'}`}>Restoran Hakkında</button>
            <button onClick={() => setActiveTab('settings')} className={`text-left px-4 py-3 border-2 border-brand-dark transition-all ${activeTab === 'settings' ? 'bg-brand text-surface shadow-pixel' : 'bg-brand-light text-brand-dark hover:bg-white'}`}>Görünüm Ayarları</button>
          </nav>
          <div className="mt-auto pt-6 border-t-4 border-brand-dark text-center">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(menuLink)}`} alt="QR" className="w-32 h-32 mx-auto mb-3 image-pixelated" />
            <button onClick={() => window.open(menuLink, '_blank')} className="w-full px-2 py-2 bg-[#8fb38a] border-2 border-brand-dark font-bold uppercase text-sm hover:bg-[#a3c79e] active:translate-y-1 shadow-pixel-sm">Menüyü Gör ↗</button>
            {selectedRestaurant && (
              <button
                onClick={() => navigate(`/qr/${selectedRestaurant.id}`)}
                className="w-full mt-2 px-2 py-2 bg-brand text-surface border-2 border-brand-dark font-bold uppercase text-sm hover:opacity-90 active:translate-y-1 shadow-pixel-sm"
              >
                QR Özelleştir ✦
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ANA İÇERİK */}
      <main className="flex-1 p-8 ml-12 overflow-y-auto h-screen bg-surface">

        {/* ===== RESTORAN HAKKINDA ===== */}
        {activeTab === 'about' && selectedRestaurant && (
          <div className="max-w-2xl mx-auto">
            <header className="mb-8">
              <h1 className="text-4xl font-bold uppercase mb-2">Restoran Hakkında</h1>
              <p className="text-lg text-brand-dark/60 font-bold">Bu bilgiler müşteri menüsünde logo altında görünür.</p>
            </header>
            <form onSubmit={handleUpdateAbout} className="bg-[#F4E4C1] border-4 border-brand-dark shadow-pixel p-8 space-y-6">
              <div>
                <label className="block font-bold mb-2 text-2xl">📋 Kısa Açıklama</label>
                <textarea rows={5} value={restaurantDescription} onChange={(e) => setRestaurantDescription(e.target.value)} placeholder="Örn: 2015'ten beri İstanbul'un kalbinde, evsahibi sıcaklığıyla hizmet veriyoruz..." className="w-full px-4 py-3 border-2 border-brand-dark bg-white focus:outline-none resize-none text-base leading-relaxed" />
                <p className="text-sm text-brand-dark/60 mt-1 font-bold">{restaurantDescription.length} karakter</p>
              </div>
              <div>
                <label className="block font-bold mb-2 text-2xl">📍 Adres / Konum</label>
                <input type="text" value={restaurantAddress} onChange={(e) => setRestaurantAddress(e.target.value)} placeholder="Örn: Atatürk Cad. No:12, Kadıköy / İstanbul" className="w-full px-4 py-3 border-2 border-brand-dark bg-white focus:outline-none text-base" />
                <p className="text-sm text-brand-dark/60 mt-1 font-bold">Müşteri menüsünde tıklanabilir Google Haritalar linki olarak gösterilecek.</p>
                {restaurantAddress && (
                  <div className="mt-3 flex items-center gap-3 bg-white border-2 border-[#8fb38a] px-4 py-3">
                    <span className="text-2xl">📍</span>
                    <div className="flex-1">
                      <p className="font-bold text-brand-dark text-base truncate">{restaurantAddress}</p>
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurantAddress)}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[#5b7a57] underline font-bold">Google Haritalar'da Önizle ↗</a>
                    </div>
                  </div>
                )}
              </div>
              {(restaurantDescription || restaurantAddress) && (
                <div className="border-t-2 border-brand-dark pt-6">
                  <p className="font-bold text-brand-dark mb-3 uppercase text-lg">Menüde Görünüm Önizlemesi:</p>
                  <div className="bg-white/80 border-2 border-brand-dark p-4 space-y-3 text-center">
                    {restaurantDescription && <p className="text-base leading-relaxed italic opacity-90 text-brand-dark">{restaurantDescription}</p>}
                    {restaurantAddress && (
                      <div className="inline-flex items-center gap-2 px-3 py-2 border-2 border-brand-dark font-bold text-base text-brand-dark bg-brand-light">
                        <span>📍</span><span>{restaurantAddress}</span><span className="text-sm opacity-70">↗</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <button type="submit" disabled={loading} className="w-full bg-[#8fb38a] text-brand-dark border-2 border-brand-dark px-6 py-4 shadow-pixel font-bold text-2xl hover:bg-[#a3c79e]">
                {loading ? 'KAYDEDİLİYOR...' : 'BİLGİLERİ KAYDET'}
              </button>
            </form>
          </div>
        )}

        {/* ===== GÖRÜNÜM AYARLARI ===== */}
        {activeTab === 'settings' && selectedRestaurant && (
          <div className="max-w-4xl mx-auto">
            <header className="mb-8">
              <h1 className="text-4xl font-bold uppercase mb-2">Görünüm ve Tema Ayarları</h1>
            </header>

            <form onSubmit={handleUpdateSettings} className="bg-[#F4E4C1] border-4 border-brand-dark shadow-pixel p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">

                {/* SOL KOLON */}
                <div className="space-y-6">
                  <div>
                    <label className="block font-bold mb-2">Mekan Logosu</label>
                    <input type="file" accept="image/*" onChange={(e) => e.target.files && setLogoFile(e.target.files[0])} className="w-full bg-white px-4 py-2 border-2 border-brand-dark file:mr-4 file:bg-brand-dark file:text-surface focus:outline-none text-base" />
                  </div>

                  <div>
                    <label className="block font-bold mb-2">Marka Vurgu Rengi</label>
                    <div className="flex gap-4">
                      <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="w-16 h-12 border-2 border-brand-dark cursor-pointer bg-white p-1" />
                      <input type="text" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="flex-1 px-4 py-2 border-2 border-brand-dark bg-white focus:outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-2">Menü Yazı Tipi (Font)</label>
                    <select value={themeFont} onChange={(e) => setThemeFont(e.target.value)} className="w-full px-4 py-3 border-2 border-brand-dark bg-white focus:outline-none" style={{ fontFamily: themeFont, fontSize: themeFont.includes('VT323') ? '1.25rem' : '1rem' }}>
                      <option value='"VT323", monospace' style={{ fontFamily: '"VT323", monospace', fontSize: '1.25rem' }}>VT323 (Klasik Oyun / Cozy)</option>
                      <option value='"Courier New", Courier, monospace' style={{ fontFamily: '"Courier New", Courier, monospace' }}>Courier New (Daktilo / Retro)</option>
                      <option value='Arial, sans-serif' style={{ fontFamily: 'Arial, sans-serif' }}>Arial (Sade / Modern)</option>
                      <option value='"Times New Roman", Times, serif' style={{ fontFamily: '"Times New Roman", Times, serif' }}>Times New Roman (Şık / Klasik)</option>
                    </select>
                  </div>

                  {/* YAZI BOYUTU */}
                  <div>
                    <label className="block font-bold mb-2">Menü Yazı Boyutu</label>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {FONT_SIZE_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFontSize(opt.value)}
                          className={`py-3 border-2 border-brand-dark font-bold flex flex-col items-center gap-1 transition-colors ${fontSize === opt.value ? 'bg-brand text-surface shadow-pixel' : 'bg-white text-brand-dark hover:bg-brand-light'}`}
                        >
                          <span style={{ fontSize: opt.previewSize, fontFamily: themeFont }}>A</span>
                          <span className="text-xs">{opt.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* CANLI ÖNİZLEME */}
                    <div className="border-2 border-brand-dark overflow-hidden">
                      <div className="bg-brand-dark px-3 py-1 text-surface text-sm font-bold uppercase">
                        Canlı Menü Önizlemesi
                      </div>
                      <div
                        className="p-4"
                        style={{
                          fontFamily: themeFont,
                          backgroundColor: bgColor,
                          backgroundImage: bgImageUrl && !bgUploadFile ? bgImageUrl : 'none',
                        }}
                      >
                        {/* Kategori başlığı */}
                        <div
                          className={`inline-block px-4 py-1 mb-3 font-bold uppercase text-white ${previewFs.cat}`}
                          style={{ backgroundColor: themeColor, borderRadius: previewBorderRadius }}
                        >
                          Kahveler
                        </div>
                        {/* Ürün kartı */}
                        <div
                          className="flex gap-3 bg-white/95 border-2 p-3"
                          style={{ borderColor: themeColor, borderRadius: previewBorderRadius }}
                        >
                          <div className="w-14 h-14 shrink-0 bg-gray-100 border-2 flex items-center justify-center text-2xl" style={{ borderColor: themeColor, borderRadius: previewBorderRadius }}>☕</div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold uppercase leading-tight ${previewFs.product}`} style={{ color: themeColor, fontFamily: themeFont }}>Flat White</p>
                            <p className={`text-gray-500 leading-snug ${previewFs.desc}`} style={{ fontFamily: themeFont }}>Sütlü espresso içeceği</p>
                          </div>
                          <div
                            className={`font-bold border-2 px-2 py-1 self-center whitespace-nowrap ${previewFs.price}`}
                            style={{ borderColor: themeColor, color: themeColor, fontFamily: themeFont, borderRadius: previewBorderRadius }}
                          >
                            120 ₺
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-2">Buton Şekilleri</label>
                    <select value={buttonShape} onChange={(e) => setButtonShape(e.target.value)} className="w-full px-4 py-3 border-2 border-brand-dark bg-white focus:outline-none text-base">
                      <option value='square'>Keskin Kare</option>
                      <option value='rounded'>Hafif Yuvarlak</option>
                      <option value='pill'>Tam Yuvarlak (Hap)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-2 text-brand">Menü Düzeni (Layout)</label>
                    <div className="flex flex-col gap-3">
                      <label className={`border-2 border-brand-dark p-3 cursor-pointer flex gap-3 transition-colors ${layoutStyle === 'list' ? 'bg-[#8fb38a] text-brand-dark' : 'bg-white'}`}>
                        <input type="radio" name="layout" value="list" checked={layoutStyle === 'list'} onChange={() => setLayoutStyle('list')} className="w-5 h-5 accent-brand-dark" />
                        <div>
                          <div className="font-bold">Dikey Liste</div>
                          <div className="text-sm opacity-80">Standart alt alta dizilim.</div>
                        </div>
                      </label>
                      <label className={`border-2 border-brand-dark p-3 cursor-pointer flex gap-3 transition-colors ${layoutStyle === 'grid' ? 'bg-[#8fb38a] text-brand-dark' : 'bg-white'}`}>
                        <input type="radio" name="layout" value="grid" checked={layoutStyle === 'grid'} onChange={() => setLayoutStyle('grid')} className="w-5 h-5 accent-brand-dark" />
                        <div>
                          <div className="font-bold">Izgara (Grid)</div>
                          <div className="text-sm opacity-80">Yan yana dizilmiş kartlar.</div>
                        </div>
                      </label>
                      <label className={`border-2 border-brand-dark p-3 cursor-pointer flex gap-3 transition-colors ${layoutStyle === 'canvas' ? 'bg-[#8fb38a] text-brand-dark' : 'bg-white'}`}>
                        <input type="radio" name="layout" value="canvas" checked={layoutStyle === 'canvas'} onChange={() => setLayoutStyle('canvas')} className="w-5 h-5 accent-brand-dark" />
                        <div>
                          <div className="font-bold">Serbest Tuval (Harita Modu)</div>
                          <div className="text-sm opacity-80">Kategorileri ekranda özgürce sürükle.</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* SAĞ KOLON */}
                <div className="space-y-6 border-l-4 border-brand-dark pl-8">

                  <div>
                    <label className="block font-bold mb-2">Arka Plan Rengi</label>
                    <div className="flex gap-4">
                      <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-16 h-12 border-2 border-brand-dark cursor-pointer bg-white p-1" />
                      <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 px-4 py-2 border-2 border-brand-dark bg-white focus:outline-none" />
                    </div>
                  </div>

                  {/* STANDART BUTON */}
                  <div>
                    <label className="block font-bold mb-2">Hazır Arka Plan Seçimi</label>

                    <button
                      type="button"
                      onClick={() => { setBgColor(DEFAULT_BG_COLOR); setBgImageUrl(''); setBgUploadFile(null); }}
                      className={`w-full h-14 border-4 flex items-center justify-center gap-3 font-bold text-brand-dark mb-3 transition-all ${isStandard ? 'border-[#8fb38a] ring-4 ring-[#8fb38a] scale-[1.02]' : 'border-brand-dark hover:scale-[1.02]'}`}
                      style={{ backgroundColor: DEFAULT_BG_COLOR }}
                    >
                      <span className="w-6 h-6 border-2 border-brand-dark inline-block" style={{ backgroundColor: '#8B5A2B' }} />
                      <span className="text-lg uppercase tracking-wide">
                        {isStandard ? '✓ Standart (Aktif)' : 'Standart (Admin Teması)'}
                      </span>
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      {PRESET_BACKGROUNDS.map(preset => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => { setBgImageUrl(preset.css); setBgUploadFile(null); }}
                          className={`h-16 border-2 border-brand-dark flex items-center justify-center transition-transform ${bgImageUrl === preset.css && !bgUploadFile && !isStandard ? 'ring-4 ring-[#8fb38a] scale-105' : 'hover:scale-105'}`}
                          style={{ backgroundColor: bgColor, backgroundImage: preset.css || 'none' }}
                        >
                          <span className="bg-white/90 text-brand-dark px-2 py-1 text-sm font-bold border border-brand-dark shadow-sm">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-2 text-brand">Veya Özel Arka Plan Yükle</label>
                    <input type="file" accept="image/*" onChange={(e) => { e.target.files && setBgUploadFile(e.target.files[0]); setBgImageUrl(''); }} className="w-full bg-white px-4 py-2 border-2 border-brand-dark text-sm file:mr-4 file:bg-brand-dark file:text-surface focus:outline-none" />
                    {bgUploadFile && <p className="text-xs text-[#5b7a57] mt-1 font-bold">Özel dosya seçildi.</p>}
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#8fb38a] text-brand-dark border-2 border-brand-dark px-6 py-4 shadow-pixel font-bold text-2xl hover:bg-[#a3c79e]">
                {loading ? 'KAYDEDİLİYOR...' : 'TÜM AYARLARI KAYDET'}
              </button>
            </form>
          </div>
        )}

        {/* ===== MENÜ/ENVANTER ===== */}
        {activeTab === 'menu' && selectedRestaurant && (
          <div className="max-w-[1400px] flex gap-10">
            <div className="w-[450px] shrink-0 space-y-8">
              <div className="bg-[#F4E4C1] border-4 border-brand-dark shadow-pixel p-6">
                <h2 className="text-2xl font-bold mb-4 uppercase text-brand-dark border-b-2 border-brand-dark pb-2">Yeni Kategori Ekle</h2>
                <form onSubmit={handleCreateCategory} className="flex gap-4">
                  <input type="text" required value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Örn: Kahveler..." className="flex-1 px-4 py-2 border-2 border-brand-dark bg-white focus:outline-none" />
                  <button type="submit" disabled={loading} className="bg-brand text-surface border-2 border-brand-dark px-6 py-2 shadow-pixel-sm hover:opacity-90">EKLE</button>
                </form>
              </div>

              {sortedCategories.length > 0 && (
                <div className="bg-[#F4E4C1] border-4 border-brand-dark shadow-pixel p-6">
                  {layoutStyle === 'canvas' ? (
                    <>
                      <h2 className="text-2xl font-bold mb-2 uppercase text-brand-dark border-b-2 border-brand-dark pb-2">Serbest Tuval (Harita Modu)</h2>
                      <p className="text-sm font-bold opacity-70 mb-4">Müşterilerin göreceği haritadaki kategori konumlarını ayarlayın. Kutuları tutup sürükleyin.</p>
                      <div className="relative border-4 border-dashed border-brand-dark bg-white h-[400px] overflow-hidden">
                        {categories.map(cat => (
                          <Draggable
                            key={cat.id}
                            defaultPosition={{ x: cat.pos_x || 0, y: cat.pos_y || 0 }}
                            onStop={(e, data) => handleCanvasDragStop(e, data, cat)}
                            bounds="parent"
                          >
                            <div className="absolute cursor-grab active:cursor-grabbing bg-brand text-surface font-bold px-4 py-2 border-2 border-brand-dark shadow-pixel hover:scale-105 transition-transform z-10 whitespace-nowrap">
                              {cat.name}
                            </div>
                          </Draggable>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold mb-4 uppercase text-brand-dark border-b-2 border-brand-dark pb-2">Kategori Sıralaması</h2>
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndCategories}>
                        <SortableContext items={sortedCategories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                          <div className="space-y-0">
                            {sortedCategories.map((cat, index) => (
                              <SortableCategoryItem 
                                key={cat.id} 
                                category={cat} 
                                onUp={moveCategory} 
                                onDown={moveCategory} 
                                isFirst={index === 0} 
                                isLast={index === sortedCategories.length - 1} 
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </>
                  )}
                </div>
              )}

              <div className={`bg-[#F4E4C1] border-4 border-brand-dark shadow-pixel p-6 transition-colors duration-300 ${editingProductId ? 'bg-[#e8f4e1]' : ''}`}>
                <h2 className="text-2xl font-bold mb-4 uppercase text-brand-dark border-b-2 border-brand-dark pb-2">
                  {editingProductId ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
                </h2>
                <form onSubmit={handleSubmitProduct} className="space-y-4">
                  <div>
                    <label className="block font-bold mb-1">Kategori</label>
                    <select required value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} className="w-full px-4 py-2 border-2 border-brand-dark bg-white focus:outline-none">
                      {sortedCategories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Ürün Adı</label>
                    <input type="text" required value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Örn: Flat White" className="w-full px-4 py-2 border-2 border-brand-dark bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Açıklama</label>
                    <textarea rows={2} value={productDesc} onChange={(e) => setProductDesc(e.target.value)} placeholder="Kısa açıklama..." className="w-full px-4 py-2 border-2 border-brand-dark bg-white focus:outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">{editingProductId ? 'Yeni Görsel' : 'Ürün Görseli'}</label>
                    <input id="imageInput" type="file" accept="image/*" onChange={(e) => e.target.files && setImageFile(e.target.files[0])} className="w-full bg-white px-4 py-2 border-2 border-brand-dark focus:outline-none file:mr-4 file:bg-brand-dark file:text-surface text-base" />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Fiyat (₺)</label>
                    <input type="number" required min="0" step="0.01" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="Örn: 120" className="w-full px-4 py-2 border-2 border-brand-dark bg-white focus:outline-none" />
                  </div>
                  <div className="flex gap-4 pt-2">
                    <button type="submit" disabled={loading} className="flex-1 bg-brand text-surface border-2 border-brand-dark px-4 py-3 text-lg shadow-pixel hover:opacity-90">
                      {loading ? 'BEKLEYİN...' : (editingProductId ? 'GÜNCELLE' : 'EKLE')}
                    </button>
                    {editingProductId && <button type="button" onClick={resetProductForm} className="bg-gray-300 text-brand-dark border-2 border-brand-dark px-4 py-3 text-lg shadow-pixel hover:bg-gray-400">İPTAL</button>}
                  </div>
                </form>
              </div>
            </div>

            <div className="flex-1 flex flex-col space-y-6">
              <div className="bg-[#F4E4C1] border-4 border-brand-dark shadow-pixel p-4 space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 flex border-2 border-brand-dark bg-white">
                    <span className="px-4 py-3 border-r-2 border-brand-dark bg-brand-light font-bold">ARA:</span>
                    <input type="text" placeholder="Ürün adı veya açıklama..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-4 py-2 focus:outline-none bg-transparent" />
                  </div>
                  <select value={filterCategoryId} onChange={(e) => setFilterCategoryId(e.target.value)} className="w-[250px] px-4 py-3 border-2 border-brand-dark bg-white focus:outline-none cursor-pointer">
                    <option value="">Tüm Kategoriler</option>
                    {sortedCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-brand-dark shrink-0">FİYAT SIRALA:</span>
                  <div className="flex border-2 border-brand-dark">
                    <button type="button" onClick={() => setSortByPrice(sortByPrice === 'asc' ? null : 'asc')} className={`px-4 py-2 font-bold transition-colors ${sortByPrice === 'asc' ? 'bg-brand text-surface' : 'bg-brand-light text-brand-dark hover:bg-white'}`}>Artan ↑</button>
                    <button type="button" onClick={() => setSortByPrice(sortByPrice === 'desc' ? null : 'desc')} className={`px-4 py-2 font-bold border-l-2 border-brand-dark transition-colors ${sortByPrice === 'desc' ? 'bg-brand text-surface' : 'bg-brand-light text-brand-dark hover:bg-white'}`}>Azalan ↓</button>
                  </div>
                  {sortByPrice && (
                    <>
                      <button type="button" onClick={() => setSortByPrice(null)} className="px-3 py-2 bg-gray-300 text-brand-dark border-2 border-brand-dark font-bold hover:bg-gray-400 text-sm">Sıfırla ✕</button>
                      <span className="text-sm font-bold text-[#5b7a57] bg-[#e8f4e1] border border-[#8fb38a] px-3 py-1">{sortByPrice === 'asc' ? '💰 Ucuzdan pahalıya' : '💎 Pahalıdan ucuya'}</span>
                    </>
                  )}
                </div>

                {selectedProductIds.length > 0 && (
                  <div className="bg-[#e8f4e1] border-2 border-[#8fb38a] p-3 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <span className="font-bold text-[#5b7a57] px-2">{selectedProductIds.length} Ürün Seçildi</span>
                      <div className="flex gap-3">
                        <button type="button" onClick={() => { setBulkMode(bulkMode === 'increase' ? null : 'increase'); setBulkValue(''); }} className={`font-bold border-2 border-brand-dark px-4 py-1 shadow-pixel-sm hover:scale-105 transition-transform ${bulkMode === 'increase' ? 'bg-brand text-surface' : 'bg-[#8fb38a] text-surface'}`}>+ Toplu Zam</button>
                        <button type="button" onClick={() => { setBulkMode(bulkMode === 'decrease' ? null : 'decrease'); setBulkValue(''); }} className={`font-bold border-2 border-brand-dark px-4 py-1 shadow-pixel-sm hover:scale-105 transition-transform ${bulkMode === 'decrease' ? 'bg-brand text-surface' : 'bg-brand-light text-brand-dark'}`}>- Toplu İndirim</button>
                        <button type="button" onClick={handleBulkDelete} className="bg-[#d97777] text-surface font-bold border-2 border-brand-dark px-4 py-1 shadow-pixel-sm hover:scale-105 transition-transform">Toplu Sil</button>
                      </div>
                    </div>
                    {bulkMode && (
                      <div className="flex flex-wrap items-center gap-3 bg-white border-2 border-brand-dark p-3">
                        <span className="font-bold whitespace-nowrap">{bulkMode === 'increase' ? 'Zam miktarı:' : 'İndirim miktarı:'}</span>
                        <div className="flex border-2 border-brand-dark">
                          <button type="button" onClick={() => setBulkValueType('percent')} className={`px-3 py-2 font-bold ${bulkValueType === 'percent' ? 'bg-brand text-surface' : 'bg-white text-brand-dark'}`}>Yüzde (%)</button>
                          <button type="button" onClick={() => setBulkValueType('fixed')} className={`px-3 py-2 font-bold border-l-2 border-brand-dark ${bulkValueType === 'fixed' ? 'bg-brand text-surface' : 'bg-white text-brand-dark'}`}>Sabit Tutar (₺)</button>
                        </div>
                        <div className="flex items-center border-2 border-brand-dark">
                          <input type="number" min="0" step="0.01" value={bulkValue} onChange={(e) => setBulkValue(e.target.value)} placeholder="0" className="w-24 px-3 py-2 focus:outline-none text-right" autoFocus />
                          <span className="px-3 py-2 bg-brand-light border-l-2 border-brand-dark font-bold">{bulkValueType === 'percent' ? '%' : '₺'}</span>
                        </div>
                        <button type="button" onClick={handleApplyBulkAction} disabled={loading || !bulkValue} className="bg-[#8fb38a] text-surface font-bold border-2 border-brand-dark px-5 py-2 shadow-pixel-sm hover:scale-105 disabled:opacity-50">{loading ? 'UYGULANIYOR...' : 'UYGULA'}</button>
                        <button type="button" onClick={() => { setBulkMode(null); setBulkValue(''); }} className="bg-gray-300 text-brand-dark font-bold border-2 border-brand-dark px-3 py-2 hover:bg-gray-400">İPTAL</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white border-4 border-brand-dark shadow-pixel overflow-hidden flex flex-col">
                <div className="flex items-center gap-4 border-b-4 border-brand-dark bg-[#F4E4C1] p-4 font-bold text-xl uppercase">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input type="checkbox" checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length} onChange={toggleSelectAll} className="w-6 h-6 border-2 border-brand-dark accent-[#8fb38a] cursor-pointer" />
                    Tümünü Seç
                  </label>
                  <span className="ml-auto text-brand">{filteredProducts.length} Ürün Listeleniyor</span>
                </div>
                <div className="overflow-y-auto max-h-[600px] p-4 space-y-3">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-10 font-bold text-brand-dark/50">Bu kriterlere uygun ürün bulunamadı.</div>
                  ) : (
                    filteredProducts.map(product => {
                      const siblings = products.filter(p => p.category_id === product.category_id).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
                      const siblingIndex = siblings.findIndex(p => p.id === product.id);
                      return (
                        <div key={product.id} className={`border-2 border-brand-dark p-3 flex gap-4 items-center transition-all ${selectedProductIds.includes(product.id) ? 'bg-[#e8f4e1]' : 'bg-surface hover:bg-gray-50'}`}>
                          <input type="checkbox" checked={selectedProductIds.includes(product.id)} onChange={() => toggleSelectProduct(product.id)} className="w-6 h-6 border-2 border-brand-dark accent-[#8fb38a] cursor-pointer shrink-0" />
                          {product.image_url && (
                            <div className="w-16 h-16 border-2 border-brand-dark bg-white shrink-0">
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-2xl text-brand-dark uppercase truncate">{product.name}</h3>
                            <div className="text-sm font-bold text-brand bg-brand-light px-2 py-0.5 inline-block border border-brand-dark">{categories.find(c => c.id === product.category_id)?.name || 'Bilinmeyen'}</div>
                          </div>
                          <div className="bg-white border-2 border-brand-dark text-brand-dark px-4 py-2 font-bold text-2xl shadow-pixel-sm shrink-0 w-[120px] text-right">{product.price} ₺</div>
                          <div className="flex gap-1 shrink-0 border-l-2 border-brand-dark pl-3">
                            <button onClick={() => moveProduct(product, 'up')} disabled={siblingIndex === 0 || !!sortByPrice} className="w-7 h-7 flex items-center justify-center bg-brand-light border-2 border-brand-dark font-bold hover:bg-white disabled:opacity-30 text-sm" title={sortByPrice ? 'Fiyat sıralaması aktifken taşıma devre dışı' : 'Yukarı Taşı'}>▲</button>
                            <button onClick={() => moveProduct(product, 'down')} disabled={siblingIndex === siblings.length - 1 || !!sortByPrice} className="w-7 h-7 flex items-center justify-center bg-brand-light border-2 border-brand-dark font-bold hover:bg-white disabled:opacity-30 text-sm" title={sortByPrice ? 'Fiyat sıralaması aktifken taşıma devre dışı' : 'Aşağı Taşı'}>▼</button>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0 border-l-2 border-brand-dark pl-4">
                            <button onClick={() => handleEditClick(product)} className="text-[#5b7a57] font-bold hover:scale-110 transition-transform" title="Düzenle">[✍️]</button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 font-bold hover:scale-110 transition-transform" title="Sil">[X]</button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}