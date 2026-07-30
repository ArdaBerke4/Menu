-- =============================================
-- RESTORAN URL (SLUG) VE BENZERSİZ İSİM GÜNCELLEMESİ
-- Supabase SQL Editor'da çalıştırın
-- =============================================

-- 1. Slug sütununu ekle (eğer yoksa)
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Mevcut restoranlara geçici olarak benzersiz bir slug ver
-- Mevcut isimlerde aynı olanlar hata vermesin diye sonuna ID'nin ilk 4 hanesini ekliyoruz
UPDATE restaurants 
SET slug = LOWER(REGEXP_REPLACE(name, '\s+', '-', 'g')) || '-' || SUBSTRING(id::text FROM 1 FOR 4)
WHERE slug IS NULL;

-- 3. Slug sütununa UNIQUE (benzersiz) kısıtlaması ekle
-- Eğer bu satır hata verirse, veritabanınızda aynı slug'a sahip restoranlar kalmış demektir.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'restaurants_slug_key'
  ) THEN
    ALTER TABLE restaurants ADD CONSTRAINT restaurants_slug_key UNIQUE (slug);
  END IF;
END $$;
