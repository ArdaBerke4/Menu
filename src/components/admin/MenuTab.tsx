import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { InlinePriceEdit } from './InlinePriceEdit';
import * as XLSX from 'xlsx';

export function MenuTab(props: any) {
  const {
    categoryName, setCategoryName,
    handleCreateCategory,
    loading,
    fileInputRef,
    handleFileUpload,
    sortedCategories,
    categories,
    products,
    sensors,
    handleDragEndCategories,
    SortableCategoryItem,
    moveCategory,
    handleDeleteCategory,
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
    handleInlinePriceUpdate,
    productOptions, setProductOptions
  } = props;

  const handleExportExcel = () => {
    if (!categories || !products) return;
    
    // Excel iÃ§in verileri hazÄ±rla
    // Ä°stenen sÃ¼tunlar: Kategori ID, Kategori, ÃœrÃ¼n ID, ÃœrÃ¼n AdÄ±, Fiyat, AÃ§Ä±klama
    const data = [
      ["Kategori ID", "Kategori", "ÃœrÃ¼n ID", "ÃœrÃ¼n AdÄ±", "Fiyat", "AÃ§Ä±klama"]
    ];

    // ÃœrÃ¼nleri kategori adÄ±na gÃ¶re eÅŸleÅŸtirip diziye ekle
    products.forEach((product: any) => {
      const category = categories.find((c: any) => c.id === product.category_id);
      data.push([
        category ? category.id : "",
        category ? category.name : "Bilinmeyen Kategori",
        product.id,
        product.name,
        product.price,
        product.description || ""
      ]);
    });

    // Worksheet oluÅŸtur
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // SÃ¼tun geniÅŸlikleri
    ws['!cols'] = [{ wch: 36 }, { wch: 20 }, { wch: 36 }, { wch: 30 }, { wch: 10 }, { wch: 40 }];

    // Workbook oluÅŸtur ve sayfayÄ± ekle
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Menu");

    // Excel dosyasÄ±nÄ± indir
    XLSX.writeFile(wb, `Menu_Yedek_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')}.xlsx`);
  };

  return (
    <div className="max-w-[1400px] flex gap-10">
      <div className="w-[450px] shrink-0 space-y-8">
        <div className="bg-admin-bg border-4 border-admin-border shadow-admin-pixel p-6">
          <h2 className="text-2xl font-bold mb-4 uppercase text-admin-text border-b-2 border-admin-border pb-2">Yeni Kategori Ekle</h2>
          <form onSubmit={handleCreateCategory} className="flex gap-4">
            <input type="text" required value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Ã–rn: Kahveler..." className="flex-1 px-4 py-2 border-2 border-admin-border bg-admin-surface focus:outline-none" />
            <button type="submit" disabled={loading} className="bg-brand text-surface border-2 border-admin-border px-6 py-2 shadow-admin-pixel-sm hover:opacity-90">EKLE</button>
          </form>
        </div>

        {/* TOPLU MENÃœ YÃœKLE & Ä°NDÄ°R */}
        <div className="bg-admin-bg border-4 border-admin-border shadow-admin-pixel p-6">
          <h2 className="text-2xl font-bold mb-2 uppercase text-admin-text border-b-2 border-admin-border pb-2">MenÃ¼ Yedekleme ğŸ“¥</h2>
          <p className="text-sm font-bold opacity-70 mb-4">Mevcut bir Excel dosyasÄ± yÃ¼kleyerek menÃ¼yÃ¼ gÃ¼ncelleyebilir veya mevcut menÃ¼nÃ¼zÃ¼n yedeÄŸini alabilirsiniz.</p>
          
          <div className="flex flex-col gap-3">
            <button onClick={handleExportExcel} className="w-full text-center bg-[#5b7a57] text-surface border-2 border-admin-border px-4 py-3 font-bold hover:opacity-90 transition-opacity shadow-admin-pixel-sm cursor-pointer flex items-center justify-center gap-2">
              <span>ğŸ“¥</span> Mevcut MenÃ¼yÃ¼ Ä°ndir (Yedek Al)
            </button>
            
            <div className="flex items-center gap-2 my-2">
              <div className="h-[2px] flex-1 bg-admin-border/20"></div>
              <span className="text-xs font-bold text-admin-text/50 uppercase">VEYA</span>
              <div className="h-[2px] flex-1 bg-admin-border/20"></div>
            </div>

            <div className="flex gap-4">
              <input type="file" accept=".xlsx, .xls, .csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" id="excel-upload" />
              <label htmlFor="excel-upload" className="w-full text-center bg-brand text-surface border-2 border-admin-border px-4 py-3 font-bold hover:opacity-90 transition-opacity shadow-admin-pixel-sm cursor-pointer">
                Excel/CSV SeÃ§ & YÃ¼kle
              </label>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-1 text-xs font-bold opacity-60">
            <div className="flex items-center justify-between">
              <span>Ã–rnek Tablo:</span>
              <a href="/ornek_menu.xlsx" download className="text-admin-text underline hover:text-brand transition-colors cursor-pointer text-sm">
                ğŸ“¥ Ã–rnek Dosya Ä°ndir
              </a>
            </div>
            <table className="w-full border border-admin-border text-left bg-admin-surface mt-1">
              <thead className="border-b border-admin-border"><tr><th className="px-2 py-1 border-r border-admin-border">Kategori</th><th className="px-2 py-1 border-r border-admin-border">ÃœrÃ¼n AdÄ±</th><th className="px-2 py-1">Fiyat</th></tr></thead>
              <tbody><tr><td className="px-2 py-1 border-r border-admin-border">TatlÄ±lar</td><td className="px-2 py-1 border-r border-admin-border">Sufle</td><td className="px-2 py-1">150</td></tr></tbody>
            </table>
          </div>
        </div>

        {sortedCategories.length > 0 && (
          <div className="bg-admin-bg border-4 border-admin-border shadow-admin-pixel p-6">
              <>
                <h2 className="text-2xl font-bold mb-4 uppercase text-admin-text border-b-2 border-admin-border pb-2">Kategori SÄ±ralamasÄ±</h2>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndCategories}>
                  <SortableContext items={sortedCategories.map((c: any) => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-0">
                      {sortedCategories.map((cat: any, index: number) => (
                        <SortableCategoryItem 
                          key={cat.id} 
                          category={cat} 
                          onUp={moveCategory} 
                          onDown={moveCategory} 
                          onDelete={handleDeleteCategory}
                          isFirst={index === 0} 
                          isLast={index === sortedCategories.length - 1} 
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </>

          </div>
        )}

        <div className={`bg-admin-bg border-4 border-admin-border shadow-admin-pixel p-6 transition-colors duration-300 ${editingProductId ? 'bg-admin-primary-faint' : ''}`}>
          <h2 className="text-2xl font-bold mb-4 uppercase text-admin-text border-b-2 border-admin-border pb-2">
            {editingProductId ? 'ÃœrÃ¼nÃ¼ DÃ¼zenle' : 'Yeni ÃœrÃ¼n Ekle'}
          </h2>
          <form onSubmit={handleSubmitProduct} className="space-y-4">
            <div>
              <label className="block font-bold mb-1">Kategori</label>
              <select required value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} className="w-full px-4 py-2 border-2 border-admin-border bg-admin-surface focus:outline-none">
                {sortedCategories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">ÃœrÃ¼n AdÄ±</label>
              <input type="text" required value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Ã–rn: Flat White" className="w-full px-4 py-2 border-2 border-admin-border bg-admin-surface focus:outline-none" />
            </div>
            <div>
              <label className="block font-bold mb-1">AÃ§Ä±klama</label>
              <textarea rows={2} value={productDesc} onChange={(e) => setProductDesc(e.target.value)} placeholder="KÄ±sa aÃ§Ä±klama..." className="w-full px-4 py-2 border-2 border-admin-border bg-admin-surface focus:outline-none resize-none" />
            </div>
            <div>
              <label className="block font-bold mb-1">{editingProductId ? 'Yeni GÃ¶rsel' : 'ÃœrÃ¼n GÃ¶rseli'}</label>
              <input id="imageInput" type="file" accept="image/*" onChange={(e) => e.target.files && setImageFile(e.target.files[0])} className="w-full bg-admin-surface px-4 py-2 border-2 border-admin-border focus:outline-none file:mr-4 file:bg-brand-dark file:text-surface text-base" />
            </div>
            
            <div className="border-2 border-admin-border p-3 bg-admin-surface space-y-3">
              <div className="flex justify-between items-center">
                <label className="font-bold">Ekstralar / SeÃ§enekler</label>
                <button type="button" onClick={() => setProductOptions([...productOptions, { name: '', type: 'single', required: false, choices: [] }])} className="bg-brand-light text-admin-text px-2 py-1 text-xs border border-admin-border font-bold hover:bg-brand hover:text-admin-bg">
                  + GRUP EKLE
                </button>
              </div>
              
              {productOptions.length === 0 ? (
                <p className="text-xs opacity-50 italic">ÃœrÃ¼ne ait ekstra seÃ§enek yok.</p>
              ) : (
                <div className="space-y-4">
                  {productOptions.map((opt: any, optIdx: number) => (
                    <div key={optIdx} className="border border-admin-border/30 p-2 bg-gray-50 relative group">
                      <button type="button" onClick={() => setProductOptions(productOptions.filter((_: any, i: number) => i !== optIdx))} className="absolute top-1 right-1 text-red-500 hover:bg-red-100 p-1 rounded font-bold text-xs hidden group-hover:block">
                        âœ• Sil
                      </button>
                      <div className="flex gap-2 mb-2 pr-8">
                        <input type="text" placeholder="Grup AdÄ± (Ã–rn: SÃ¼t SeÃ§imi)" value={opt.name} onChange={(e) => {
                          const newOpts = [...productOptions];
                          newOpts[optIdx].name = e.target.value;
                          setProductOptions(newOpts);
                        }} className="flex-1 px-2 py-1 border border-admin-border text-sm" required />
                        <select value={opt.type} onChange={(e) => {
                          const newOpts = [...productOptions];
                          newOpts[optIdx].type = e.target.value as 'single' | 'multiple';
                          setProductOptions(newOpts);
                        }} className="w-24 px-2 py-1 border border-admin-border text-sm">
                          <option value="single">Tekli</option>
                          <option value="multiple">Ã‡oklu</option>
                        </select>
                        <label className="flex items-center gap-1 text-xs font-bold cursor-pointer">
                          <input type="checkbox" checked={opt.required} onChange={(e) => {
                            const newOpts = [...productOptions];
                            newOpts[optIdx].required = e.target.checked;
                            setProductOptions(newOpts);
                          }} /> Zorunlu
                        </label>
                      </div>

                      <div className="space-y-2 ml-2 border-l-2 border-brand-light pl-2">
                        {opt.choices.map((choice: any, choiceIdx: number) => (
                          <div key={choiceIdx} className="flex gap-2">
                            <input type="text" placeholder="SeÃ§enek (Ã–rn: Badem SÃ¼tÃ¼)" value={choice.name} onChange={(e) => {
                              const newOpts = [...productOptions];
                              newOpts[optIdx].choices[choiceIdx].name = e.target.value;
                              setProductOptions(newOpts);
                            }} className="flex-1 px-2 py-1 border border-admin-border text-sm" required />
                            <div className="flex items-center border border-admin-border bg-admin-surface">
                              <span className="px-2 text-xs bg-gray-100 border-r border-admin-border">+</span>
                              <input type="number" placeholder="0" value={choice.price || ''} onChange={(e) => {
                                const newOpts = [...productOptions];
                                newOpts[optIdx].choices[choiceIdx].price = parseFloat(e.target.value) || 0;
                                setProductOptions(newOpts);
                              }} className="w-16 px-2 py-1 text-sm focus:outline-none text-right" />
                              <span className="px-2 text-xs bg-gray-100 border-l border-admin-border">â‚º</span>
                            </div>
                            <button type="button" onClick={() => {
                              const newOpts = [...productOptions];
                              newOpts[optIdx].choices = newOpts[optIdx].choices.filter((_: any, c: number) => c !== choiceIdx);
                              setProductOptions(newOpts);
                            }} className="text-red-500 font-bold px-2 hover:bg-red-100">âœ•</button>
                          </div>
                        ))}
                        <button type="button" onClick={() => {
                          const newOpts = [...productOptions];
                          newOpts[optIdx].choices.push({ name: '', price: 0 });
                          setProductOptions(newOpts);
                        }} className="text-xs font-bold text-brand hover:underline mt-1 block">+ Yeni SeÃ§enek</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold mb-1">Fiyat (â‚º)</label>
              <input type="text" inputMode="decimal" required value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="Ã–rn: 120" className="w-full px-4 py-2 border-2 border-admin-border bg-admin-surface focus:outline-none" />
            </div>
            <div className="flex gap-4 pt-2">
              <button type="submit" disabled={loading} className="flex-1 bg-brand text-surface border-2 border-admin-border px-4 py-3 text-lg shadow-admin-pixel hover:opacity-90">
                {loading ? 'BEKLEYÄ°N...' : (editingProductId ? 'GÃœNCELLE' : 'EKLE')}
              </button>
              {editingProductId && <button type="button" onClick={resetProductForm} className="bg-gray-300 text-admin-text border-2 border-admin-border px-4 py-3 text-lg shadow-admin-pixel hover:bg-gray-400">Ä°PTAL</button>}
            </div>
          </form>
        </div>
      </div>

      <div className="flex-1 flex flex-col space-y-6">
        <div className="bg-admin-bg border-4 border-admin-border shadow-admin-pixel p-4 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 flex border-2 border-admin-border bg-admin-surface">
              <span className="px-4 py-3 border-r-2 border-admin-border bg-brand-light font-bold">ARA:</span>
              <input type="text" placeholder="ÃœrÃ¼n adÄ± veya aÃ§Ä±klama..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-4 py-2 focus:outline-none bg-transparent" />
            </div>
            <select value={filterCategoryId} onChange={(e) => setFilterCategoryId(e.target.value)} className="w-[250px] px-4 py-3 border-2 border-admin-border bg-admin-surface focus:outline-none cursor-pointer">
              <option value="">TÃ¼m Kategoriler</option>
              {sortedCategories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-admin-text shrink-0">FÄ°YAT SIRALA:</span>
            <div className="flex border-2 border-admin-border">
              <button type="button" onClick={() => setSortByPrice(sortByPrice === 'asc' ? null : 'asc')} className={`px-4 py-2 font-bold transition-colors ${sortByPrice === 'asc' ? 'bg-brand text-surface' : 'bg-brand-light text-admin-text hover:bg-admin-surface'}`}>Artan â†‘</button>
              <button type="button" onClick={() => setSortByPrice(sortByPrice === 'desc' ? null : 'desc')} className={`px-4 py-2 font-bold border-l-2 border-admin-border transition-colors ${sortByPrice === 'desc' ? 'bg-brand text-surface' : 'bg-brand-light text-admin-text hover:bg-admin-surface'}`}>Azalan â†“</button>
            </div>
            {sortByPrice && (
              <>
                <button type="button" onClick={() => setSortByPrice(null)} className="px-3 py-2 bg-gray-300 text-admin-text border-2 border-admin-border font-bold hover:bg-gray-400 text-sm">SÄ±fÄ±rla âœ•</button>
                <span className="text-sm font-bold text-[#5b7a57] bg-admin-primary-faint border border-admin-primary px-3 py-1">{sortByPrice === 'asc' ? 'ğŸ’° Ucuzdan pahalÄ±ya' : 'ğŸ’ PahalÄ±dan ucuya'}</span>
              </>
            )}
          </div>

          {selectedProductIds.length > 0 && (
            <div className="bg-admin-primary-faint border-2 border-admin-primary p-3 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span className="font-bold text-[#5b7a57] px-2">{selectedProductIds.length} ÃœrÃ¼n SeÃ§ildi</span>
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setBulkMode(bulkMode === 'increase' ? null : 'increase'); setBulkValue(''); }} className={`font-bold border-2 border-admin-border px-4 py-1 shadow-admin-pixel-sm hover:scale-105 transition-transform ${bulkMode === 'increase' ? 'bg-brand text-surface' : 'bg-admin-primary text-admin-primary-text'}`}>+ Toplu Zam</button>
                  <button type="button" onClick={() => { setBulkMode(bulkMode === 'decrease' ? null : 'decrease'); setBulkValue(''); }} className={`font-bold border-2 border-admin-border px-4 py-1 shadow-admin-pixel-sm hover:scale-105 transition-transform ${bulkMode === 'decrease' ? 'bg-brand text-surface' : 'bg-brand-light text-admin-text'}`}>- Toplu Ä°ndirim</button>
                  <button type="button" onClick={handleBulkDelete} className="bg-admin-danger text-surface font-bold border-2 border-admin-border px-4 py-1 shadow-admin-pixel-sm hover:scale-105 transition-transform">Toplu Sil</button>
                </div>
              </div>
              {bulkMode && (
                <div className="flex flex-wrap items-center gap-3 bg-admin-surface border-2 border-admin-border p-3">
                  <span className="font-bold whitespace-nowrap">{bulkMode === 'increase' ? 'Zam miktarÄ±:' : 'Ä°ndirim miktarÄ±:'}</span>
                  <div className="flex border-2 border-admin-border">
                    <button type="button" onClick={() => setBulkValueType('percent')} className={`px-3 py-2 font-bold ${bulkValueType === 'percent' ? 'bg-brand text-surface' : 'bg-admin-surface text-admin-text'}`}>YÃ¼zde (%)</button>
                    <button type="button" onClick={() => setBulkValueType('fixed')} className={`px-3 py-2 font-bold border-l-2 border-admin-border ${bulkValueType === 'fixed' ? 'bg-brand text-surface' : 'bg-admin-surface text-admin-text'}`}>Sabit Tutar (â‚º)</button>
                  </div>
                  <div className="flex items-center border-2 border-admin-border">
                    <input type="text" inputMode="decimal" value={bulkValue} onChange={(e) => setBulkValue(e.target.value)} placeholder="0" className="w-24 px-3 py-2 focus:outline-none text-right" autoFocus />
                    <span className="px-3 py-2 bg-brand-light border-l-2 border-admin-border font-bold">{bulkValueType === 'percent' ? '%' : 'â‚º'}</span>
                  </div>
                  <button type="button" onClick={handleApplyBulkAction} disabled={loading || !bulkValue} className="bg-admin-primary text-admin-primary-text font-bold border-2 border-admin-border px-5 py-2 shadow-admin-pixel-sm hover:scale-105 disabled:opacity-50">{loading ? 'UYGULANIYOR...' : 'UYGULA'}</button>
                  <button type="button" onClick={() => { setBulkMode(null); setBulkValue(''); }} className="bg-gray-300 text-admin-text font-bold border-2 border-admin-border px-3 py-2 hover:bg-gray-400">Ä°PTAL</button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-admin-surface border-4 border-admin-border shadow-admin-pixel overflow-hidden flex flex-col">
          <div className="flex items-center gap-4 border-b-4 border-admin-border bg-admin-bg p-4 font-bold text-xl uppercase">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length} onChange={toggleSelectAll} className="w-6 h-6 border-2 border-admin-border accent-[#8fb38a] cursor-pointer" />
              TÃ¼mÃ¼nÃ¼ SeÃ§
            </label>
            <span className="ml-auto text-brand">{filteredProducts.length} ÃœrÃ¼n Listeleniyor</span>
          </div>
          <div className="overflow-y-auto max-h-[600px] p-4 space-y-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-10 font-bold text-admin-text/50">Bu kriterlere uygun Ã¼rÃ¼n bulunamadÄ±.</div>
            ) : (
              filteredProducts.map((product: any) => {
                const siblings = productsByCategoryId[product.category_id] || [];
                const siblingIndex = siblings.findIndex((p: any) => p.id === product.id);
                return (
                  <div key={product.id} className={`border-2 border-admin-border p-3 flex gap-4 items-center transition-all ${selectedProductIds.includes(product.id) ? 'bg-admin-primary-faint' : 'bg-admin-surface hover:bg-gray-50'}`}>
                    <input type="checkbox" checked={selectedProductIds.includes(product.id)} onChange={() => toggleSelectProduct(product.id)} className="w-6 h-6 border-2 border-admin-border accent-[#8fb38a] cursor-pointer shrink-0" />
                    {product.image_url && (
                      <div className="w-16 h-16 border-2 border-admin-border bg-admin-surface shrink-0">
                        <img src={product.image_url} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-2xl text-admin-text uppercase truncate">{product.name}</h3>
                      <div className="text-sm font-bold text-brand bg-brand-light px-2 py-0.5 inline-block border border-admin-border">{categories.find((c: any) => c.id === product.category_id)?.name || 'Bilinmeyen'}</div>
                    </div>
                    
                    <InlinePriceEdit product={product} onSave={handleInlinePriceUpdate} />

                    <div className="flex gap-1 shrink-0 border-l-2 border-admin-border pl-3">
                      <button onClick={() => moveProduct(product, 'up')} disabled={siblingIndex === 0 || !!sortByPrice} className="w-7 h-7 flex items-center justify-center bg-brand-light border-2 border-admin-border font-bold hover:bg-admin-surface disabled:opacity-30 text-sm" title={sortByPrice ? 'Fiyat sÄ±ralamasÄ± aktifken taÅŸÄ±ma devre dÄ±ÅŸÄ±' : 'YukarÄ± TaÅŸÄ±'}>â–²</button>
                      <button onClick={() => moveProduct(product, 'down')} disabled={siblingIndex === siblings.length - 1 || !!sortByPrice} className="w-7 h-7 flex items-center justify-center bg-brand-light border-2 border-admin-border font-bold hover:bg-admin-surface disabled:opacity-30 text-sm" title={sortByPrice ? 'Fiyat sÄ±ralamasÄ± aktifken taÅŸÄ±ma devre dÄ±ÅŸÄ±' : 'AÅŸaÄŸÄ± TaÅŸÄ±'}>â–¼</button>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0 border-l-2 border-admin-border pl-4">
                      <button onClick={() => handleEditClick(product)} className="text-[#5b7a57] font-bold hover:scale-110 transition-transform" title="DÃ¼zenle">[âœï¸]</button>
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
