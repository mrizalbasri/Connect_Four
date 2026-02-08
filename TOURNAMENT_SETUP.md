# 🎮 Setup Tournament Mode

## 📋 Persiapan

### 1. Install Dependencies
```bash
pip install flask flask-cors
```

### 2. Jalankan Server
```bash
python server.py
```

**Output yang muncul:**
```
==================================================
🎮 TOURNAMENT DATA SERVER
==================================================
📁 Data akan disimpan ke: D:\Coding\project\data
🌐 Server berjalan di: http://localhost:5000
✅ Siap menerima data tournament!
==================================================
```

### 3. Buka Game
Buka file `connect_four.html` di browser

---

## 🎯 Cara Kerja Tournament

1. **Peserta pilih mode "Challenge Mode"**
2. **Main 3 round** (best of 3)
   - Round 1: vs AI Serang (Greedy)
   - Round 2-3: vs AI Bertahan (Minimax)
3. **Setelah ada yang menang 2x** → Data **OTOMATIS** tersimpan ke folder `data\`

---

## 📊 File Yang Tersimpan

Format: `data/tournament_logs_YYYYMMDD_HHMMSS.json`

**Isi data:**
- ✅ Detail setiap langkah pemain & AI
- ✅ Thinking time
- ✅ Score evaluation
- ✅ Nodes explored (kompleksitas)
- ✅ Board state setiap move
- ✅ Winner & final score
- ✅ History semua rounds

**Contoh nama file:**
```
tournament_logs_20260206_123045.json
tournament_logs_20260206_124532.json
```

---

## 🔍 Lihat Log Server

Setiap kali ada peserta selesai, server akan print:
```
✅ Data tersimpan: data/tournament_logs_20260206_123045.json
   - Total Games: 3
   - Winner: Player
   - Final Score: 2-1
```

---

## ⚠️ Troubleshooting

**Error: "Connection refused"**
- Pastikan `server.py` sudah berjalan
- Cek di terminal apakah ada error

**Data tidak masuk ke folder `data\`**
- Buka browser console (F12)
- Cek apakah ada error merah
- Pastikan server masih running

**Server error**
- Stop server (Ctrl+C)
- Jalankan ulang: `python server.py`

---

## 📁 Struktur Folder

```
project/
├── server.py              ← Server Python
├── connect_four.html      ← Game
├── js/
│   ├── game.js           ← Sudah auto-save
│   ├── ai_reflex.js
│   └── ai_defend.js
└── data/                  ← Data otomatis masuk sini
    ├── tournament_logs_20260206_123045.json
    └── tournament_logs_20260206_124532.json
```

---

## 🎓 Untuk Analisis Data

Setelah tournament selesai, jalankan:
```bash
python analisis_data_ilmiah.py
```

Script akan otomatis baca semua file JSON di folder `data\` dan generate grafik.
