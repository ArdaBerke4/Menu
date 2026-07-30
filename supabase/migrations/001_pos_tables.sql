-- =============================================
-- MASA VE SİPARİŞ YÖNETİMİ (POS) TABLOLARI
-- Supabase SQL Editor'da çalıştırın
-- =============================================

-- 1. MASALAR TABLOSU
CREATE TABLE IF NOT EXISTS tables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  table_number INT NOT NULL,
  label TEXT,
  capacity INT DEFAULT 4,
  status TEXT DEFAULT 'empty' CHECK (status IN ('empty', 'occupied', 'reserved')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(restaurant_id, table_number)
);

-- 2. SİPARİŞLER TABLOSU
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled', 'paid')),
  total_amount DECIMAL(10,2) DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. SİPARİŞ KALEMLERİ TABLOSU
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INT DEFAULT 1 NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. RLS AKTİF ET
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLİTİKALARI

-- tables: restoran sahibi her işlemi yapabilir
CREATE POLICY "tables_owner_all" ON tables FOR ALL
  USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));

-- tables: herkes okuyabilir (müşteri QR ile masa bilgisine erişmeli)
CREATE POLICY "tables_public_read" ON tables FOR SELECT
  USING (true);

-- orders: restoran sahibi her işlemi yapabilir
CREATE POLICY "orders_owner_all" ON orders FOR ALL
  USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));

-- orders: herkes sipariş oluşturabilir (müşteri QR'dan sipariş verir)
CREATE POLICY "orders_public_insert" ON orders FOR INSERT
  WITH CHECK (true);

-- orders: herkes kendi masasındaki siparişi okuyabilir
CREATE POLICY "orders_public_read" ON orders FOR SELECT
  USING (true);

-- order_items: restoran sahibi her işlemi yapabilir
CREATE POLICY "order_items_owner_all" ON order_items FOR ALL
  USING (order_id IN (
    SELECT id FROM orders WHERE restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  ));

-- order_items: herkes ekleyebilir ve okuyabilir
CREATE POLICY "order_items_public_insert" ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "order_items_public_read" ON order_items FOR SELECT
  USING (true);

-- 6. REALTIME AKTİF ET (Supabase Dashboard'da da açılmalı)
ALTER PUBLICATION supabase_realtime ADD TABLE tables;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
