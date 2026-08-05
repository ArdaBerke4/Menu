# Gelişmiş İstatistikler Paneli Özeti

Masa ve Sipariş Yönetimi sayfasına detaylı bir **İstatistikler** modülü başarıyla entegre edildi. Özelliğin detayları aşağıdadır:

## Yapılan Değişiklikler

### 1. Zaman Filtreleri (Günlük, Haftalık, Aylık)
- Ekranın üst kısmında zaman aralığını seçebileceğiniz sekmeler oluşturuldu.
- **Günlük:** Gece 00:00'dan itibaren o anki saate kadar olan satışları kapsar.
- **Haftalık:** Son 7 günü kapsar.
- **Aylık:** Son 30 günü kapsar.

### 2. Özet Metrikler
- Seçilen zaman dilimi içerisindeki **Toplam Ciro (₺)** ve **Tamamlanan Sipariş Sayısı** net bir şekilde üstte gösterilmektedir.
- Hesaplamalar yalnızca hesabı kapatılıp başarıyla **Ödenmiş (paid)** olan siparişler üzerinden yapılmaktadır.

### 3. Ürün Satış Sıralaması
- Seçilen zaman aralığında hangi üründen kaç adet satıldığını ve bu ürünlerin ne kadar ciro getirdiğini gösteren bir sıralama tablosu eklendi.
- Tablo, en çok satan üründen en az satana doğru otomatik olarak sıralanır. Satış fiyatına varsa ürün ekstraları (örn: süt seçimi) da dahil edilir.

### 4. Birlikte En Çok Satılanlar (Kombinasyon Analizi)
- Siparişlerin içerikleri analiz edilerek, aynı sipariş fişinde hangi ürünlerin **birlikte alındığı** hesaplanmaktadır (Örn: Çay + Cheesecake).
- Bu veriler sayesinde menüdeki kampanyaları (örn: İkili menü fırsatları) çok daha stratejik bir şekilde kurgulayabilirsiniz.

## Ekran Görüntüleri

*Masa & Sipariş Yönetimi sayfasına girdiğinizde sağ üst taraftaki "📊 İstatistikler" butonuna tıklayarak bu detaylı panele ulaşabilirsiniz.*
