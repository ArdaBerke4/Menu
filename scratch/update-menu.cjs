const fs = require('fs');
let code = fs.readFileSync('src/pages/Menu.tsx', 'utf8');

// 1. Imports
if (!code.includes('ProductOptionsModal')) {
  code = code.replace(
    "import { useParams } from 'react-router-dom';",
    "import { useParams } from 'react-router-dom';\nimport { ProductOptionsModal } from '../components/menu/ProductOptionsModal';\nimport type { ProductOption, ProductOptionChoice } from '../types/admin';\nimport type { SelectedOption } from '../types/pos';"
  );
}

// 2. Interfaces
code = code.replace(
  "interface Product { id: string; name: string; description?: string; price: number; category_id: string; image_url?: string; }",
  "interface Product { id: string; name: string; description?: string; price: number; category_id: string; image_url?: string; options?: ProductOption[]; }"
);
code = code.replace(
  "interface CartItem { product: Product; quantity: number; }",
  "interface CartItem { id: string; product: Product; quantity: number; note?: string; selected_options?: SelectedOption[]; }"
);

// 3. State
if (!code.includes('selectedProductForOptions')) {
  code = code.replace(
    "const [cartOpen, setCartOpen] = useState(false);",
    "const [cartOpen, setCartOpen] = useState(false);\n  const [selectedProductForOptions, setSelectedProductForOptions] = useState<Product | null>(null);"
  );
}

// 4. Methods
code = code.replace(
  /const addToCart = \(product: Product\) => \{[\s\S]*?\};\s*const updateQuantity = \(productId: string, delta: number\) => \{[\s\S]*?\};/,
  `const handleAddToCartClick = (product: Product) => {
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
  };`
);

// 5. Total Price & Submit
code = code.replace(
  /const cartTotalPrice = cart\.reduce\(\(acc, item\) => \{[\s\S]*?return acc \+ \(effectivePrice \* item\.quantity\);\s*\}, 0\);/,
  `const cartTotalPrice = cart.reduce((acc, item) => {
    const priceInfo = getDiscountedPrice(item.product);
    const effectivePrice = priceInfo.discounted ?? priceInfo.original;
    const optionsTotal = (item.selected_options || []).reduce((sum, opt) => sum + opt.price, 0);
    return acc + ((effectivePrice + optionsTotal) * item.quantity);
  }, 0);`
);

code = code.replace(
  /unit_price: effectivePrice/,
  `unit_price: effectivePrice,\n          note: item.note,\n          selected_options: item.selected_options`
);

// 6. JSX bindings
code = code.replace(
  /onClick=\{\(\) => addToCart\(product\)\}/g,
  `onClick={() => handleAddToCartClick(product)}`
);

// Cart rendering updates
code = code.replace(
  /key=\{item\.product\.id\}/g,
  `key={item.id}`
);

code = code.replace(
  /onClick=\{\(\) => updateQuantity\(item\.product\.id, -1\)\}/g,
  `onClick={() => updateQuantity(item.id, -1)}`
);

code = code.replace(
  /onClick=\{\(\) => updateQuantity\(item\.product\.id, 1\)\}/g,
  `onClick={() => updateQuantity(item.id, 1)}`
);

// Render options and note in cart
code = code.replace(
  /<div className="flex-1">([\s\S]*?)<\/div>\s*<div className="flex items-center gap-3/,
  `<div className="flex-1">
                    $1
                    {item.selected_options && item.selected_options.length > 0 && (
                      <div className="text-xs mt-1 opacity-70">
                        {item.selected_options.map((opt, i) => (
                          <div key={i}>+ {opt.choiceName} {opt.price > 0 && \`(\${opt.price} ₺)\`}</div>
                        ))}
                      </div>
                    )}
                    {item.note && (
                      <div className="text-xs mt-1 opacity-70 italic">Not: {item.note}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-3`
);

// Price calculation in cart UI display
code = code.replace(
  /<span className="font-bold whitespace-nowrap text-lg w-16 text-right".*?>\s*\{(?:\(\(\(.*?\)\) \|\| item\.product\.price\) \* item\.quantity|[\s\S]*?)\} \?\s*<\/span>/,
  `<span className="font-bold whitespace-nowrap text-lg w-16 text-right" style={{ color: themeColor }}>
                      {((getDiscountedPrice(item.product).discounted ?? getDiscountedPrice(item.product).original) + (item.selected_options || []).reduce((sum, opt) => sum + opt.price, 0)) * item.quantity} ₺
                    </span>`
);

// 7. Modal rendering
if (!code.includes('<ProductOptionsModal')) {
  code = code.replace(
    /\{cartOpen && \([\s\S]*?\{!cartOpen && cart\.length > 0 && \(/,
    match => `      {selectedProductForOptions && (
        <ProductOptionsModal
          product={selectedProductForOptions}
          onClose={() => setSelectedProductForOptions(null)}
          onAddToCart={(quantity, note, selectedOptions) => {
            addToCart(selectedProductForOptions, quantity, note, selectedOptions);
            setSelectedProductForOptions(null);
          }}
        />
      )}

` + match
  );
}

fs.writeFileSync('src/pages/Menu.tsx', code);
console.log('Update complete');
