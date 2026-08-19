const fs = require('fs');

const menuPath = 'src/pages/Menu.tsx';
let menuContent = fs.readFileSync(menuPath, 'utf8');

// 1. Replace getFontSizeClasses with getDynamicFontStyles in Menu.tsx
const menuFontRegex = /const getFontSizeClasses = \(size\?: string\) => \{[\s\S]*?\};/s;
const dynamicFontStr = `const getDynamicFontStyles = (size?: string) => {
  const baseSize = parseInt(size || '16') || (size === 'small' ? 14 : size === 'large' ? 20 : size === 'xlarge' ? 24 : 16);
  return {
    cat: { fontSize: \`\${baseSize * 1.25}px\` },
    product: { fontSize: \`\${baseSize}px\` },
    desc: { fontSize: \`\${Math.max(10, baseSize * 0.75)}px\` },
    price: { fontSize: \`\${baseSize * 1.125}px\` },
  };
};`;
menuContent = menuContent.replace(menuFontRegex, dynamicFontStr);
menuContent = menuContent.replace(/const fs = getFontSizeClasses\(restaurant\.font_size\);/g, `const fs = getDynamicFontStyles(restaurant.font_size);`);

// 2. Fix Menu.tsx category title
menuContent = menuContent.replace(
  /className=\{`text-2xl font-black tracking-widest \${fs.cat}`\}/g,
  `className="text-2xl font-black tracking-widest"`
);
// And add ...fs.cat to category style
menuContent = menuContent.replace(
  /style=\{\{ backgroundColor: themeColor, borderColor: themeColor \}\}/g,
  `style={{ backgroundColor: themeColor, borderColor: themeColor, ...fs.cat }}`
);

// 3. Fix Menu.tsx product title
menuContent = menuContent.replace(
  /className=\{`font-bold uppercase leading-tight mb-2 break-words \${fs\.product}`\}\s*style=\{\{ color: themeColor \}\}/g,
  `className="font-bold uppercase leading-tight mb-1 line-clamp-2"\n                              style={{ color: themeColor, ...fs.product }}`
);
menuContent = menuContent.replace(
  /className=\{`font-bold uppercase leading-none mb-2 \${fs\.product}`\}\s*style=\{\{ color: themeColor \}\}/g,
  `className="font-bold uppercase leading-tight mb-1 line-clamp-2"\n                              style={{ color: themeColor, ...fs.product }}`
);

// 4. Fix Menu.tsx product desc
menuContent = menuContent.replace(
  /className=\{`text-sm opacity-70 leading-relaxed mb-3 break-words \${fs\.desc}`\}/g,
  `className="opacity-70 leading-relaxed mb-3 line-clamp-2" style={fs.desc}`
);
menuContent = menuContent.replace(
  /className=\{`text-sm opacity-70 leading-relaxed mb-3 \${fs\.desc}`\}/g,
  `className="opacity-70 leading-relaxed mb-3 line-clamp-2" style={fs.desc}`
);

// 5. Fix Menu.tsx product price
menuContent = menuContent.replace(
  /className=\{`bg-white border-2 px-3 py-1 font-bold whitespace-nowrap \${radiusClass} \${fs\.price}`\}\s*style=\{\{ borderColor: themeColor, color: themeColor \}\}/g,
  `className={\`bg-white border-2 px-3 py-1 font-bold whitespace-nowrap \${radiusClass}\`}\n                                  style={{ borderColor: themeColor, color: themeColor, ...fs.price }}`
);
menuContent = menuContent.replace(
  /className=\{`bg-white border-2 px-3 py-1 font-bold whitespace-nowrap \${radiusClass} \${fs\.price}`\}\s*style=\{\{ borderColor: themeColor, color: themeColor \}\}/g,
  `className={\`bg-white border-2 px-3 py-1 font-bold whitespace-nowrap \${radiusClass}\`}\n                                style={{ borderColor: themeColor, color: themeColor, ...fs.price }}`
);

fs.writeFileSync(menuPath, menuContent);


