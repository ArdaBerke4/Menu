# Günlük İstatistikler Özelliği (Daily Statistics)

"Masa ve Sipariş Yönetimi" sayfasına, günlük satış performansını ve ürün analizlerini gösteren yeni bir "Günlük İstatistikler" ekranı eklenecektir.

## ⚠️ User Review Required

Lütfen aşağıdaki planı inceleyip onaylayın (Proceed butonuna basarak onaylayabilirsiniz). 

## ❓ Open Questions

- "Hangi ürün hangi ürünle en çok satılıyor" hesaplamasında sadece **Ödenmiş (paid)** siparişleri mi baz alalım, yoksa şu an aktif olan (masalarda bekleyen) siparişleri de dahil edelim mi? Planda sadece "Ödenmiş" olanları, yani tamamlanmış siparişleri baz aldım. Uygun mudur?

## 📝 Proposed Changes

### 1. `ManagementDashboard.tsx`
- Üst kısımdaki butonların arasına (Öncelikli Siparişler / Masa Ekle) yeni bir **"Günlük İstatistikler 📊"** butonu eklenecek.
- Bu butona tıklandığında `DailyStatisticsModal` bileşeni açılacak.

### 2. `DailyStatisticsModal.tsx` (YENİ)
- Bu modal açıldığında o güne ait **sadece 'paid' (ödenmiş/tamamlanmış)** siparişleri ve içeriklerini (`order_items`) veritabanından çekecek.
- Hesaplamalar (Frontend üzerinde yapılacak):
  1. **Günlük Toplam Ciro:** O günkü tüm ödenmiş siparişlerin toplam tutarı.
  2. **Ürün Satış Sıralaması:** Hangi üründen toplam kaç adet satıldığı ve ne kadar ciro getirdiği listelenecek (Çok satandan aza doğru).
  3. **Birlikte En Çok Satılanlar:** Aynı sipariş fişi içerisinde birlikte alınan ürün kombinasyonları bulunup sayılarak en çok birlikte tercih edilen ikililer (örn: Çay + Cheesecake) listelenecek.
- Modern ve kurumsal temaya uygun, şık tablolar/kartlar şeklinde bir tasarım yapılacak.

## ✅ Verification Plan

- Butonun arayüze düzgün yerleşip yerleşmediği kontrol edilecek.
- Veritabanında test siparişleri oluşturulup ödenmiş duruma getirilecek.
- İstatistiklerin, toplam paranın ve "birlikte en çok satılanlar" algoritmasının doğru çalışıp çalışmadığı manuel olarak test edilecek.
