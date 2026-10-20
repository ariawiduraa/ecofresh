# EcoFresh Bali - Sustainable Beauty E-Commerce & Sales Dashboard

> **Tagline:** *"From Waste to Worth, Wear the Freshness"*  
> **Brand Concept:** Solid perfume berbahan dasar upcycling limbah bunga kamboja gugur dan kulit jeruk Bali dengan inovasi **swivel stick gantungan tas (bag charm)**, 100% bebas alkohol, serta sistem isi ulang (refillable).

---

## 🌿 1. Aset Resmi yang Diintegrasikan
- **Foto Produk Utama (`assets/produk.jpeg`):**
  - Desain swivel stick hijau tua elegan berpadu aksen *brushed gold*.
  - Inovasi ring & kait gantungan tas (*bag charm solid perfume*).
  - Lubang ergonomis di frame bawah untuk kemudahan penggantian *refill pod*.
  - Bunga kamboja putih dan kulit jeruk spiral segar asli Bali.
- **Maskot Resmi (`assets/maskot.jpeg`):**
  - Karakter gadis tropis Bali berbusana kelopak bunga kamboja & kulit jeruk.
  - Berfungsi sebagai duta wewangian alami (*aroma ambassador*) dan pemandu edukasi sirkular di halaman utama.

---

## 🎨 2. Desain & Pedoman UI/UX Pro Max
Mengadopsi standar **UI UX Pro Max (Organic Biophilic + Swiss Modernism)**:
1. **Palet Warna:**
   - **Forest Green (`#1E3F2D`):** Warna utama alam Bali & jangkar identitas merek.
   - **Leaf Green (`#466B40`):** Aksen botanikal & indikator positif.
   - **Citrus Orange (`#E28A25`):** Aksen hangat kulit jeruk Kintamani & tombol CTA.
   - **Warm Cream (`#F8F4EC`):** Latar belakang organik yang menenangkan mata.
   - **Warm Sand / Beige (`#EBE0D0`):** Garis batas dan kartu netral.
   - **Deep Slate (`#1A201A`):** Teks kontras tinggi dengan rasio > 8.5:1 (memenuhi standar aksesibilitas AAA).
2. **Tipografi Elegan:**
   - Heading: `Playfair Display` (serif editorial mewah khas *luxury eco-beauty*).
   - Antarmuka & Angka: `Plus Jakarta Sans` (sans-serif modern, bersih, dan mudah dibaca).
3. **Standar Bebas Emoji:**
   - Seluruh ikon antarmuka menggunakan sistem **inline SVG (Lucide/Heroicons standard)**.
4. **Interaktivitas & Micro-interactions:**
   - Hover lifts berdurasi 200ms (`transition-all duration-200`).
   - Simulasi kalkulator dampak sirkular (*interactive refill impact calculator*).
   - Accordion FAQ interaktif.
   - Modal pop-up dengan *backdrop blur*.
   - Toast notification mengambang (*feedback response*).

---

## 🧭 3. Struktur Halaman & Fitur Lengkap

### Halaman Publik
- `#/` **(Beranda / Landing Page):**
  - Hero Section dengan foto produk asli dan sapaan maskot EcoFresh.
  - 4 Kartu Nilai Unggulan (Gantungan Tas, Bebas Alkohol, Sistem Refill, Upcycling Lokal).
  - 3 Tahap Alur Sirkular (Pemilahan Etis Petani, Ekstraksi Nabati, Swivel Stick & Refill).
  - Showcase Koleksi Produk dengan harga acuan & status ketersediaan.
  - Kalkulator Interaktif Pengurangan Sampah (Simulasi pemakaian refill per tahun).
  - FAQ Komprehensif (termasuk status transparan uji lab dan pendaftaran BPOM).
  - Direct Action CTA ke Shopee & WhatsApp.
- `#/produk` **(Katalog Produk):**
  - Filter kategori instan (Semua, Solid Perfume Stick, Isi Ulang, Bundle, B2B Gift Set).
  - Pencarian produk *live* (search bar).
  - Kartu produk dengan foto resmi, status stok, tombol detail, dan tombol beli.
- `#/produk/:slug` **(Detail Produk):**
  - Galeri foto produk beresolusi tajam.
  - Rincian piramida aroma (Top, Heart, Base Notes).
  - Komposisi bahan baku nabati & cara pakai.
  - Generator otomatis pesan WhatsApp dengan format nama produk, jumlah, dan harga resmi.
  - Tautan langsung ke toko Shopee resmi.
- `#/cerita-kami` **(Cerita & Filosofi):**
  - Latar belakang masalah limbah organik di Bali.
  - Komitmen etis: Tidak mengambil sarana canang sari ritual ibadah.
