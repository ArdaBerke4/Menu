-- =============================================
-- QR KOD ÖZELLEŞTİRME AYARLARI EKLENTİSİ
-- Supabase SQL Editor'da çalıştırın
-- =============================================

ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS qr_dot_color TEXT DEFAULT '#8B5A2B',
ADD COLUMN IF NOT EXISTS qr_bg_color TEXT DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS qr_dot_style TEXT DEFAULT 'rounded',
ADD COLUMN IF NOT EXISTS qr_corner_style TEXT DEFAULT 'square',
ADD COLUMN IF NOT EXISTS qr_use_logo BOOLEAN DEFAULT false;
