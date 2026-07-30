-- =============================================
-- MASALAR İÇİN PUBLIC UPDATE POLİTİKASI
-- Müşterilerin garson çağırabilmesi için
-- =============================================

-- Müşteriler tables tablosunu güncelleyebilmeli (özellikle needs_waiter için)
CREATE POLICY "tables_public_update" ON tables FOR UPDATE
  USING (true)
  WITH CHECK (true);
