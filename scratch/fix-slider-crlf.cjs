const fs = require('fs');

function processFile(path, oldText, newText) {
  let c = fs.readFileSync(path, 'utf8');
  c = c.replace(/\r\n/g, '\n');
  oldText = oldText.replace(/\r\n/g, '\n');
  if (c.includes(oldText)) {
    c = c.replace(oldText, newText);
    fs.writeFileSync(path, c);
    console.log("Success for " + path);
  } else {
    console.log("Not found in " + path);
  }
}

// Menu.tsx
const p1 = 'src/pages/Menu.tsx';
let c1 = fs.readFileSync(p1, 'utf8').replace(/\r\n/g, '\n');

const mOldFont = `const getFontSizeClasses = (size?: string) => {
  switch (size) {
    case 'small':  return { cat: 'text-lg',  product: 'text-lg',  desc: 'text-sm',  price: 'text-lg'  };
    case 'large':  return { cat: 'text-3xl', product: 'text-3xl', desc: 'text-xl',  price: 'text-2xl' };
    case 'xlarge': return { cat: 'text-4xl', product: 'text-4xl', desc: 'text-2xl', price: 'text-3xl' };
    default:       return { cat: 'text-2xl', product: 'text-2xl', desc: 'text-lg',  price: 'text-xl'  };
  }
};`;
const mNewFont = `const getDynamicFontStyles = (size?: string) => {
  const baseSize = parseInt(size || '16') || (size === 'small' ? 14 : size === 'large' ? 20 : size === 'xlarge' ? 24 : 16);
  return {
    cat: { fontSize: \`\${baseSize * 1.25}px\` },
    product: { fontSize: \`\${baseSize}px\` },
    desc: { fontSize: \`\${Math.max(10, baseSize * 0.75)}px\` },
    price: { fontSize: \`\${baseSize * 1.125}px\` },
  };
};`;
c1 = c1.replace(mOldFont, mNewFont);
c1 = c1.replace(/const fs = getFontSizeClasses\(restaurant\.font_size\);/g, `const fs = getDynamicFontStyles(restaurant.font_size);`);
c1 = c1.replace(/className=\{`text-2xl font-black tracking-widest \$\{fs\.cat\}`\}/g, `className="font-black tracking-widest"`);
c1 = c1.replace(`style={{ backgroundColor: themeColor, borderColor: themeColor }}`, `style={{ backgroundColor: themeColor, borderColor: themeColor, ...fs.cat }}`);
c1 = c1.replace(
  /className=\{`font-bold uppercase leading-none mb-2 \$\{fs\.product\}`\}\s*style=\{\{ color: themeColor \}\}/g,
  `className="font-bold uppercase leading-tight mb-1 line-clamp-2" style={{ color: themeColor, ...fs.product }}`
);
c1 = c1.replace(
  /className=\{`text-sm opacity-70 leading-relaxed mb-3 \$\{fs\.desc\}`\}/g,
  `className="opacity-70 leading-relaxed mb-3 line-clamp-2" style={fs.desc}`
);
c1 = c1.replace(
  /className=\{`bg-white border-2 px-3 py-1 font-bold whitespace-nowrap \$\{radiusClass\} \$\{fs\.price\}`\}\s*style=\{\{ borderColor: themeColor, color: themeColor \}\}/g,
  `className={\`bg-white border-2 px-3 py-1 font-bold whitespace-nowrap \${radiusClass}\`} style={{ borderColor: themeColor, color: themeColor, ...fs.price }}`
);
c1 = c1.replace(/className="flex-1 flex flex-col justify-center"/g, `className="flex-1 flex flex-col justify-center min-w-0"`);
c1 = c1.replace(/className="flex flex-col justify-between items-end shrink-0 gap-2"/g, `className="flex flex-col justify-between items-end shrink-0 gap-2 ml-2"`);
fs.writeFileSync(p1, c1);


// SettingsTab.tsx
const p2 = 'src/components/admin/SettingsTab.tsx';
let c2 = fs.readFileSync(p2, 'utf8').replace(/\r\n/g, '\n');

const sOldFont = `export const getFontSizeClasses = (size?: string) => {
    switch (size) {
      case 'small':  return { cat: 'text-xl', product: 'text-xl', desc: 'text-sm', price: 'text-lg' };
      case 'medium': return { cat: 'text-2xl', product: 'text-2xl', desc: 'text-lg', price: 'text-xl' };
      case 'large':  return { cat: 'text-3xl', product: 'text-3xl', desc: 'text-xl', price: 'text-2xl' };
      case 'xlarge': return { cat: 'text-4xl', product: 'text-4xl', desc: 'text-2xl', price: 'text-3xl' };
      default:       return { cat: 'text-2xl', product: 'text-2xl', desc: 'text-lg', price: 'text-xl' };
    }
  };`;
