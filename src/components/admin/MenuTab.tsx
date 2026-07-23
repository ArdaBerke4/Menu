import Draggable from 'react-draggable';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { InlinePriceEdit } from './InlinePriceEdit';

export function MenuTab(props: any) {
  const {
    categoryName, setCategoryName,
    handleCreateCategory,
    loading,
    fileInputRef,
    handleFileUpload,
    sortedCategories,
    layoutStyle,
    categories,
    handleCanvasDragStop,
    sensors,
    handleDragEndCategories,
    SortableCategoryItem,
    moveCategory,
    editingProductId,
    handleSubmitProduct,
    selectedCategoryId, setSelectedCategoryId,
    productName, setProductName,
    productDesc, setProductDesc,
    setImageFile,
    productPrice, setProductPrice,
    resetProductForm,
    searchTerm, setSearchTerm,
    filterCategoryId, setFilterCategoryId,
    sortByPrice, setSortByPrice,
    selectedProductIds,
    bulkMode, setBulkMode,
    bulkValue, setBulkValue,
    bulkValueType, setBulkValueType,
    handleBulkDelete,
    handleApplyBulkAction,
    filteredProducts,
    toggleSelectAll,
    productsByCategoryId,
    toggleSelectProduct,
    moveProduct,
    handleEditClick,
    handleDeleteProduct,
    handleInlinePriceUpdate
  } = props;

  return (
    <div className="max-w-[1400px] flex gap-10">
      <div className="w-[450px] shrink-0 space-y-8">
        <div className="bg-[#F4E4C1] border-4 border-brand-dark shadow-pixel p-6">
          <h2 className="text-2xl font-bold mb-4 uppercase text-brand-dark border-b-2 border-brand-dark pb-2">Yeni Kategori Ekle</h2>
          <form onSubmit={handleCreateCategory} className="flex gap-4">
            <input type="text" required value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Örn: Kahveler..." className="flex-1 px-4 py-2 border-2 border-brand-dark bg-white focus:outline-none" />
            <button type="submit" disabled={loading} className="bg-brand text-surface border-2 border-brand-dark px-6 py-2 shadow-pixel-sm hover:opacity-90">EKLE</button>
          </form>
        </div>

        {/* TOPLU MENÜ YÜKLE */}
        <div className="bg-[#F4E4C1] border-4 border-brand-dark shadow-pixel p-6">
          <h2 className="text-2xl font-bold mb-2 uppercase text-brand-dark border-b-2 border-brand-dark pb-2">Toplu Menü Aktar 📥</h2>
          <p className="text-sm font-bold opacity-70 mb-4">Mevcut bir Excel dosyanızı seçerek menünüzü hızlıca oluşturun. (Sütunlar: Kategori, Ürün Adı, Fiyat, Açıklama)</p>
          <div className="flex gap-4">
            <input type="file" accept=".xlsx, .xls, .csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" id="excel-upload" />
            <label htmlFor="excel-upload" className="w-full text-center bg-brand text-surface border-2 border-brand-dark px-4 py-3 font-bold hover:opacity-90 transition-opacity shadow-pixel-sm cursor-pointer">
              Excel/CSV Seç Yükle
            </label>
          </div>
          <div className="mt-4 flex flex-col gap-1 text-xs font-bold opacity-60">
            <span>Örnek Tablo:</span>
            <table className="w-full border border-brand-dark text-left bg-white">
              <thead className="border-b border-brand-dark"><tr><th className="px-2 py-1 border-r border-brand-dark">Kategori</th><th className="px-2 py-1 border-r border-brand-dark">Ürün Adı</th><th className="px-2 py-1">Fiyat</th></tr></thead>
              <tbody><tr><td className="px-2 py-1 border-r border-brand-dark">Tatlılar</td><td className="px-2 py-1 border-r border-brand-dark">Sufle</td><td className="px-2 py-1">150</td></tr></tbody>
            </table>
          </div>
        </div>

        {sortedCategories.length > 0 && (
          <div className="bg-[#F4E4C1] border-4 border-brand-dark shadow-pixel p-6">
            {layoutStyle === 'canvas' ? (
              <>
                <h2 className="text-2xl font-bold mb-2 uppercase text-brand-dark border-b-2 border-brand-dark pb-2">Serbest Tuval (Harita Modu)</h2>
                <p className="text-sm font-bold opacity-70 mb-4">Müşterilerin göreceği haritadaki kategori konumlarını ayarlayın. Kutuları tutup sürükleyin.</p>
                <div className="relative border-4 border-dashed border-brand-dark bg-white h-[400px] overflow-hidden">
                  {categories.map((cat: any) => (
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
                  <SortableContext items={sortedCategories.map((c: any) => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-0">
                      {sortedCategories.map((cat: any, index: number) => (
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
                {sortedCategories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
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
              <input type="text" inputMode="decimal" required value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="Örn: 120" className="w-full px-4 py-2 border-2 border-brand-dark bg-white focus:outline-none" />
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
              {sortedCategories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
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
                    <input type="text" inputMode="decimal" value={bulkValue} onChange={(e) => setBulkValue(e.target.value)} placeholder="0" className="w-24 px-3 py-2 focus:outline-none text-right" autoFocus />
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
              filteredProducts.map((product: any) => {
                const siblings = productsByCategoryId[product.category_id] || [];
                const siblingIndex = siblings.findIndex((p: any) => p.id === product.id);
                return (
                  <div key={product.id} className={`border-2 border-brand-dark p-3 flex gap-4 items-center transition-all ${selectedProductIds.includes(product.id) ? 'bg-[#e8f4e1]' : 'bg-surface hover:bg-gray-50'}`}>
                    <input type="checkbox" checked={selectedProductIds.includes(product.id)} onChange={() => toggleSelectProduct(product.id)} className="w-6 h-6 border-2 border-brand-dark accent-[#8fb38a] cursor-pointer shrink-0" />
                    {product.image_url && (
                      <div className="w-16 h-16 border-2 border-brand-dark bg-white shrink-0">
                        <img src={product.image_url} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-2xl text-brand-dark uppercase truncate">{product.name}</h3>
                      <div className="text-sm font-bold text-brand bg-brand-light px-2 py-0.5 inline-block border border-brand-dark">{categories.find((c: any) => c.id === product.category_id)?.name || 'Bilinmeyen'}</div>
                    </div>
                    
                    <InlinePriceEdit product={product} onSave={handleInlinePriceUpdate} />

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
  );
}
