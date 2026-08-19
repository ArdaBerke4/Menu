const fs = require('fs');

function processMenu() {
  const p = 'src/pages/Menu.tsx';
  let c = fs.readFileSync(p, 'utf8');

  // Replace getFontSizeClasses definition
  const regex = /const getFontSizeClasses = \(size\?: string\) => \{[\s\S]*?\};/s;
  const newFontDef = `const getDynamicFontStyles = (size?: string) => {
  const baseSize = parseInt(size || '16') || (size === 'small' ? 14 : size === 'large' ? 20 : size === 'xlarge' ? 24 : 16);
  return {
    cat: { fontSize: \`\${baseSize * 1.25}px\` },
    product: { fontSize: \`\${baseSize}px\` },
    desc: { fontSize: \`\${Math.max(10, baseSize * 0.75)}px\` },
    price: { fontSize: \`\${baseSize * 1.125}px\` },
  };
};`;
  
  if(regex.test(c)) {
    c = c.replace(regex, newFontDef);
  } else {
    console.error("Failed to find Menu font regex");
  }

  // Replace invocation
  c = c.replace(/const fs = getFontSizeClasses\(restaurant\.font_size\);/g, `const fs = getDynamicFontStyles(restaurant.font_size);`);

  // Replace category title
  const catRegex = /className=\{`text-2xl font-black tracking-widest \$\{fs\.cat\}`\}/g;
  c = c.replace(catRegex, `className="font-black tracking-widest"`);
  c = c.replace(`style={{ backgroundColor: themeColor, borderColor: themeColor }}`, `style={{ backgroundColor: themeColor, borderColor: themeColor, ...fs.cat }}`);

  // Replace product title (list)
  c = c.replace(
    /className=\{`font-bold uppercase leading-tight mb-2 break-words \$\{fs\.product\}`\}\s*style=\{\{ color: themeColor \}\}/g,
    `className="font-bold uppercase leading-tight mb-1 line-clamp-2" style={{ color: themeColor, ...fs.product }}`
  );
  // Replace product title (list - original)
  c = c.replace(
    /className=\{`font-bold uppercase leading-none mb-2 \$\{fs\.product\}`\}\s*style=\{\{ color: themeColor \}\}/g,
    `className="font-bold uppercase leading-tight mb-1 line-clamp-2" style={{ color: themeColor, ...fs.product }}`
  );

  // Replace desc
  c = c.replace(
    /className=\{`text-sm opacity-70 leading-relaxed mb-3 break-words \$\{fs\.desc\}`\}/g,
    `className="opacity-70 leading-relaxed mb-3 line-clamp-2" style={fs.desc}`
  );
  c = c.replace(
    /className=\{`text-sm opacity-70 leading-relaxed mb-3 \$\{fs\.desc\}`\}/g,
    `className="opacity-70 leading-relaxed mb-3 line-clamp-2" style={fs.desc}`
  );

  // Replace price
  c = c.replace(
    /className=\{`bg-white border-2 px-3 py-1 font-bold whitespace-nowrap \$\{radiusClass\} \$\{fs\.price\}`\}\s*style=\{\{ borderColor: themeColor, color: themeColor \}\}/g,
    `className={\`bg-white border-2 px-3 py-1 font-bold whitespace-nowrap \${radiusClass}\`} style={{ borderColor: themeColor, color: themeColor, ...fs.price }}`
  );
  
  c = c.replace(
    /className="flex-1 flex flex-col justify-center"/g,
    `className="flex-1 flex flex-col justify-center min-w-0"`
  );
  c = c.replace(
    /className="flex flex-col justify-between items-end shrink-0 gap-2"/g,
    `className="flex flex-col justify-between items-end shrink-0 gap-2 ml-2"`
  );

  fs.writeFileSync(p, c);
}

function processSettings() {
  const p = 'src/components/admin/SettingsTab.tsx';
  let c = fs.readFileSync(p, 'utf8');

  // Replace font styles
  const regex = /export const getFontSizeClasses = \(size\?: string\) => \{[\s\S]*?\};/s;
  const newFontDef = `export const getDynamicFontStyles = (size?: string) => {
  const baseSize = parseInt(size || '16') || (size === 'small' ? 14 : size === 'large' ? 20 : size === 'xlarge' ? 24 : 16);
  return {
    cat: { fontSize: \`\${baseSize * 1.25}px\` },
    product: { fontSize: \`\${baseSize}px\` },
    desc: { fontSize: \`\${Math.max(10, baseSize * 0.75)}px\` },
    price: { fontSize: \`\${baseSize * 1.125}px\` },
  };
};`;
  if(regex.test(c)) {
    c = c.replace(regex, newFontDef);
  } else {
    console.error("Failed to find Settings font regex");
  }

  // Replace Slider
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
  c = c.replace(sliderRegex, newSlider);
  c = c.replace(/<label className="block font-bold mb-2">Yazı Boyutu<\/label>/g, `<label className="block font-bold mb-2">Yazı Boyutu ({parseInt(fontSize || '16') || (fontSize === 'small' ? 14 : fontSize === 'large' ? 20 : fontSize === 'xlarge' ? 24 : 16)}px)</label>`);

  c = c.replace(/getFontSizeClasses\(fontSize\)/g, 'getDynamicFontStyles(fontSize)');
  
  c = c.replace(
    /className=\{`font-bold mb-1 \$\{getDynamicFontStyles\(fontSize\)\.product\}`\}/g,
    `className="font-bold mb-1 line-clamp-2"`
  );
  c = c.replace(
    /className=\{`font-bold leading-tight break-words \$\{getDynamicFontStyles\(fontSize\)\.product\}`\}/g,
    `className="font-bold leading-tight line-clamp-2"`
  );
  
  c = c.replace(
    /className=\{`opacity-70 truncate \$\{getDynamicFontStyles\(fontSize\)\.desc\}`\}/g,
    `className="opacity-70 line-clamp-2"`
  );
  c = c.replace(
    /className=\{`opacity-70 \$\{getDynamicFontStyles\(fontSize\)\.desc\}`\}/g,
    `className="opacity-70 line-clamp-2"`
  );

  c = c.replace(
    /className=\{`font-bold flex items-center \$\{getDynamicFontStyles\(fontSize\)\.price\}`\}/g,
    `className="font-bold flex items-center"`
  );
  c = c.replace(
    /className=\{`font-bold mt-auto \$\{getDynamicFontStyles\(fontSize\)\.price\}`\}/g,
    `className="font-bold mt-auto"`
  );
  
  c = c.replace(/style=\{\{ color: getTextColorForBackground\(cardBgColor\) \}\}/g, `style={{ color: getTextColorForBackground(cardBgColor), ...getDynamicFontStyles(fontSize).product }}`);
  // Fix desc style
  c = c.replace(/className="opacity-70 line-clamp-2">/g, `className="opacity-70 line-clamp-2" style={getDynamicFontStyles(fontSize).desc}>`);
  // Fix price style
  c = c.replace(/style=\{\{ color: themeColor \}\}/g, `style={{ color: themeColor, ...getDynamicFontStyles(fontSize).price }}`);

  c = c.replace(
    /className="flex-1 mt-1 flex flex-col justify-center"/g,
    `className="flex-1 mt-1 flex flex-col justify-center min-w-0"`
  );
  
  // also replace FONT_SIZE_OPTIONS export
  const fontOpts = /export const FONT_SIZE_OPTIONS = \[[\s\S]*?\];/s;
  c = c.replace(fontOpts, '');

  fs.writeFileSync(p, c);
}

processMenu();
processSettings();
console.log('Update completed safely.');