const sNewFont = `export const getDynamicFontStyles = (size?: string) => {
  const baseSize = parseInt(size || '16') || (size === 'small' ? 14 : size === 'large' ? 20 : size === 'xlarge' ? 24 : 16);
  return {
    cat: { fontSize: \`\${baseSize * 1.25}px\` },
    product: { fontSize: \`\${baseSize}px\` },
    desc: { fontSize: \`\${Math.max(10, baseSize * 0.75)}px\` },
    price: { fontSize: \`\${baseSize * 1.125}px\` },
  };
};`;
c2 = c2.replace(sOldFont, sNewFont);

const sliderRegex = /<div className="flex bg-admin-surface border-2 border-admin-border">[\s\S]*?<\/div>\s*<\/div>\s*<div>\s*<label className="block font-bold mb-2">Buton Şekilleri<\/label>/;
const newSlider = `<div className="bg-admin-surface border-2 border-admin-border p-4 flex items-center gap-4">
                  <span className="text-sm font-bold">A</span>
                  <input 
                    type="range" 
                    min="12" 
                    max="28" 
                    step="1" 
                    value={parseInt(fontSize || '16') || (fontSize === 'small' ? 14 : fontSize === 'large' ? 20 : fontSize === 'xlarge' ? 24 : 16)}
                    onChange={(e) => { setFontSize(e.target.value); }}
                    onMouseUp={saveToHistory}
                    onTouchEnd={saveToHistory}
                    className="flex-1 accent-brand cursor-pointer"
                  />
                  <span className="text-2xl font-bold">A</span>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-2">Buton Şekilleri</label>`;
c2 = c2.replace(sliderRegex, newSlider);
c2 = c2.replace(/<label className="block font-bold mb-2">Yazı Boyutu<\/label>/g, `<label className="block font-bold mb-2">Yazı Boyutu ({parseInt(fontSize || '16') || (fontSize === 'small' ? 14 : fontSize === 'large' ? 20 : fontSize === 'xlarge' ? 24 : 16)}px)</label>`);

c2 = c2.replace(/getFontSizeClasses\(fontSize\)/g, 'getDynamicFontStyles(fontSize)');
c2 = c2.replace(/className=\{`font-bold mb-1 \$\{getDynamicFontStyles\(fontSize\)\.product\}`\}/g, `className="font-bold mb-1 line-clamp-2"`);
c2 = c2.replace(/className=\{`font-bold leading-tight break-words \$\{getDynamicFontStyles\(fontSize\)\.product\}`\}/g, `className="font-bold leading-tight line-clamp-2"`);
c2 = c2.replace(/className=\{`opacity-70 truncate \$\{getDynamicFontStyles\(fontSize\)\.desc\}`\}/g, `className="opacity-70 line-clamp-2"`);
c2 = c2.replace(/className=\{`opacity-70 \$\{getDynamicFontStyles\(fontSize\)\.desc\}`\}/g, `className="opacity-70 line-clamp-2"`);
c2 = c2.replace(/className=\{`font-bold flex items-center \$\{getDynamicFontStyles\(fontSize\)\.price\}`\}/g, `className="font-bold flex items-center"`);
c2 = c2.replace(/className=\{`font-bold mt-auto \$\{getDynamicFontStyles\(fontSize\)\.price\}`\}/g, `className="font-bold mt-auto"`);
c2 = c2.replace(/style=\{\{ color: getTextColorForBackground\(cardBgColor\) \}\}/g, `style={{ color: getTextColorForBackground(cardBgColor), ...getDynamicFontStyles(fontSize).product }}`);
c2 = c2.replace(/className="opacity-70 line-clamp-2">/g, `className="opacity-70 line-clamp-2" style={getDynamicFontStyles(fontSize).desc}>`);
c2 = c2.replace(/style=\{\{ color: themeColor \}\}/g, `style={{ color: themeColor, ...getDynamicFontStyles(fontSize).price }}`);
c2 = c2.replace(/className="flex-1 mt-1 flex flex-col justify-center"/g, `className="flex-1 mt-1 flex flex-col justify-center min-w-0"`);
c2 = c2.replace(/export const FONT_SIZE_OPTIONS = \[[\s\S]*?\];/s, '');

fs.writeFileSync(p2, c2);

console.log("Done");
