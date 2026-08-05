-- =============================================
-- ÜRÜN SEÇENEKLERİ (EKSTRALAR) SÜTUNLARINI EKLEME
-- =============================================

ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;

ALTER TABLE order_items 
  ADD COLUMN IF NOT EXISTS selected_options JSONB DEFAULT '[]'::jsonb;
