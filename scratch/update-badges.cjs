const fs = require('fs');

const path = 'src/components/pos/TableDetailModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add status badge
content = content.replace(
    "{item.quantity}x {item.product_name}",
    `{item.quantity}x {item.product_name}
                                    {item.status === 'preparing' && <span className="ml-2 text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 border border-orange-300">Şef Hazırlıyor</span>}
                                    {item.status === 'ready' && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 border border-green-300">Hazır</span>}`
);

fs.writeFileSync(path, content);
console.log('TableDetailModal.tsx badges updated.');
