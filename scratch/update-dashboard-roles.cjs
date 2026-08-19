const fs = require('fs');

const path = 'src/pages/ManagementDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add imports
if (!content.includes('import QRCodeStyling')) {
    content = content.replace(
        "import { StatisticsModal } from '../components/pos/StatisticsModal';",
        "import { StatisticsModal } from '../components/pos/StatisticsModal';\nimport { ChefDashboard } from '../components/pos/ChefDashboard';\nimport QRCodeStyling from 'qr-code-styling';\nimport { useRef } from 'react';"
    );
}

// Add state
if (!content.includes('staffRole')) {
    content = content.replace(
        "const [restaurant, setRestaurant] = useState<any>(null);",
        "const [restaurant, setRestaurant] = useState<any>(null);\n  const [staffRole, setStaffRole] = useState<'admin' | 'waiter' | 'chef' | null>(null);\n  const [showStaffQR, setShowStaffQR] = useState(false);\n  const waiterQrRef = useRef<HTMLDivElement>(null);\n  const chefQrRef = useRef<HTMLDivElement>(null);"
    );
}

// Add auth check
if (!content.includes('staff_role_')) {
    content = content.replace(
        "// Aktif masanın güncel kalmasını sağla",
        `// Rol Kontrolü
  useEffect(() => {
    const role = localStorage.getItem(\`staff_role_\${restaurantId}\`);
    if (role === 'waiter' || role === 'chef') {
      setStaffRole(role);
    } else {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) setStaffRole('admin');
        else navigate('/auth');
      });
    }
  }, [restaurantId, navigate]);

  // Aktif masanın güncel kalmasını sağla`
    );
}

// Generate QRs effect
if (!content.includes('waiterQrRef.current')) {
    content = content.replace(
        "// Toplu masa ekle",
        `// QR Kodları Oluştur
  useEffect(() => {
    if (showStaffQR && restaurantId) {
      const baseUrl = window.location.origin;
      const waiterUrl = \`\${baseUrl}/staff/\${restaurantId}?role=waiter\`;
      const chefUrl = \`\${baseUrl}/staff/\${restaurantId}?role=chef\`;

      const options = {
        width: 200, height: 200,
        dotsOptions: { color: '#000', type: 'rounded' as any },
        backgroundOptions: { color: '#fff' }
      };

      if (waiterQrRef.current) {
        waiterQrRef.current.innerHTML = '';
        new QRCodeStyling({ ...options, data: waiterUrl }).append(waiterQrRef.current);
      }
      if (chefQrRef.current) {
        chefQrRef.current.innerHTML = '';
        new QRCodeStyling({ ...options, data: chefUrl }).append(chefQrRef.current);
      }
    }
  }, [showStaffQR, restaurantId]);

  // Toplu masa ekle`
    );
}

// Chef UI return early
if (!content.includes('if (staffRole === \'chef\')')) {
    content = content.replace(
        "if (loading) {",
        `if (staffRole === null) return null;

  if (staffRole === 'chef') {
    return (
      <ChefDashboard 
        restaurantId={restaurantId!}
        orders={orders}
        orderItems={orderItems}
        tables={tables}
        showToast={showToast}
        onLogout={() => {
          localStorage.removeItem(\`staff_role_\${restaurantId}\`);
          window.location.reload();
        }}
      />
    );
  }

  if (loading) {`
    );
}

// Modify Header (Add Staff button for admin, hide admin buttons for waiter)
content = content.replace(
    `<button
              onClick={() => setShowPriorityOrders(true)}`,
    `{staffRole === 'admin' && (
              <button
                onClick={() => setShowStaffQR(true)}
                className="px-4 py-2 bg-purple-100 text-purple-800 border-2 border-purple-500 font-bold hover:bg-purple-200 shadow-pixel-sm active:translate-y-0.5"
              >
                QR Personel
              </button>
            )}
            
            <button
              onClick={() => setShowPriorityOrders(true)}`
);