const settingsPath = 'src/components/admin/SettingsTab.tsx';
let settingsContent = fs.readFileSync(settingsPath, 'utf8');

// 1. Replace getFontSizeClasses with getDynamicFontStyles in SettingsTab.tsx
const settingsFontRegex = /export const getFontSizeClasses = \(size\?: string\) => \{[\s\S]*?\};/s;
const settingsDynamicFontStr = `export const getDynamicFontStyles = (size?: string) => {
  const baseSize = parseInt(size || '16') || (size === 'small' ? 14 : size === 'large' ? 20 : size === 'xlarge' ? 24 : 16);
  return {
    cat: { fontSize: \`\${baseSize * 1.25}px\` },
    product: { fontSize: \`\${baseSize}px\` },
    desc: { fontSize: \`\${Math.max(10, baseSize * 0.75)}px\` },
    price: { fontSize: \`\${baseSize * 1.125}px\` },
  };
};`;
settingsContent = settingsContent.replace(settingsFontRegex, settingsDynamicFontStr);

// 2. Replace FONT_SIZE_OPTIONS button group with a range slider
const oldSliderRegex = /<div className="flex bg-admin-surface border-2 border-admin-border">[\s\S]*?<\/div>\s*<\/div>\s*<div>\s*<label className="block font-bold mb-2">Buton Şekilleri<\/label>/;
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
settingsContent = settingsContent.replace(oldSliderRegex, newSlider);
settingsContent = settingsContent.replace(/<label className="block font-bold mb-2">Yazı Boyutu<\/label>/g, `<label className="block font-bold mb-2">Yazı Boyutu ({parseInt(fontSize || '16') || (fontSize === 'small' ? 14 : fontSize === 'large' ? 20 : fontSize === 'xlarge' ? 24 : 16)}px)</label>`);

// 3. Fix SettingsTab preview classes and styles
// First, replace getFontSizeClasses(fontSize) calls with getDynamicFontStyles
settingsContent = settingsContent.replace(/getFontSizeClasses\(fontSize\)/g, 'getDynamicFontStyles(fontSize)');

// Product Title
settingsContent = settingsContent.replace(
  /className=\{`font-bold leading-tight break-words \$\{getDynamicFontStyles\(fontSize\)\.product\}`\} style=\{\{ color: getTextColorForBackground\(cardBgColor\) \}\}/g,
  `className="font-bold leading-tight line-clamp-2" style={{ color: getTextColorForBackground(cardBgColor), ...getDynamicFontStyles(fontSize).product }}`
);
settingsContent = settingsContent.replace(
  /className=\{`font-bold mb-1 \$\{getDynamicFontStyles\(fontSize\)\.product\}`\} style=\{\{ color: getTextColorForBackground\(cardBgColor\) \}\}/g,
  `className="font-bold mb-1 line-clamp-2" style={{ color: getTextColorForBackground(cardBgColor), ...getDynamicFontStyles(fontSize).product }}`
);

// Product Desc
settingsContent = settingsContent.replace(
  /className=\{`opacity-70 truncate \$\{getDynamicFontStyles\(fontSize\)\.desc\}`\}/g,
  `className="opacity-70 line-clamp-2" style={getDynamicFontStyles(fontSize).desc}`
);

// Product Price
settingsContent = settingsContent.replace(
  /className=\{`font-bold flex items-center \$\{getDynamicFontStyles\(fontSize\)\.price\}`\} style=\{\{ color: themeColor \}\}/g,
  `className="font-bold flex items-center" style={{ color: themeColor, ...getDynamicFontStyles(fontSize).price }}`
);
settingsContent = settingsContent.replace(
  /className=\{`font-bold mt-auto \$\{getDynamicFontStyles\(fontSize\)\.price\}`\} style=\{\{ color: themeColor \}\}/g,
  `className="font-bold mt-auto" style={{ color: themeColor, ...getDynamicFontStyles(fontSize).price }}`
);

fs.writeFileSync(settingsPath, settingsContent);
console.log('Fixed font slider and styles in both files!');
