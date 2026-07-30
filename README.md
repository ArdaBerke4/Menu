# QR Menü ve POS Sistemi

Bu proje; QR kod tabanlı, gerçek zamanlı sipariş ve masa yönetimi yapılabilen bir restoran POS sistemidir. React, Vite ve Supabase kullanılarak geliştirilmiştir.

## 🚀 Projeyi Bilgisayarınızda Çalıştırma Adımları

Eğer projeyi Github'dan indirdiyseniz (veya clone'ladıysanız), çalıştırmak için aşağıdaki adımları sırasıyla uygulamanız gerekmektedir.

### 1. Gereksinimler
Bilgisayarınızda **Node.js**'in (tercihen v18 veya üstü) yüklü olması gerekmektedir. Yüklü değilse [nodejs.org](https://nodejs.org) adresinden indirip kurabilirsiniz.

### 2. Proje Dosyalarının Kurulumu
Projeyi indirdiğiniz klasörü terminalde (veya Komut İstemcisi/VS Code terminalinde) açın ve gerekli kütüphaneleri indirmek için şu komutu çalıştırın:
```bash
npm install
```

### 3. Çevre Değişkenleri (.env) - ÇOK ÖNEMLİ!
Güvenlik sebebiyle veritabanı şifreleri ve linkleri Github'a yüklenmez. Bu yüzden projeyi çalıştırdığınızda veritabanına (Supabase) bağlanamazsınız. Bağlanabilmek için:

1. Proje ana klasöründe `.env` adında yeni bir dosya oluşturun. (Veya var olan `.env.example` dosyasının adını `.env` olarak değiştirin).
2. İçerisine Supabase URL'nizi ve Anon Key'inizi şu formatta yapıştırın:
```env
VITE_SUPABASE_URL=buraya_kendi_url_adresiniz_gelecek
VITE_SUPABASE_ANON_KEY=buraya_kendi_anon_key_adresiniz_gelecek
```
*(Eğer bu şifrelere sahip değilseniz, lütfen proje geliştiricisinden `.env` dosyasını size doğrudan göndermesini isteyin.)*

### 4. Projeyi Başlatma
Kütüphaneler yüklendikten ve `.env` dosyası eklendikten sonra projeyi ayağa kaldırmak için şu komutu çalıştırın:
```bash
npm run dev
```

Terminalde size **`http://localhost:5173`** gibi bir link verecektir. O linke tıklayarak veya tarayıcınıza yapıştırarak sisteme giriş yapabilirsiniz!

---

## 🛠 Kullanılan Teknolojiler
- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend / Veritabanı:** Supabase (PostgreSQL, Auth, Realtime)
- **Ekstralar:** `qr-code-styling` (Gelişmiş QR Kod tasarımı için), `@hello-pangea/dnd` (Kategori sürükle-bırak işlemleri için)