content = content.replace(
    `<button
              onClick={() => setShowStatistics(true)}
              className="px-5 py-2 bg-blue-100 text-blue-800 border-2 border-blue-500 font-bold hover:bg-blue-200 shadow-pixel-sm transition-all active:translate-y-0.5"
            >
              📊 İstatistikler
            </button>`,
    `{staffRole === 'admin' && (
              <button
                onClick={() => setShowStatistics(true)}
                className="px-5 py-2 bg-blue-100 text-blue-800 border-2 border-blue-500 font-bold hover:bg-blue-200 shadow-pixel-sm transition-all active:translate-y-0.5"
              >
                📊 İstatistikler
              </button>
            )}`
);

content = content.replace(
    `<button
              onClick={() => setShowAddTable(true)}
              className="px-5 py-2 bg-[#8fb38a] text-brand-dark border-2 border-brand-dark font-bold hover:bg-[#a3c79e] shadow-pixel-sm transition-all active:translate-y-0.5"
            >
              + Masa Ekle
            </button>`,
    `{staffRole === 'admin' && (
              <button
                onClick={() => setShowAddTable(true)}
                className="px-5 py-2 bg-[#8fb38a] text-brand-dark border-2 border-brand-dark font-bold hover:bg-[#a3c79e] shadow-pixel-sm transition-all active:translate-y-0.5"
              >
                + Masa Ekle
              </button>
            )}
            {staffRole === 'waiter' && (
              <button
                onClick={() => {
                  localStorage.removeItem(\`staff_role_\${restaurantId}\`);
                  window.location.reload();
                }}
                className="px-4 py-2 bg-red-100 text-red-800 border-2 border-red-500 font-bold hover:bg-red-200 shadow-pixel-sm active:translate-y-0.5"
              >
                Çıkış Yap
              </button>
            )}`
);

// Add Personel QR Modal
if (!content.includes('Personel QR Girişleri')) {
    content = content.replace(
        "{/* TOAST */}",
        `{/* PERSONEL QR MODAL */}
      {showStaffQR && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface border-4 border-brand-dark p-6 w-full max-w-2xl shadow-2xl relative">
            <button onClick={() => setShowStaffQR(false)} className="absolute top-2 right-2 text-2xl font-bold p-2 hover:bg-black/5">✕</button>
            <h2 className="text-2xl font-bold text-brand-dark mb-6 text-center uppercase">Personel QR Girişleri</h2>
            <p className="text-center text-brand-dark/70 font-bold mb-6">Personelinizin sisteme şifresiz girmesi için kendi telefonlarından aşağıdaki QR kodlardan uygun olanını okutmasını sağlayın.</p>
            
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
              {/* Garson */}
              <div className="bg-white border-4 border-brand-dark p-4 flex flex-col items-center">
                <h3 className="text-xl font-bold text-brand-dark mb-4">💁 Garson Girişi</h3>
                <div ref={waiterQrRef} className="w-[200px] h-[200px] bg-gray-100 border border-gray-200"></div>
                <p className="text-sm font-bold text-brand-dark/50 mt-4 text-center">Masa ve siparişleri<br/>teslim etme yetkisi</p>
              </div>

              {/* Şef */}
              <div className="bg-white border-4 border-brand-dark p-4 flex flex-col items-center">
                <h3 className="text-xl font-bold text-brand-dark mb-4">👨‍🍳 Şef (Mutfak) Girişi</h3>
                <div ref={chefQrRef} className="w-[200px] h-[200px] bg-gray-100 border border-gray-200"></div>
                <p className="text-sm font-bold text-brand-dark/50 mt-4 text-center">Sadece mutfak sipariş<br/>ekranı (KDS) yetkisi</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}`
    );
}

fs.writeFileSync(path, content);
console.log('ManagementDashboard.tsx updated.');
