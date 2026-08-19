const fs = require('fs');
const path = 'src/pages/Menu.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /const getFontSizeClasses = \(size\?: string\) => \{\s*switch \(size\) \{\s*case 'small':.*?default:.*?\}\s*\};/s;

const newStr = `const getFontSizeClasses = (size?: string) => {
  switch (size) {
    case 'small':  return { cat: 'text-base', product: 'text-base', desc: 'text-xs', price: 'text-sm' };
    case 'large':  return { cat: 'text-xl',   product: 'text-xl',   desc: 'text-base', price: 'text-lg' };
    case 'xlarge': return { cat: 'text-2xl',  product: 'text-2xl',  desc: 'text-lg', price: 'text-xl' };
    default:       return { cat: 'text-lg',   product: 'text-lg',   desc: 'text-sm', price: 'text-base' };
  }
};`;

if (regex.test(content)) {
  content = content.replace(regex, newStr);
  console.log("Successfully replaced fonts in Menu.tsx");
} else {
  console.log("Error: Target regex not matched in Menu.tsx");
}

const listFlexStr = `className="flex-1 flex flex-col justify-center"`;
const newListFlexStr = `className="flex-1 flex flex-col justify-center min-w-0"`;
content = content.replace(listFlexStr, newListFlexStr);

const h3Str = `className={\`font-bold uppercase leading-none mb-2 \${fs.product}\`}`;
const newH3Str = `className={\`font-bold uppercase leading-tight mb-2 break-words \${fs.product}\`}`;
content = content.replace(h3Str, newH3Str);

fs.writeFileSync(path, content);
