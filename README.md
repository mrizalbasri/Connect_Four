# 🎮 Connect Four Game

Permainan Connect Four klasik dengan tampilan modern dan fitur AI yang dibuat menggunakan HTML, CSS, dan JavaScript murni.

## ✨ Fitur

- **Dua Mode Permainan**
  - 🤖 **vs Komputer**: Bermain melawan AI dengan strategi cerdas
  - 👥 **vs Pemain**: Bermain berdua dengan teman di perangkat yang sama

- **Antarmuka Modern**
  - Desain responsif yang bekerja di desktop dan mobile
  - Animasi smooth untuk drop piece
  - Efek visual yang menarik
  - Tema gradient purple yang elegan

- **Fitur Visual**
  - ✨ Efek confetti saat menang
  - 💫 Animasi highlight untuk keping pemenang
  - 🎨 Indikator pemain yang jelas
  - 📱 Fully responsive design

- **AI yang Cerdas**
  - Prioritas menyerang (mencoba menang)
  - Pertahanan (blokir pemain dari menang)
  - Strategi membuat 3 berturut-turut
  - Preferensi kolom tengah

## 🎯 Cara Bermain

1. **Pilih Mode**: Pilih antara bermain vs Komputer atau vs Pemain
2. **Drop Keping**: Klik pada kolom untuk menjatuhkan keping Anda
3. **Menang**: Sambungkan 4 keping dengan warna yang sama secara horizontal, vertikal, atau diagonal
4. **Main Lagi**: Gunakan tombol "Main Lagi" atau kembali ke menu untuk mengubah mode

## 🚀 Instalasi & Penggunaan

### Cara 1: Langsung Buka File
1. Download file `connect_four.html`
2. Buka file dengan browser favorit Anda (Chrome, Firefox, Safari, Edge)
3. Mulai bermain!

### Cara 2: Menggunakan Live Server (Rekomendasi untuk Development)
```bash
# Jika menggunakan VS Code dengan Live Server extension
1. Buka folder project di VS Code
2. Klik kanan pada connect_four.html
3. Pilih "Open with Live Server"
```


## 🎮 Kontrol

- **Klik Kolom**: Menjatuhkan keping di kolom yang dipilih
- **Tombol Main Lagi**: Memulai permainan baru dengan mode yang sama
- **Tombol Menu**: Kembali ke menu pemilihan mode
- **Hover Kolom**: Menampilkan preview di kolom yang akan dipilih

## 🤖 Strategi AI

AI menggunakan strategi berlapis:

1. **Prioritas Tertinggi**: Menang jika memungkinkan
2. **Prioritas Kedua**: Blokir lawan dari menang
3. **Prioritas Ketiga**: Membuat 3 berturut-turut
4. **Prioritas Keempat**: Blokir lawan dari membuat 3 berturut-turut
5. **Default**: Preferensi kolom tengah untuk kontrol board

## 📱 Responsiveness

Game ini sepenuhnya responsif dan akan menyesuaikan:
- **Desktop**: Ukuran penuh dengan cell 60x60px
- **Mobile**: Ukuran yang disesuaikan dengan cell 45x45px
- **Tablet**: Otomatis menyesuaikan dengan ukuran layar

## 🎨 Kustomisasi

Anda dapat dengan mudah mengkustomisasi:

### Mengubah Warna
```css
/* Di bagian style, cari dan ubah: */
.piece.red {
    background: radial-gradient(circle at 30% 30%, #ff6b6b, #c92a2a);
}

.piece.yellow {
    background: radial-gradient(circle at 30% 30%, #ffd93d, #f59f00);
}
```

### Mengubah Ukuran Board
```javascript
// Di bagian script, ubah konstanta:
const ROWS = 6;  // Ubah jumlah baris
const COLS = 7;  // Ubah jumlah kolom
```

### Mengubah Ukuran Cell
```css
.cell {
    width: 60px;   /* Ubah lebar */
    height: 60px;  /* Ubah tinggi */
}
```

## 🔧 Teknologi yang Digunakan

- **HTML5**: Struktur game
- **CSS3**: Styling, animasi, dan responsive design
- **JavaScript (Vanilla)**: Logic game dan AI
- **Canvas API**: Efek confetti

## 📋 Persyaratan

- Browser modern (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript harus diaktifkan
- Tidak memerlukan library atau framework eksternal

## 🐛 Troubleshooting

**Game tidak merespon klik**
- Pastikan JavaScript diaktifkan di browser
- Coba refresh halaman
- Periksa console browser untuk error

**Animasi terlihat patah-patah**
- Tutup tab atau aplikasi lain untuk menghemat resource
- Gunakan browser terbaru
- Pastikan hardware acceleration diaktifkan

**Layout tidak responsive**
- Clear cache browser
- Pastikan viewport meta tag ada di HTML
- Coba zoom browser ke 100%

## 📄 Lisensi

Project ini bersifat open source dan bebas digunakan untuk keperluan pribadi dan edukasi.

## 🤝 Kontribusi

Saran dan perbaikan sangat diterima! Beberapa ide untuk pengembangan:
- Tingkat kesulitan AI (Easy, Medium, Hard)
- Leaderboard dengan local storage
- Sound effects
- Tema warna yang dapat diubah
- Multiplayer online
- Undo move
- Replay sistem



**Selamat Bermain! 🎉**

*Dibuat dengan menggunakan vanilla HTML, CSS, dan JavaScript*
