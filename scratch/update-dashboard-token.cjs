const fs = require('fs');

const path = 'src/pages/ManagementDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add import
if (!content.includes("import { getStaffToken } from '../utils/auth';")) {
  content = content.replace(
    "import type { Category, Product } from '../types/admin';",
    "import type { Category, Product } from '../types/admin';\nimport { getStaffToken } from '../utils/auth';"
  );
}

// Update waiterUrl and chefUrl
content = content.replace(
  "const waiterUrl = `${baseUrl}/staff/${restaurantId}?role=waiter`;\n      const chefUrl = `${baseUrl}/staff/${restaurantId}?role=chef`;",
  "const token = getStaffToken(restaurantId);\n      const waiterUrl = `${baseUrl}/staff/${restaurantId}?role=waiter&token=${token}`;\n      const chefUrl = `${baseUrl}/staff/${restaurantId}?role=chef&token=${token}`;"
);

// Update bottom links
content = content.replace(
  "href={`\${window.location.origin}/staff/\${restaurantId}?role=waiter`}",
  "href={`\${window.location.origin}/staff/\${restaurantId}?role=waiter&token=\${getStaffToken(restaurantId)}`}"
);
content = content.replace(
  "href={`\${window.location.origin}/staff/\${restaurantId}?role=chef`}",
  "href={`\${window.location.origin}/staff/\${restaurantId}?role=chef&token=\${getStaffToken(restaurantId)}`}"
);

fs.writeFileSync(path, content);
console.log('ManagementDashboard updated for token usage.');
