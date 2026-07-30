export function slugify(text: string): string {
  const trMap: Record<string, string> = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'i': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'I': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  };

  return text
    .replace(/[çğıiöşüÇĞİIÖŞÜ]/g, (match) => trMap[match]) // Türkçe karakterleri değiştir
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Alfanümerik, boşluk ve tire harici karakterleri sil
    .trim()
    .replace(/\s+/g, '-') // Boşlukları tireye çevir
    .replace(/-+/g, '-'); // Birden fazla tireyi tek tire yap
}
