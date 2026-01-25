# 🤖 Connect Four AI Research

Project ini adalah implementasi game Connect Four yang berfokus pada riset perbandingan dua algoritma AI yang berbeda.

## 🧠 Algoritma yang Digunakan

### 1. AI Reflex (Otak Kiri)

- **Nama Algoritma**: **Greedy Best-First Strategy** (Heuristic Search)
- **Konsep**:
  - Algoritma ini "serakah" (greedy). Ia menilai setiap kolom berdasarkan keuntungan **saat ini saja** (Depth 1).
  - Ia menggunakan fungsi **Heuristik** sederhana: memberikan poin tinggi untuk langkah yang menghasilkan 3-baris atau 4-baris, tanpa mempedulikan balasan lawan di masa depan (kecuali ancaman langsung).
- **Karakter**: Cepat, Impulsif, Agresif.

### 2. AI Defend (Otak Kanan)

- **Nama Algoritma**: **Minimax Algorithm** dengan **Alpha-Beta Pruning**
- **Konsep**:
  - **Minimax**: Algoritma rekursif yang mengeksplorasi pohon kemungkinan (Game Tree). Ia berasumsi lawan akan selalu bermain optimal (Minimizing loss).
  - **Alpha-Beta Pruning**: Teknik optimasi untuk memotong (prune) cabang pohon yang tidak perlu dihitung, sehingga AI bisa berpikir lebih dalam (Depth 4) tanpa lemot.
- **Karakter**: Strategis, Defensif, Memprediksi Masa Depan.

---

## 🎮 Mode Permainan

1. **Lawan Komputer (Manusia vs AI)**
   - Anda bermain sebagai Pemain Merah.
   - Anda melawan AI Kuning.
   - Anda bisa memilih lawan: "Mode Serang" (Greedy) atau "Mode Bertahan" (Minimax).

2. **Lawan Pemain (Manusia vs Manusia)**
   - Mode klasik untuk bermain berdua di satu layar.

3. **⚔️ Tonton AI vs AI** (Simulasi)
   - Mode otomatis: **Greedy AI (Merah) vs Minimax AI (Kuning)**.
   - Cocok untuk mendemonstrasikan bagaimana algoritma strategis (Minimax) biasanya mengalahkan algoritma instingtif (Greedy).
   - Dilengkapi **Log Analisis** untuk memantau `Score` dan `Thinking Time`.

## 📂 Struktur File

```text
/project
├── connect_four.html    # UI & Tampilan
├── /js
│   ├── game.js          # Game Loop Controller
│   ├── ai_reflex.js     # Implementasi Greedy Algorithm
│   └── ai_defend.js     # Implementasi Minimax Algorithm
└── README.md            # Dokumentasi Riset
```

## 🛠️ Cara Menjalankan

Cukup buka file `connect_four.html` di browser modern apa saja. Tidak perlu instalasi khusus.
