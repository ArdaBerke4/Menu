const fs = require('fs');
const path = 'src/pages/Menu.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `const getFontSizeClasses = (size?: string) => {
  switch (size) {
    case 'small':  return { cat: 'text-lg',  product: 'text-lg',  desc: 'text-sm',  price: 'text-lg'  };
    case 'large':  return { cat: 'text-3xl', product: 'text-3xl', desc: 'text-xl',  price: 'text-2xl' };
    case 'xlarge': return { cat: 'text-4xl', product: 'text-4xl', desc: 'text-2xl', price: 'text-3xl' };
    default:       return { cat: 'text-2xl', product: 'text-2xl', desc: 'text-lg',  price: 'text-xl'  };
  }
};`;

const newStr = `const getFontSizeClasses = (size?: string) => {
  switch (size) {
    case 'small':  return { cat: 'text-base', product: 'text-base', desc: 'text-xs', price: 'text-sm' };
    case 'large':  return { cat: 'text-xl',   product: 'text-xl',   desc: 'text-base', price: 'text-lg' };
    case 'xlarge': return { cat: 'text-2xl',  product: 'text-2xl',  desc: 'text-lg', price: 'text-xl' };
    default:       return { cat: 'text-lg',   product: 'text-lg',   desc: 'text-sm', price: 'text-base' };
  }
};`;

if(content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  console.log("Successfully replaced fonts in Menu.tsx");
} else {
  console.log("Error: Target string not found in Menu.tsx");
}

const listFlexStr = `className="flex-1 flex flex-col justify-center"`;
const newListFlexStr = `className="flex-1 flex flex-col justify-center min-w-0"`;
content = content.replace(listFlexStr, newListFlexStr);

const h3Str = `className={\`font-bold uppercase leading-none mb-2 \${fs.product}\`}`;
const newH3Str = `className={\`font-bold uppercase leading-tight mb-2 break-words \${fs.product}\`}`;
content = content.replace(h3Str, newH3Str);

fs.writeFileSync(path, content);
