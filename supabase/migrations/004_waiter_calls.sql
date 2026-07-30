-- =============================================
-- GARSON ÇAĞIRMA ÖZELLİĞİ (NEEDS WAITER)
-- Supabase SQL Editor'da çalıştırın
-- =============================================

-- tables tablosuna needs_waiter sütunu ekle
ALTER TABLE tables ADD COLUMN IF NOT EXISTS needs_waiter BOOLEAN DEFAULT false;
