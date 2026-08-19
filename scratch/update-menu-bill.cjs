const fs = require('fs');

const path = 'src/pages/Menu.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add translation keys to the T interface
content = content.replace(
    "waiterCalled: string;\n}> = {",
    "waiterCalled: string;\n  myBill: string;\n  billRequested: string;\n}> = {"
);

// Add translation keys
content = content.replace(
    "callWaiter: 'Garson Çağır', waiterCalled: 'Garson Çağrıldı! 🔔',",
    "callWaiter: 'Garson Çağır', waiterCalled: 'Garson Çağrıldı! 🔔', myBill: 'Hesabım', billRequested: 'Hesap İstendi! ✓',"
);
content = content.replace(
    "callWaiter: 'Call Waiter', waiterCalled: 'Waiter Called! 🔔',",
    "callWaiter: 'Call Waiter', waiterCalled: 'Waiter Called! 🔔', myBill: 'My Bill', billRequested: 'Bill Requested! ✓',"
);
content = content.replace(
    "callWaiter: 'Kellner Rufen', waiterCalled: 'Kellner Gerufen! 🔔',",
    "callWaiter: 'Kellner Rufen', waiterCalled: 'Kellner Gerufen! 🔔', myBill: 'Meine Rechnung', billRequested: 'Rechnung Angefordert! ✓',"
);
content = content.replace(
    "callWaiter: 'استدعاء النادل', waiterCalled: 'تم استدعاء النادل! 🔔',",
    "callWaiter: 'استدعاء النادل', waiterCalled: 'تم استدعاء النادل! 🔔', myBill: 'حسابي', billRequested: 'تم طلب الحساب! ✓',"
);
content = content.replace(
    "callWaiter: 'Позвать Официанта', waiterCalled: 'Официант Вызван! 🔔',",
    "callWaiter: 'Позвать Официанта', waiterCalled: 'Официант Вызван! 🔔', myBill: 'Мой счет', billRequested: 'Счет Запрошен! ✓',"
);
content = content.replace(
    "callWaiter: 'Appeler le Serveur', waiterCalled: 'Serveur Appelé! 🔔',",
    "callWaiter: 'Appeler le Serveur', waiterCalled: 'Serveur Appelé! 🔔', myBill: 'Mon Addition', billRequested: 'Addition Demandée! ✓',"
);


// Add states for MyOrders
content = content.replace(
    "const [orderSuccess, setOrderSuccess] = useState(false);",
    "const [orderSuccess, setOrderSuccess] = useState(false);\n  const [myOrdersOpen, setMyOrdersOpen] = useState(false);\n  const [myOrders, setMyOrders] = useState<any[]>([]);\n  const [myOrderItems, setMyOrderItems] = useState<any[]>([]);\n  const [isRequestingBill, setIsRequestingBill] = useState(false);\n  const [hasRequestedBill, setHasRequestedBill] = useState(false);"
);

// Add fetchMyOrders logic
content = content.replace(
    "const submitOrder = async () => {",
    `const fetchMyOrders = async () => {
    if (!tableId) return;
    const { data: ordersData } = await supabase.from('orders').select('*').eq('table_id', tableId).neq('status', 'paid');
    if (ordersData && ordersData.length > 0) {
      setMyOrders(ordersData);
      const orderIds = ordersData.map(o => o.id);
      const { data: itemsData } = await supabase.from('order_items').select('*').in('order_id', orderIds);
      if (itemsData) setMyOrderItems(itemsData);
    } else {
      setMyOrders([]);
      setMyOrderItems([]);
    }
  };

  useEffect(() => {
    if (myOrdersOpen) fetchMyOrders();
  }, [myOrdersOpen]);

  const handleRequestBill = async () => {
    if (!tableId || !restaurant || hasRequestedBill) return;
    setIsRequestingBill(true);
    
    // Create dummy order
    await supabase.from('orders').insert({
      restaurant_id: restaurant.id,
      table_id: tableId,
      total_amount: 0,
      note: "HESAP İSTENİYOR"
    });
    // Call waiter
    await supabase.from('tables').update({ needs_waiter: true }).eq('id', tableId);
    
    setHasRequestedBill(true);
    setToast(t.billRequested);
    setTimeout(() => setToast(null), 3000);
    setTimeout(() => setHasRequestedBill(false), 60000); // 1 min cooldown
    setIsRequestingBill(false);
    setMyOrdersOpen(false);
  };

  const submitOrder = async () => {`
);

