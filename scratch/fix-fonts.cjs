const fs = require('fs');

const menuPath = 'src/pages/Menu.tsx';
let menuContent = fs.readFileSync(menuPath, 'utf8');

const menuOldFonts = `const getFontSizeClasses = (size?: string) => {
    switch (size) {
      case 'small':  return { cat: 'text-lg',  product: 'text-lg',  desc: 'text-sm',  price: 'text-lg'  };
      case 'large':  return { cat: 'text-3xl', product: 'text-3xl', desc: 'text-xl',  price: 'text-2xl' };
      case 'xlarge': return { cat: 'text-4xl', product: 'text-4xl', desc: 'text-2xl', price: 'text-3xl' };
      default:       return { cat: 'text-2xl', product: 'text-2xl', desc: 'text-lg',  price: 'text-xl'  };
    }
  };`;

const newFonts = `const getFontSizeClasses = (size?: string) => {
    switch (size) {
      case 'small':  return { cat: 'text-base', product: 'text-base', desc: 'text-xs', price: 'text-sm' };
      case 'large':  return { cat: 'text-xl',   product: 'text-xl',   desc: 'text-base', price: 'text-lg' };
      case 'xlarge': return { cat: 'text-2xl',  product: 'text-2xl',  desc: 'text-lg', price: 'text-xl' };
      default:       return { cat: 'text-lg',   product: 'text-lg',   desc: 'text-sm', price: 'text-base' };
    }
  };`;

menuContent = menuContent.replace(menuOldFonts, newFonts);

// Fix Menu.tsx list layout flex-1 to have min-w-0
menuContent = menuContent.replace(
  `className="flex-1 flex flex-col justify-center"`,
  `className="flex-1 flex flex-col justify-center min-w-0"`
);

// Fix Menu.tsx h3 to truncate or break-words
menuContent = menuContent.replace(
  `className={\`font-bold uppercase leading-none mb-2 \${fs.product}\`}`,
  `className={\`font-bold uppercase leading-tight mb-2 break-words \${fs.product}\`}`
);

fs.writeFileSync(menuPath, menuContent);


const settingsPath = 'src/components/admin/SettingsTab.tsx';
let settingsContent = fs.readFileSync(settingsPath, 'utf8');

const settingsOldFonts = `export const getFontSizeClasses = (size?: string) => {
    switch (size) {
      case 'small':  return { cat: 'text-xl', product: 'text-xl', desc: 'text-sm', price: 'text-lg' };
      case 'medium': return { cat: 'text-2xl', product: 'text-2xl', desc: 'text-lg', price: 'text-xl' };
      case 'large':  return { cat: 'text-3xl', product: 'text-3xl', desc: 'text-xl', price: 'text-2xl' };
      case 'xlarge': return { cat: 'text-4xl', product: 'text-4xl', desc: 'text-2xl', price: 'text-3xl' };
      default:       return { cat: 'text-2xl', product: 'text-2xl', desc: 'text-lg', price: 'text-xl' };
    }
  };`;

const newSettingsFonts = `export const getFontSizeClasses = (size?: string) => {
    switch (size) {
      case 'small':  return { cat: 'text-base', product: 'text-base', desc: 'text-xs', price: 'text-sm' };
      case 'medium': return { cat: 'text-lg',   product: 'text-lg',   desc: 'text-sm', price: 'text-base' };
      case 'large':  return { cat: 'text-xl',   product: 'text-xl',   desc: 'text-base', price: 'text-lg' };
      case 'xlarge': return { cat: 'text-2xl',  product: 'text-2xl',  desc: 'text-lg', price: 'text-xl' };
      default:       return { cat: 'text-lg',   product: 'text-lg',   desc: 'text-sm', price: 'text-base' };
    }
  };`;

settingsContent = settingsContent.replace(settingsOldFonts, newSettingsFonts);

// Fix SettingsTab layout issues
settingsContent = settingsContent.replace(
  /className="flex-1 mt-1 flex flex-col justify-center"/g,
  'className="flex-1 mt-1 flex flex-col justify-center min-w-0"'
);

settingsContent = settingsContent.replace(
  /className={`font-bold \${getFontSizeClasses\(fontSize\)\.product}`}/g,
  'className={`font-bold leading-tight break-words ${getFontSizeClasses(fontSize).product}`}'
);

settingsContent = settingsContent.replace(
  /className={`opacity-70 \${getFontSizeClasses\(fontSize\)\.desc}`}/g,
  'className={`opacity-70 truncate ${getFontSizeClasses(fontSize).desc}`}'
);


fs.writeFileSync(settingsPath, settingsContent);
console.log('Fixed fonts and layouts in both files!');
