import { useState } from 'react';
import type { Product } from '../../types/admin';

export function InlinePriceEdit({ product, onSave }: { product: Product, onSave: (id: string, newPrice: number) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(product.price.toString());

  const handleSave = () => {
    setIsEditing(false);
    const num = parseFloat(val.replace(',', '.'));
    if (!isNaN(num) && num !== product.price && num >= 0) {
      onSave(product.id, num);
    } else {
      setVal(product.price.toString());
    }
  };

  if (!isEditing) {
    return (
      <div 
        className="bg-white border-2 border-brand-dark text-brand-dark px-4 py-2 font-bold text-2xl shadow-pixel-sm shrink-0 w-[120px] text-right cursor-pointer hover:bg-brand-light transition-colors group relative"
        onClick={() => { setIsEditing(true); setVal(product.price.toString()); }}
        title="Fiyatı hızlıca düzenlemek için tıklayın"
      >
        {product.price} ₺
        <span className="absolute -top-2 -right-2 text-xs bg-[#5b7a57] text-white px-1 opacity-0 group-hover:opacity-100 transition-opacity">✍️</span>
      </div>
    );
  }

  return (
    <input 
      autoFocus
      type="text" 
      inputMode="decimal"
      className="bg-white border-2 border-brand-dark text-brand-dark px-2 py-2 font-bold text-2xl shadow-pixel-sm shrink-0 w-[120px] text-right outline-none ring-4 ring-[#8fb38a] z-10 relative"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') { setIsEditing(false); setVal(product.price.toString()); }
      }}
    />
  );
}
