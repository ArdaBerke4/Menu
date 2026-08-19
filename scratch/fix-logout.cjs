const fs = require('fs');
const path = 'src/pages/ManagementDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace Chef logout
content = content.replace(
    "onLogout={() => {\n          localStorage.removeItem(`staff_role_${restaurantId}`);\n          window.location.reload();\n        }}",
    "onLogout={() => {\n          localStorage.removeItem(`staff_role_${restaurantId}`);\n          navigate(`/menu/${restaurant?.slug || restaurantId}`);\n        }}"
);

// Replace Waiter logout
content = content.replace(
    "onClick={() => {\n                  localStorage.removeItem(`staff_role_${restaurantId}`);\n                  window.location.reload();\n                }}",
    "onClick={() => {\n                  localStorage.removeItem(`staff_role_${restaurantId}`);\n                  navigate(`/menu/${restaurant?.slug || restaurantId}`);\n                }}"
);

fs.writeFileSync(path, content);
console.log('ManagementDashboard logout routing updated.');
