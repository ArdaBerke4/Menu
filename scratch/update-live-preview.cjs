const fs = require('fs');

const path = 'src/components/admin/SettingsTab.tsx';
let content = fs.readFileSync(path, 'utf8');

const listReplacement = `                      <div className={\`w-full p-3 border-2 shadow-sm flex gap-3\`} style={{ borderColor: themeColor, backgroundColor: cardBgColor, borderRadius: buttonShape === 'pill' ? '12px' : buttonShape === 'rounded' ? '8px' : '0' }}>
                        <div className="w-16 h-16 bg-black/10 shrink-0 flex items-center justify-center overflow-hidden" style={{ borderRadius: buttonShape === 'pill' ? '99px' : buttonShape === 'rounded' ? '4px' : '0' }}>
                          <span className="text-xl">☕</span>
                        </div>
                        <div className="flex-1 mt-1 flex flex-col justify-center" style={{ color: getTextColorForBackground(cardBgColor) }}>
                          <div className={\`font-bold \${getFontSizeClasses(fontSize).product}\`}>Filtre Kahve</div>
                          <div className={\`opacity-70 \${getFontSizeClasses(fontSize).desc}\`}>Taze demlenmiş yöresel filtre kahve</div>
                        </div>
                        <div className={\`font-bold flex items-center \${getFontSizeClasses(fontSize).price}\`} style={{ color: themeColor }}>
                          95 ₺
                        </div>
                      </div>
                      <div className={\`w-full p-3 border-2 shadow-sm flex gap-3\`} style={{ borderColor: themeColor, backgroundColor: cardBgColor, borderRadius: buttonShape === 'pill' ? '12px' : buttonShape === 'rounded' ? '8px' : '0' }}>
                        <div className="w-16 h-16 bg-black/10 shrink-0 flex items-center justify-center overflow-hidden" style={{ borderRadius: buttonShape === 'pill' ? '99px' : buttonShape === 'rounded' ? '4px' : '0' }}>
                          <span className="text-xl">🍰</span>
                        </div>
                        <div className="flex-1 mt-1 flex flex-col justify-center" style={{ color: getTextColorForBackground(cardBgColor) }}>
                          <div className={\`font-bold \${getFontSizeClasses(fontSize).product}\`}>Cheesecake</div>
                          <div className={\`opacity-70 \${getFontSizeClasses(fontSize).desc}\`}>Orman meyveli</div>
                        </div>
                        <div className={\`font-bold flex items-center \${getFontSizeClasses(fontSize).price}\`} style={{ color: themeColor }}>
                          140 ₺
                        </div>
                      </div>`;

const gridReplacement = `                    <div className="grid grid-cols-2 gap-3">
                      <div className={\`p-3 border-2 shadow-sm flex flex-col\`} style={{ borderColor: themeColor, backgroundColor: cardBgColor, borderRadius: buttonShape === 'pill' ? '12px' : buttonShape === 'rounded' ? '8px' : '0' }}>
                        <div className="w-full h-24 bg-black/10 mb-3 flex items-center justify-center overflow-hidden" style={{ borderRadius: buttonShape === 'pill' ? '8px' : buttonShape === 'rounded' ? '4px' : '0' }}>
                          <span className="text-3xl">🍔</span>
                        </div>
                        <div className={\`font-bold mb-1 \${getFontSizeClasses(fontSize).product}\`} style={{ color: getTextColorForBackground(cardBgColor) }}>Burger</div>
                        <div className={\`font-bold mt-auto \${getFontSizeClasses(fontSize).price}\`} style={{ color: themeColor }}>210 ₺</div>
                      </div>
                      <div className={\`p-3 border-2 shadow-sm flex flex-col\`} style={{ borderColor: themeColor, backgroundColor: cardBgColor, borderRadius: buttonShape === 'pill' ? '12px' : buttonShape === 'rounded' ? '8px' : '0' }}>
                        <div className="w-full h-24 bg-black/10 mb-3 flex items-center justify-center overflow-hidden" style={{ borderRadius: buttonShape === 'pill' ? '8px' : buttonShape === 'rounded' ? '4px' : '0' }}>
                          <span className="text-3xl">🍹</span>
                        </div>
                        <div className={\`font-bold mb-1 \${getFontSizeClasses(fontSize).product}\`} style={{ color: getTextColorForBackground(cardBgColor) }}>Limonata</div>
                        <div className={\`font-bold mt-auto \${getFontSizeClasses(fontSize).price}\`} style={{ color: themeColor }}>85 ₺</div>
                      </div>
                    </div>`;

// Replace list layout
const listRegex = /<>\s*<div className={`w-full p-2 border-2 shadow-sm flex gap-2`}.*?<\/div>\s*<\/div>\s*<\/>/s;
content = content.replace(listRegex, `<>\n${listReplacement}\n                    </>`);

// Replace grid layout
const gridRegex = /<div className="grid grid-cols-2 gap-2">.*?<\/div>\s*<\/div>/s;
content = content.replace(gridRegex, gridReplacement);

fs.writeFileSync(path, content);
console.log('Live preview updated to show real text and font sizes.');