// Add the button logic in JSX
content = content.replace(
    "{/* DİL SEÇİCİ — Sağ Alt Köşe */}",
    `{/* HESABIM BUTONU */}
      {tableId && (
        <button
          onClick={() => setMyOrdersOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 font-bold border-4 shadow-xl transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: 'white',
            borderColor: themeColor,
            color: themeColor,
            borderRadius: restaurant.button_shape === 'pill' ? '999px' : restaurant.button_shape === 'rounded' ? '1rem' : '0px',
            boxShadow: \`0 4px 15px \${themeColor}40\`,
          }}
        >
          <span className="text-xl">🧾</span>
          <span className="hidden sm:inline">{t.myBill}</span>
        </button>
      )}

      {/* HESABIM MODAL */}
      {myOrdersOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setMyOrdersOpen(false)}>
          <div 
            className="w-full max-w-md bg-white border-4 shadow-2xl p-6 flex flex-col max-h-[80vh] overflow-hidden"
            style={{ borderColor: themeColor, borderRadius: borderRadiusValue }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b-2 pb-2" style={{ borderColor: themeColor }}>
              <h2 className="text-2xl font-bold uppercase" style={{ color: themeColor }}>{t.myBill}</h2>
              <button onClick={() => setMyOrdersOpen(false)} className="text-3xl hover:opacity-70">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 py-2">
              {myOrderItems.filter(item => item.status !== 'cancelled').length === 0 ? (
                <div className="text-center font-bold text-gray-500 py-8">Henüz verilmiş bir siparişiniz yok.</div>
              ) : (
                <div className="divide-y-2" style={{ borderColor: \`\${themeColor}20\` }}>
                  {myOrderItems.filter(item => item.status !== 'cancelled').map(item => (
                    <div key={item.id} className="py-3 flex justify-between items-center gap-4">
                      <div className="flex-1 leading-tight">
                        <div className="font-bold uppercase" style={{ color: themeColor }}>
                          {item.quantity}x {translations[item.product_name] || item.product_name}
                        </div>
                        {item.selected_options && item.selected_options.length > 0 && (
                          <div className="text-xs font-bold opacity-70 mt-1">
                            {item.selected_options.map((o: any) => o.choiceName).join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="font-bold">{(item.unit_price * item.quantity).toFixed(0)} ₺</div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 border" style={{
                          backgroundColor: item.status === 'delivered' ? '#dcfce7' : item.status === 'ready' ? '#fef9c3' : item.status === 'preparing' ? '#ffedd5' : '#f3f4f6',
                          borderColor: item.status === 'delivered' ? '#86efac' : item.status === 'ready' ? '#fde047' : item.status === 'preparing' ? '#fdba74' : '#d1d5db',
                          color: item.status === 'delivered' ? '#166534' : item.status === 'ready' ? '#854d0e' : item.status === 'preparing' ? '#c2410c' : '#374151'
                        }}>
                          {item.status === 'delivered' ? 'Teslim Edildi' : item.status === 'ready' ? 'Hazır' : item.status === 'preparing' ? 'Hazırlanıyor' : 'Bekliyor'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t-4 flex flex-col gap-4" style={{ borderColor: themeColor }}>
              <div className="flex justify-between items-center text-2xl font-bold" style={{ color: themeColor }}>
                <span>{t.total}:</span>
                <span>{myOrders.reduce((acc, o) => acc + o.total_amount, 0).toFixed(0)} ₺</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setMyOrdersOpen(false)}
                  className="w-1/3 py-3 text-xl font-bold border-2 transition-all active:scale-95 text-white"
                  style={{ backgroundColor: '#9ca3af', borderColor: '#9ca3af', borderRadius: borderRadiusValue }}
                >
                  Kapat
                </button>
                <button 
                  onClick={handleRequestBill}
                  disabled={isRequestingBill || hasRequestedBill || myOrderItems.length === 0}
                  className="w-2/3 py-3 text-lg font-bold border-2 transition-all active:scale-95 text-white disabled:opacity-50"
                  style={{ backgroundColor: themeColor, borderColor: themeColor, borderRadius: borderRadiusValue }}
                >
                  💳 Hesap İste
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DİL SEÇİCİ — Sağ Alt Köşe */}`
);

// DİL SEÇİCİ - Sağ Alt Köşe is fixed to bottom-6 right-6, which will overlap with Hesabım button!
content = content.replace(
    `className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"`,
    `className={\`fixed \${tableId ? 'bottom-24' : 'bottom-6'} right-6 z-50 flex flex-col items-end gap-2\`}`
);


fs.writeFileSync(path, content);
console.log('Menu.tsx updated with My Bill (fixed T interface).');
