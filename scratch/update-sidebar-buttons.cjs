const fs = require('fs');

const path = 'src/pages/Admin.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /'bg-brand text-surface shadow-admin-pixel' : 'bg-brand-light text-admin-text hover:bg-admin-surface'/g,
  "'bg-admin-primary text-admin-primary-text shadow-admin-pixel' : 'bg-admin-surface text-admin-text hover:bg-admin-sidebar-hover'"
);

content = content.replace(
  /"w-full px-2 py-3 bg-brand text-surface border-2/g,
  '"w-full px-2 py-3 bg-admin-primary text-admin-primary-text border-2'
);

content = content.replace(
  /"w-full px-2 py-2 bg-brand-light text-admin-text border-2/g,
  '"w-full px-2 py-2 bg-admin-surface text-admin-text border-2'
);

fs.writeFileSync(path, content);
console.log('Admin sidebar buttons updated to use dynamic admin theme.');
