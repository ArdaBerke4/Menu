import { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import { CampaignsTab } from '../components/admin/CampaignsTab';
import { SettingsTab, DEFAULT_BG_COLOR } from '../components/admin/SettingsTab';
import { MenuTab } from '../components/admin/MenuTab';
import type { Restaurant, Category, Product, Campaign } from '../types/admin';

// Types are imported from ../types/admin
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'menu' | 'about' | 'settings' | 'campaigns'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, message: string, onConfirm: () => void}>({ isOpen: false, message: '', onConfirm: () => {} });

  type ThemeState = { themeColor: string, themeFont: string, fontSize: string, bgColor: string, bgImageUrl: string, buttonShape: string, layoutStyle: string, headerStyle: string, navStyle: string, cardBgColor: string };
  const [settingsHistory, setSettingsHistory] = useState<ThemeState[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveToHistory = () => {
    setSettingsHistory(prev => [...prev, { themeColor, themeFont, fontSize, bgColor, bgImageUrl, buttonShape, layoutStyle, headerStyle, navStyle, cardBgColor }]);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
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
  const [headerStyle, setHeaderStyle] = useState<'center' | 'left' | 'banner'>('center');
  const [navStyle, setNavStyle] = useState<'scroll' | 'tabs'>('scroll');
  const [cardBgColor, setCardBgColor] = useState('#FFFFFF');

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

  // KAMPANYA YÖNETİMİ
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

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
    setHeaderStyle(restaurant.header_style || 'center');
    setNavStyle(restaurant.nav_style || 'scroll');
    setCardBgColor(restaurant.card_bg_color || '#FFFFFF');
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

    // Kampanyaları çek
    const { data: campData } = await supabase.from('campaigns').select('*').eq('restaurant_id', restaurant.id).order('created_at', { ascending: false });
    if (campData) setCampaigns(campData);
    else setCampaigns([]);
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data, error } = await supabase.from('restaurants').insert([{ name: newRestaurantName, user_id: session.user.id }]).select().single();
    if (!error && data) { setMyRestaurants([...myRestaurants, data]); setNewRestaurantName(''); showToast("Yeni restoran eklendi!"); }
    setLoading(false);
  };

  const handleDeleteRestaurant = async (e: React.MouseEvent, restaurantId: string, restaurantName: string) => {
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      message: `"${restaurantName}" şubesini ve içindeki tüm menü verilerini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setLoading(true);
        const { error } = await supabase.from('restaurants').delete().eq('id', restaurantId);
        if (!error) {
          setMyRestaurants(myRestaurants.filter(r => r.id !== restaurantId));
          showToast(`Şube başarıyla silindi.`);
        } else {
          showToast(`Silme işlemi başarısız: ${error.message}`, 'error');
        }
        setLoading(false);
      }
    });
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
      header_style: headerStyle,
      nav_style: navStyle,
      card_bg_color: cardBgColor,
    }).eq('id', selectedRestaurant.id).select().single();

    if (error) showToast("Güncelleme başarısız: " + error.message, 'error');
    else if (data) {
      setSelectedRestaurant(data);
      setBgImageUrl(finalBgImageUrl);
      setBgUploadFile(null);
      setMyRestaurants(myRestaurants.map(r => r.id === data.id ? data : r));
      showToast("Görünüm ayarları başarıyla kaydedildi!");
    }
    setLoading(false);
  };

  const handleUndoSettings = () => {
    if (settingsHistory.length > 0) {
      const last = settingsHistory[settingsHistory.length - 1];
      setThemeColor(last.themeColor);
      setThemeFont(last.themeFont);
      setFontSize(last.fontSize);
      setBgColor(last.bgColor);
      setBgImageUrl(last.bgImageUrl);
      setButtonShape(last.buttonShape);
      setLayoutStyle(last.layoutStyle as any);
      setHeaderStyle(last.headerStyle as any);
      setNavStyle(last.navStyle as any);
      setCardBgColor(last.cardBgColor);
      setSettingsHistory(prev => prev.slice(0, -1));
      showToast("Bir adım geri alındı.");
    } else if (selectedRestaurant) {
      setThemeColor(selectedRestaurant.primary_color || '#8B5A2B');
      setThemeFont(selectedRestaurant.font_family || '"VT323", monospace');
      setFontSize(selectedRestaurant.font_size || 'medium');
      setBgColor(selectedRestaurant.background_color || DEFAULT_BG_COLOR);
      setBgImageUrl(selectedRestaurant.background_image_url || '');
      setButtonShape(selectedRestaurant.button_shape || 'square');
      setLayoutStyle(selectedRestaurant.layout_style || 'list');
      setHeaderStyle(selectedRestaurant.header_style || 'center');
      setNavStyle(selectedRestaurant.nav_style || 'scroll');
      setCardBgColor(selectedRestaurant.card_bg_color || '#FFFFFF');
      setLogoFile(null);
      setBgUploadFile(null);
      showToast("Tüm değişiklikler sıfırlandı.");
    }
  };

  const handleUpdateAbout = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selectedRestaurant) return; setLoading(true);
    const { data, error } = await supabase.from('restaurants').update({
      description: restaurantDescription,
      address: restaurantAddress,
    }).eq('id', selectedRestaurant.id).select().single();
    if (error) showToast("Güncelleme başarısız: " + error.message, 'error');
    else if (data) {
      setSelectedRestaurant(data);
      setMyRestaurants(myRestaurants.map(r => r.id === data.id ? data : r));
      showToast("Restoran bilgileri kaydedildi!");
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRestaurant) return;

    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        showToast("Excel dosyası boş.", "error");
        return;
      }

      const newCategoriesMap: Record<string, string> = {}; 
      const productsToInsert = [];
      let newCategoriesCount = 0;

      const categoryNames = [...new Set(jsonData.map((row: any) => row['Kategori']).filter(Boolean))];

      let currentMaxSortOrder = categories.length > 0 ? Math.max(...categories.map(c => c.sort_order ?? 0)) : -1;
      
      for (const catName of categoryNames) {
        const catNameStr = String(catName).trim();
        const existingCat = categories.find(c => c.name.toLowerCase() === catNameStr.toLowerCase());
        if (existingCat) {
          newCategoriesMap[catNameStr] = existingCat.id;
        } else {
          currentMaxSortOrder += 1;
          const { data: catData, error: catError } = await supabase
            .from('categories')
            .insert([{ name: catNameStr, restaurant_id: selectedRestaurant.id, sort_order: currentMaxSortOrder }])
            .select()
            .single();
          
          if (catData && !catError) {
            newCategoriesMap[catNameStr] = catData.id;
            setCategories(prev => [...prev, catData]);
            newCategoriesCount++;
          }
        }
      }

      let maxProductSortOrder = products.length > 0 ? Math.max(...products.map(p => p.sort_order ?? 0)) : -1;

      for (const row of jsonData as any[]) {
        const catName = String(row['Kategori'] || '').trim();
        const prodName = String(row['Ürün Adı'] || '').trim();
        let priceStr = row['Fiyat'];
        const desc = String(row['Açıklama'] || '').trim();

        if (!catName || !prodName || priceStr === undefined) continue;

        // Extract numbers and clean
        if (typeof priceStr === 'string') {
          priceStr = priceStr.replace(',', '.').replace(/[^0-9.]/g, '');
        }
        const price = parseFloat(priceStr);
        if (isNaN(price)) continue;

        // Match case-insensitively using the newCategoriesMap we built above
        const matchingCatName = Object.keys(newCategoriesMap).find(k => k.toLowerCase() === catName.toLowerCase());
        const catId = matchingCatName ? newCategoriesMap[matchingCatName] : null;

        if (!catId) continue;

        maxProductSortOrder += 1;
        productsToInsert.push({
          category_id: catId,
          name: prodName,
          description: desc,
          price: price,
          image_url: null,
          sort_order: maxProductSortOrder
        });
      }

      if (productsToInsert.length > 0) {
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .insert(productsToInsert)
          .select();

        if (prodData && !prodError) {
          setProducts(prev => [...prev, ...prodData]);
          showToast(`${newCategoriesCount} yeni kategori ve ${productsToInsert.length} ürün eklendi!`);
        } else {
          showToast("Ürünler eklenirken hata oluştu.", "error");
        }
      } else {
        showToast("Eklenecek geçerli ürün bulunamadı. Sütun isimlerini kontrol edin (Kategori, Ürün Adı, Fiyat).", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Excel dosyası okunurken hata oluştu.", "error");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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

  const handleCanvasDragStop = (_e: DraggableEvent, data: DraggableData, category: Category) => {
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
      const product = products.find(p => p.id === editingProductId);
      const { data, error } = await supabase.from('products').update({ 
        name: productName, 
        description: productDesc, 
        price: parseFloat(productPrice), 
        category_id: selectedCategoryId, 
        image_url: imageUrl,
        sort_order: product?.sort_order 
      }).eq('id', editingProductId).select().single();

      if (error) {
        showToast("Ürün güncellenirken hata oluştu.", 'error');
      } else if (data) {
        setProducts(products.map(p => p.id === data.id ? data : p));
        resetProductForm();
        showToast("Ürün başarıyla güncellendi!");
      }
    } else {
      const nextOrder = products.filter(p => p.category_id === selectedCategoryId).length;
      const { data, error } = await supabase.from('products').insert([{ 
        name: productName, 
        description: productDesc, 
        price: parseFloat(productPrice), 
        category_id: selectedCategoryId, 
        image_url: imageUrl, 
        sort_order: nextOrder 
      }]).select().single();
      
      if (error) {
        showToast("Ürün eklenirken hata oluştu.", 'error');
      } else if (data) {
        setProducts([...products, data]);
        resetProductForm();
        showToast("Ürün başarıyla eklendi!");
      }
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
  


  const handleInlinePriceUpdate = async (productId: string, newPrice: number) => {
    const { error } = await supabase.from('products').update({ price: newPrice }).eq('id', productId);
    if (!error) {
      setProducts(products.map(p => p.id === productId ? { ...p, price: newPrice } : p));
      showToast("Fiyat başarıyla güncellendi!");
    } else {
      showToast("Fiyat güncellenemedi: " + error.message, 'error');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setConfirmDialog({
      isOpen: true,
      message: "Bu ürünü silmek istediğine emin misin? Bu işlem geri alınamaz.",
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        const { error } = await supabase.from('products').delete().eq('id', productId);
        if (!error) { 
          setProducts(products.filter(p => p.id !== productId)); 
          if (editingProductId === productId) resetProductForm(); 
          showToast("Ürün silindi.");
        } else {
          showToast("Ürün silinemedi.", 'error');
        }
      }
    });
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/auth'); };
  const menuLink = selectedRestaurant ? `${window.location.origin}/menu/${selectedRestaurant.id}` : '';

  // KAMPANYA CRUD (Moved to CampaignsTab.tsx)

  const sortedCategories = useMemo(() => [...categories].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)), [categories]);
  const filteredProducts = useMemo(() => products
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
    }), [products, searchTerm, filterCategoryId, sortByPrice, categories]);

  // Kategoriye göre ürünleri grupla (performans için)
  const productsByCategoryId = useMemo(() => {
    const grouped: Record<string, Product[]> = {};
    for (const p of products) {
      if (!grouped[p.category_id]) grouped[p.category_id] = [];
      grouped[p.category_id].push(p);
    }
    for (const catId in grouped) {
      grouped[catId].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    }
    return grouped;
  }, [products]);

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
    if (isNaN(value) || value <= 0) { showToast("Lütfen geçerli bir sayı gir.", 'error'); return; }
    setLoading(true);
    try {
      const updatedProductsToUpsert = selectedProductIds.map(id => {
        const product = products.find(p => p.id === id);
        if (!product) return null;
        let newPrice: number;
        if (bulkValueType === 'percent') {
          const multiplier = bulkMode === 'increase' ? (1 + value / 100) : (1 - value / 100);
          newPrice = product.price * multiplier;
        } else {
          newPrice = bulkMode === 'increase' ? product.price + value : product.price - value;
        }
        newPrice = Math.max(0, parseFloat(newPrice.toFixed(2)));
        return { ...product, price: newPrice };
      }).filter(Boolean) as Product[];

      const { data, error } = await supabase.from('products').upsert(updatedProductsToUpsert).select();
      
      if (error) throw error;

      if (data) {
        const updatedProductsList = [...products];
        data.forEach(res => {
          const index = updatedProductsList.findIndex(p => p.id === res.id);
          if (index !== -1) updatedProductsList[index] = res;
        });
        setProducts(updatedProductsList);
      }

      setSelectedProductIds([]);
      setBulkMode(null); setBulkValue('');
      showToast("Toplu işlem başarıyla uygulandı!");
    } catch (error) { 
      console.error(error);
      showToast("Toplu işlem sırasında bir hata oluştu.", 'error'); 
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      message: `Seçili ${selectedProductIds.length} ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setLoading(true);
        try {
          const { error } = await supabase.from('products').delete().in('id', selectedProductIds);
          if (!error) { 
            setProducts(products.filter(p => !selectedProductIds.includes(p.id))); 
            setSelectedProductIds([]); 
            showToast("Seçili ürünler başarıyla silindi."); 
          } else {
            showToast("Silme işlemi başarısız: " + error.message, 'error');
          }
        } catch (error) {
          console.error(error);
          showToast("Silme işlemi sırasında hata oluştu.", 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // --- DASHBOARD ---
  if (activeTab === 'dashboard') {
    return (
      <>
      <div className="min-h-screen bg-surface p-10 font-pixel text-ink">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end border-b-4 border-brand-dark pb-6 mb-10">
            <h1 className="text-5xl font-bold text-brand-dark uppercase">Kontrol Paneli</h1>
            <button onClick={handleLogout} className="bg-[#d97777] text-surface px-6 py-2 border-2 border-brand-dark shadow-pixel font-bold hover:bg-[#e08d8d]">Çıkış Yap</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myRestaurants.map(rest => (
              <div key={rest.id} onClick={() => handleEnterRestaurant(rest)} className="relative bg-white border-4 border-brand-dark p-6 shadow-pixel cursor-pointer hover:-translate-y-2 flex flex-col items-center text-center transition-transform group">
                <button 
                  onClick={(e) => handleDeleteRestaurant(e, rest.id, rest.name)}
                  className="absolute top-2 right-2 bg-[#d97777] text-white border-2 border-brand-dark w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#c25a5a] shadow-pixel-sm font-bold"
                  title="Şubeyi Sil"
                >
                  ✕
                </button>
                <div className="w-24 h-24 border-4 mb-4 flex items-center justify-center text-4xl font-bold uppercase overflow-hidden" style={{ backgroundColor: rest.primary_color || '#8B5A2B', borderColor: '#1A1A1A', color: '#FFF' }}>
                  {rest.logo_url ? <img src={rest.logo_url} loading="lazy" className="w-full h-full object-cover" /> : rest.name.charAt(0)}
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

      {/* CONFIRM DIALOG */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-brand-dark/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface border-4 border-brand-dark shadow-pixel p-8 max-w-lg w-full text-center animate-scale-in flex flex-col items-center">
            <div className="w-20 h-20 bg-[#fde8e8] border-4 border-[#d97777] rounded-full flex items-center justify-center mb-6 shadow-pixel-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#d97777]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-brand-dark leading-snug">{confirmDialog.message.split('?')[0]}?</h3>
            {confirmDialog.message.split('?')[1] && (
              <p className="text-brand-dark/70 font-bold mb-8 text-lg">{confirmDialog.message.split('?')[1]}</p>
            )}
            <div className="flex gap-4 justify-center w-full">
              <button 
                onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })} 
                className="flex-1 px-6 py-4 bg-white text-brand-dark border-4 border-brand-dark font-bold hover:bg-gray-50 transition-colors shadow-pixel-sm text-lg"
              >
                Vazgeç
              </button>
              <button 
                onClick={confirmDialog.onConfirm} 
                className="flex-1 px-6 py-4 bg-[#d97777] text-white border-4 border-brand-dark font-bold hover:bg-[#c25a5a] shadow-pixel-sm transition-transform hover:-translate-y-1 text-lg"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATIONS */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
          <div className={`px-6 py-4 border-4 shadow-pixel font-bold text-lg text-white flex items-center gap-3 ${toast.type === 'success' ? 'bg-[#8fb38a] border-[#5b7a57]' : 'bg-[#d97777] border-[#8a3c3c]'}`}>
            <span>{toast.type === 'success' ? '✓' : '✕'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </>
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
            <button onClick={() => setActiveTab('campaigns')} className={`text-left px-4 py-3 border-2 border-brand-dark transition-all ${activeTab === 'campaigns' ? 'bg-brand text-surface shadow-pixel' : 'bg-brand-light text-brand-dark hover:bg-white'}`}>Kampanya Düzenle 🏷️</button>
            <button onClick={() => setActiveTab('about')} className={`text-left px-4 py-3 border-2 border-brand-dark transition-all ${activeTab === 'about' ? 'bg-brand text-surface shadow-pixel' : 'bg-brand-light text-brand-dark hover:bg-white'}`}>Restoran Hakkında</button>
            <button onClick={() => setActiveTab('settings')} className={`text-left px-4 py-3 border-2 border-brand-dark transition-all ${activeTab === 'settings' ? 'bg-brand text-surface shadow-pixel' : 'bg-brand-light text-brand-dark hover:bg-white'}`}>Görünüm Ayarları</button>
          </nav>
          <div className="mt-auto pt-6 border-t-4 border-brand-dark text-center">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(menuLink)}`} alt="QR" loading="lazy" className="w-32 h-32 mx-auto mb-3 image-pixelated" />
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

        {/* ===== KAMPANYA DÜZENLE ===== */}
        {activeTab === 'campaigns' && selectedRestaurant && (
          <CampaignsTab 
            campaigns={campaigns}
            setCampaigns={setCampaigns}
            categories={categories}
            selectedRestaurant={selectedRestaurant}
            showToast={showToast}
            setConfirmDialog={setConfirmDialog}
          />
        )}

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
          <SettingsTab
            themeColor={themeColor} setThemeColor={setThemeColor}
            themeFont={themeFont} setThemeFont={setThemeFont}
            fontSize={fontSize} setFontSize={setFontSize}
            bgColor={bgColor} setBgColor={setBgColor}
            bgImageUrl={bgImageUrl} setBgImageUrl={setBgImageUrl}
            buttonShape={buttonShape} setButtonShape={setButtonShape}
            layoutStyle={layoutStyle} setLayoutStyle={setLayoutStyle}
            headerStyle={headerStyle} setHeaderStyle={setHeaderStyle}
            navStyle={navStyle} setNavStyle={setNavStyle}
            cardBgColor={cardBgColor} setCardBgColor={setCardBgColor}
            logoFile={logoFile} setLogoFile={setLogoFile}
            bgUploadFile={bgUploadFile} setBgUploadFile={setBgUploadFile}
            selectedRestaurant={selectedRestaurant}
            saveSettings={handleUpdateSettings}
            handleUndoSettings={handleUndoSettings}
            settingsHistory={settingsHistory}
            saveToHistory={saveToHistory}
            loading={loading}
            fileInputRef={fileInputRef}
          />
        )}

        {/* ===== MENÜ/ENVANTER ===== */}
        {activeTab === 'menu' && selectedRestaurant && (
          <MenuTab
            categoryName={categoryName} setCategoryName={setCategoryName}
            handleCreateCategory={handleCreateCategory}
            loading={loading}
            fileInputRef={fileInputRef}
            handleFileUpload={handleFileUpload}
            sortedCategories={sortedCategories}
            layoutStyle={layoutStyle}
            categories={categories}
            handleCanvasDragStop={handleCanvasDragStop}
            sensors={sensors}
            handleDragEndCategories={handleDragEndCategories}
            SortableCategoryItem={SortableCategoryItem}
            moveCategory={moveCategory}
            editingProductId={editingProductId}
            handleSubmitProduct={handleSubmitProduct}
            selectedCategoryId={selectedCategoryId} setSelectedCategoryId={setSelectedCategoryId}
            productName={productName} setProductName={setProductName}
            productDesc={productDesc} setProductDesc={setProductDesc}
            setImageFile={setImageFile}
            productPrice={productPrice} setProductPrice={setProductPrice}
            resetProductForm={resetProductForm}
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            filterCategoryId={filterCategoryId} setFilterCategoryId={setFilterCategoryId}
            sortByPrice={sortByPrice} setSortByPrice={setSortByPrice}
            selectedProductIds={selectedProductIds}
            bulkMode={bulkMode} setBulkMode={setBulkMode}
            bulkValue={bulkValue} setBulkValue={setBulkValue}
            bulkValueType={bulkValueType} setBulkValueType={setBulkValueType}
            handleBulkDelete={handleBulkDelete}
            handleApplyBulkAction={handleApplyBulkAction}
            filteredProducts={filteredProducts}
            toggleSelectAll={toggleSelectAll}
            productsByCategoryId={productsByCategoryId}
            toggleSelectProduct={toggleSelectProduct}
            moveProduct={moveProduct}
            handleEditClick={handleEditClick}
            handleDeleteProduct={handleDeleteProduct}
            handleInlinePriceUpdate={handleInlinePriceUpdate}
          />
        )}
      </main>

      {/* CONFIRM DIALOG */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-brand-dark/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface border-4 border-brand-dark shadow-pixel p-8 max-w-lg w-full text-center animate-scale-in flex flex-col items-center">
            <div className="w-20 h-20 bg-[#fde8e8] border-4 border-[#d97777] rounded-full flex items-center justify-center mb-6 shadow-pixel-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#d97777]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-brand-dark leading-snug">{confirmDialog.message.split('?')[0]}?</h3>
            {confirmDialog.message.split('?')[1] && (
              <p className="text-brand-dark/70 font-bold mb-8 text-lg">{confirmDialog.message.split('?')[1]}</p>
            )}
            <div className="flex gap-4 justify-center w-full">
              <button 
                onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })} 
                className="flex-1 px-6 py-4 bg-white text-brand-dark border-4 border-brand-dark font-bold hover:bg-gray-50 transition-colors shadow-pixel-sm text-lg"
              >
                Vazgeç
              </button>
              <button 
                onClick={confirmDialog.onConfirm} 
                className="flex-1 px-6 py-4 bg-[#d97777] text-white border-4 border-brand-dark font-bold hover:bg-[#c25a5a] shadow-pixel-sm transition-transform hover:-translate-y-1 text-lg"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATIONS */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
          <div className={`px-6 py-4 border-4 shadow-pixel font-bold text-lg text-white flex items-center gap-3 ${toast.type === 'success' ? 'bg-[#8fb38a] border-[#5b7a57]' : 'bg-[#d97777] border-[#8a3c3c]'}`}>
            <span>{toast.type === 'success' ? '✓' : '✕'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}