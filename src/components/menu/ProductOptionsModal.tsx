import { useState } from 'react';
import type { Product, ProductOption, ProductOptionChoice } from '../../types/admin';
import type { SelectedOption } from '../../types/pos';

interface ProductOptionsModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (quantity: number, note: string, selectedOptions: SelectedOption[]) => void;
}

export function ProductOptionsModal({ product, onClose, onAddToCart }: ProductOptionsModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  
  const [selections, setSelections] = useState<Record<string, any>>({});

  const options = product.options || [];

  const handleSelect = (opt: ProductOption, choice: ProductOptionChoice, isChecked: boolean) => {
    if (opt.type === 'single') {
      setSelections(prev => ({ ...prev, [opt.name]: choice }));
    } else {
      setSelections(prev => {
        const current = prev[opt.name] || [];
        if (isChecked) {
          return { ...prev, [opt.name]: [...current, choice] };
        } else {
          return { ...prev, [opt.name]: current.filter((c: any) => c.name !== choice.name) };
        }
      });
    }
  };

  const optionsTotal = () => {
    let sum = 0;
    Object.keys(selections).forEach(groupName => {
      const val = selections[groupName];
      if (Array.isArray(val)) {
        val.forEach(c => { sum += c.price; });
      } else if (val) {
        sum += val.price;
      }
    });
    return sum;
  };

  const calculateTotal = () => {
    return (product.price + optionsTotal()) * quantity;
  };

  const isValid = () => {
    for (const opt of options) {
      if (opt.required) {
        const val = selections[opt.name];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          return false;
        }
      }
    }
    return true;
  };

  const handleAdd = () => {
    if (!isValid()) return;
    
    const finalOptions: SelectedOption[] = [];
    Object.keys(selections).forEach(groupName => {
      const val = selections[groupName];
      if (Array.isArray(val)) {
        val.forEach(c => finalOptions.push({ groupName, choiceName: c.name, price: c.price }));
      } else if (val) {
        finalOptions.push({ groupName, choiceName: val.name, price: val.price });
      }
    });

    onAddToCart(quantity, note, finalOptions);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-surface w-full max-w-md border-4 border-brand-dark shadow-pixel flex flex-col max-h-[90vh]" 
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-brand-light border-b-4 border-brand-dark p-4 flex justify-between items-start relative">
          <div>
            <h2 className="text-xl font-bold uppercase text-brand-dark pr-8">{product.name}</h2>
            <p className="text-brand-dark/70 font-bold mt-1">{product.price}₺</p>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 text-2xl font-bold hover:scale-110 active:scale-95 transition-transform p-1">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {product.description && (
            <p className="text-sm font-bold opacity-70 italic">{product.description}</p>
          )}

          {options.map((opt, idx) => (
            <div key={idx} className="space-y-2 border-2 border-brand-dark p-3 bg-white">
              <div className="flex justify-between items-center border-b-2 border-brand-dark/20 pb-2">
                <span className="font-bold uppercase text-brand-dark">{opt.name}</span>
                {opt.required && <span className="bg-brand text-surface text-xs px-2 py-1 font-bold">ZORUNLU</span>}
              </div>
              <div className="space-y-2 pt-1">
                {opt.choices.map((choice, cIdx) => {
                  const isSingle = opt.type === 'single';
                  const isSelected = isSingle 
                    ? selections[opt.name]?.name === choice.name
                    : (selections[opt.name] || []).some((c: any) => c.name === choice.name);

                  return (
                    <label key={cIdx} className="flex items-center justify-between p-2 hover:bg-brand-light/50 cursor-pointer transition-colors border border-transparent hover:border-brand-dark/30">
                      <div className="flex items-center gap-3">
                        <input 
                          type={isSingle ? "radio" : "checkbox"} 
                          name={`opt_${opt.name}`}
                          checked={isSelected}
                          onChange={(e) => handleSelect(opt, choice, e.target.checked)}
                          className="w-5 h-5 border-2 border-brand-dark accent-brand cursor-pointer"
                        />
                        <span className="font-bold text-sm">{choice.name}</span>
                      </div>
                      {choice.price > 0 && (
                        <span className="text-sm font-bold text-brand-dark/70">+{choice.price}₺</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="space-y-2">
            <label className="font-bold uppercase text-brand-dark block">Özel Not (İsteğe Bağlı)</label>
            <textarea 
              rows={2} 
              value={note} 
              onChange={e => setNote(e.target.value)}
              placeholder="Ekstra istekleriniz..."
              className="w-full p-3 border-2 border-brand-dark bg-white focus:outline-none resize-none font-bold placeholder:opacity-50 text-sm"
            />
          </div>

          <div className="flex items-center justify-center gap-6 pt-2">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-12 flex items-center justify-center bg-brand-light border-2 border-brand-dark text-2xl font-bold hover:bg-white active:scale-95 transition-all"
            >
              -
            </button>
            <span className="text-3xl font-bold w-8 text-center">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="w-12 h-12 flex items-center justify-center bg-brand border-2 border-brand-dark text-surface text-2xl font-bold hover:opacity-90 active:scale-95 transition-all"
            >
              +
            </button>
          </div>
        </div>

        <div className="p-4 border-t-4 border-brand-dark bg-white">
          <button 
            onClick={handleAdd}
            disabled={!isValid()}
            className={`w-full py-4 text-xl font-bold uppercase transition-all shadow-pixel flex items-center justify-between px-6 ${
              isValid() 
                ? 'bg-brand text-surface border-4 border-brand-dark hover:scale-[1.02] active:scale-95' 
                : 'bg-gray-300 text-gray-500 border-4 border-gray-400 cursor-not-allowed opacity-70'
            }`}
          >
            <span>Sepete Ekle</span>
            <span>{calculateTotal()}₺</span>
          </button>
        </div>
      </div>
    </div>
  );
}
