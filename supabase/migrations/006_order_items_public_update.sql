-- =============================================
-- SİPARİŞ KALEMLERİ İÇİN PUBLIC UPDATE POLİTİKASI
-- Garsonların giriş yapmadan (POS ekranından) siparişleri
-- teslim edildi olarak işaretleyebilmesi için
-- =============================================

CREATE POLICY "order_items_public_update" ON order_items FOR UPDATE
  USING (true)
  WITH CHECK (true);
