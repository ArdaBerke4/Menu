const fs = require('fs');
let code = fs.readFileSync('src/pages/ManagementDashboard.tsx', 'utf8');

// 1. Imports
if (!code.includes('StatisticsModal')) {
  code = code.replace(
    "import { PriorityOrdersModal } from '../components/pos/PriorityOrdersModal';",
    "import { PriorityOrdersModal } from '../components/pos/PriorityOrdersModal';\nimport { StatisticsModal } from '../components/pos/StatisticsModal';"
  );
}

// 2. State
if (!code.includes('showStatistics')) {
  code = code.replace(
    "const [showPriorityOrders, setShowPriorityOrders] = useState(false);",
    "const [showPriorityOrders, setShowPriorityOrders] = useState(false);\n  const [showStatistics, setShowStatistics] = useState(false);"
  );
}

// 3. Button
if (!code.includes('showStatistics(true)')) {
  code = code.replace(
    /onClick=\{\(\) => setShowPriorityOrders\(true\)\}[\s\S]*?Öncelikli Siparişler[\s\S]*?<\/button>/,
    match => match + `\n            <button
              onClick={() => setShowStatistics(true)}
              className="px-5 py-2 bg-blue-100 text-blue-800 border-2 border-blue-500 font-bold hover:bg-blue-200 shadow-pixel-sm transition-all active:translate-y-0.5"
            >
              📊 İstatistikler
            </button>`
  );
}

// 4. Modal
if (!code.includes('<StatisticsModal')) {
  code = code.replace(
    "{/* TOAST BİLDİRİMİ */}",
    `{showStatistics && restaurantId && (
        <StatisticsModal
          restaurantId={restaurantId}
          onClose={() => setShowStatistics(false)}
        />
      )}

      {/* TOAST BİLDİRİMİ */}`
  );
}

fs.writeFileSync('src/pages/ManagementDashboard.tsx', code);
console.log('ManagementDashboard updated');
