const fs = require('fs');

const path = 'src/components/pos/TableDetailModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add staffRole prop to interface
if (!content.includes('staffRole?:')) {
    content = content.replace(
        "showToast: (msg: string, type?: 'success' | 'error') => void;",
        "showToast: (msg: string, type?: 'success' | 'error') => void;\n  staffRole?: 'admin' | 'waiter' | 'chef' | null;"
    );
}

// Add staffRole to destructured props
content = content.replace(
    "onClose, showToast",
    "onClose, showToast, staffRole"
);

// Prevent waiters from seeing or editing names and deleting tables
content = content.replace(
    `<button onClick={() => setIsEditingLabel(true)} className="text-brand-dark/50 hover:text-brand-dark text-lg p-1" title="İsmi Düzenle">
                    ✎
                  </button>`,
    `{staffRole === 'admin' && (
                    <button onClick={() => setIsEditingLabel(true)} className="text-brand-dark/50 hover:text-brand-dark text-lg p-1" title="İsmi Düzenle">
                      ✎
                    </button>
                  )}`
);

content = content.replace(
    `<button onClick={handleDeleteTable} className="text-red-500/50 hover:text-red-600 text-lg p-1" title="Masayı Sil">
                    🗑️
                  </button>`,
    `{staffRole === 'admin' && (
                    <button onClick={handleDeleteTable} className="text-red-500/50 hover:text-red-600 text-lg p-1" title="Masayı Sil">
                      🗑️
                    </button>
                  )}`
);

// Modify item advance logic
content = content.replace(
    "const canAdvance = item.status !== 'delivered' && item.status !== 'cancelled';",
    "const canAdvance = item.status !== 'delivered' && item.status !== 'cancelled' && (staffRole === 'admin' || (staffRole === 'waiter' && item.status === 'ready'));"
);

// Modify mark paid logic
content = content.replace(
    `const handleMarkPaid = async () => {`,
    `const handleMarkPaid = async () => {
    if (staffRole === 'chef') {
      showToast('Şefler hesap kapatamaz.', 'error');
      return;
    }`
);

fs.writeFileSync(path, content);
console.log('TableDetailModal.tsx updated.');

// Also we must update ManagementDashboard to pass staffRole
const dbPath = 'src/pages/ManagementDashboard.tsx';
let dbContent = fs.readFileSync(dbPath, 'utf8');
if (!dbContent.includes('staffRole={staffRole}')) {
    dbContent = dbContent.replace(
        "showToast={showToast}",
        "showToast={showToast}\n          staffRole={staffRole}"
    );
    fs.writeFileSync(dbPath, dbContent);
    console.log('ManagementDashboard.tsx updated for staffRole passing.');
}
