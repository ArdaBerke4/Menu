const fs = require('fs');

const path = 'src/pages/ManagementDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    `<p className="text-sm font-bold text-brand-dark/50 mt-4 text-center">Masa ve siparişleri<br/>teslim etme yetkisi</p>`,
    `<p className="text-sm font-bold text-brand-dark/50 mt-4 text-center">Masa ve siparişleri<br/>teslim etme yetkisi</p>
                <a href={\`\${window.location.origin}/staff/\${restaurantId}?role=waiter\`} target="_blank" rel="noreferrer" className="mt-2 text-xs text-brand hover:underline font-bold break-all text-center">
                  Bağlantıyı Aç / Kopyala
                </a>`
);

content = content.replace(
    `<p className="text-sm font-bold text-brand-dark/50 mt-4 text-center">Sadece mutfak sipariş<br/>ekranı (KDS) yetkisi</p>`,
    `<p className="text-sm font-bold text-brand-dark/50 mt-4 text-center">Sadece mutfak sipariş<br/>ekranı (KDS) yetkisi</p>
                <a href={\`\${window.location.origin}/staff/\${restaurantId}?role=chef\`} target="_blank" rel="noreferrer" className="mt-2 text-xs text-brand hover:underline font-bold break-all text-center">
                  Bağlantıyı Aç / Kopyala
                </a>`
);

fs.writeFileSync(path, content);
console.log('ManagementDashboard.tsx QR links updated.');