- `#/keberlanjutan` **(Transparansi Dampak):**
  - Metrik realisasi kg kamboja, kg jeruk, dana payout mitra petani, dan botol dihindari.
  - Tabel komparasi: **Target Proposal 3 Tahun vs Realisasi Berjalan**.
- `#/kontak` **(Kontak Studio):**
  - Formulir pesan interaktif, alamat studio Ubud Gianyar, jam buka, dan WhatsApp.
- `#/faq` **(Pusat Informasi):**
  - Tanya jawab lengkap mengenai formula, izin edar, dan garansi wadah.

### Dashboard Admin (Terlindungi Autentikasi)
- `#/admin/login` **(Autentikasi Aman):**
  - Proteksi rute dengan sesi browser.
  - Fitur satu klik: *Gunakan Kredensial Demo*.
  - **Email Demo:** `admin@ecofresh.co.id`
  - **Kata Sandi:** `ecofresh2026`
- `#/admin/dashboard` **(Analisis Penjualan & KPI):**
  - 6 Kartu KPI: Omzet Kotor, Pendapatan Bersih (Net), Jumlah Pesanan, Unit Terjual, Rata-rata Nilai Pesanan (AOV), Estimasi Laba Kotor.
  - Filter tanggal (*Hari Ini, 7 Hari, 30 Hari, Bulan Ini, Semua*), filter kanal, filter produk.
  - 4 Grafik visual Canvas High-DPI: Tren omzet harian, donat pangsa kanal, bar unit per produk, rasio solid vs refill.
  - Tabel transaksi terbaru & ringkasan insight bisnis.
- `#/admin/pesanan` **(Pengelolaan Pesanan & Penjualan):**
  - Form pencatatan transaksi manual dengan kalkulasi otomatis fee, HPP, dan laba.
  - Fitur **Impor CSV** dengan validasi kolom, pratinjau, dan pencegah nomor pesanan duplikat.
  - Fitur **Ekspor CSV** data penjualan lengkap.
  - Modal kelola status pesanan (*Pending, Processing, Shipped, Delivered, Cancelled*) & status pembayaran (*Pending, Paid, Refunded*).
  - Otomatisasi pengembalian stok jika pesanan dibatalkan atau direfund.
- `#/admin/produk` **(Manajemen Katalog):**
  - Tambah, edit, dan arsipkan produk.
  - Pengaturan SKU, kategori, harga jual, HPP terpisah, stok fisik, dan batas minimum stok.
- `#/admin/stok` **(Buku Mutasi & Audit Stok):**
  - Riwayat keluar-masuk barang (*stok masuk, penjualan, opname fisik, barang rusak, retur*).
  - Modal penyesuaian stok opname dengan proteksi stok negatif.
- `#/admin/pelanggan` **(CRM Pelanggan):**
  - Data pembeli, frekuensi transaksi, dan total belanja (*customer lifetime value*).
- `#/admin/kanal-penjualan` **(Analisis Saluran):**
  - Evaluasi performa Shopee, WhatsApp, Instagram, Offline Bazar, dan B2B Mitra.
- `#/admin/mitra` **(Pemasok Bahan Baku):**
  - Pencatatan kelompok tani Mengwi & pengepul jeruk Kintamani.
  - Input transaksi pengadaan bahan organik (kg bahan, kode batch, pembayaran petani).
- `#/admin/dampak` **(Dashboard Keberlanjutan):**
  - Pemisahan jelas: Target Proyeksi Proposal vs Realisasi Aktual di Bali.
- `#/admin/laporan` **(Laporan Keuangan & Reset):**
  - Rumus standar akuntansi resmi (Omzet Kotor, Net, HPP, Laba Kotor).
  - Tombol reset/restore database ke data demo awal kapan saja.
- `#/admin/pengaturan` **(Pengaturan Website):**
  - Edit nama merek, tagline, bio, kontak WhatsApp, tautan Shopee, status BPOM, dan teks banner pengumuman atas. Perubahan langsung tersimpan ke halaman publik.

---

## 🚀 4. Cara Menjalankan Aplikasi

Aplikasi dibangun murni menggunakan **HTML5, CSS3, dan Vanilla JavaScript modern** tanpa kebutuhan instalasi dependensi rumit:

1. **Jalankan Web Server Lokal:**
   ```bash
   python3 -m http.server 8080
   ```
2. **Buka di Peramban Web:**
   - Halaman Publik: `http://localhost:8080/`
   - Katalog Produk: `http://localhost:8080/#/produk`
   - Login Admin: `http://localhost:8080/#/admin/login`
3. **Kredensial Admin Demo:**
   - Email: `admin@ecofresh.co.id`
   - Kata Sandi: `ecofresh2026`
   *(Atau klik tombol "Gunakan Kredensial Demo" di form login).*
