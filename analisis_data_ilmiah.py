import json
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

# 1. BACA DATA
# Pastikan file 'connect_four_logs.json' ada di folder yang sama
# File ini didapat dari hasil main "AI vs AI" dan klik tombol "Download JSON"
try:
    with open('connect_four_logs.json', 'r', encoding='utf-8') as f:
        content = f.read()
        if not content.strip():
            print("Error: File 'connect_four_logs.json' KOSONG (0 bytes).")
            print("Pastikan Anda sudah bermain dan klik tombol 'Download JSON'.")
            exit()
        data = json.loads(content)
except FileNotFoundError:
    print("Error: File 'connect_four_logs.json' tidak ditemukan.")
    print("Pastikan file hasil download berada dalam satu folder dengan script ini.")
    exit()
except json.JSONDecodeError as e:
    print(f"Error: Format JSON tidak valid. ({e})")
    print("Isi file (50 karakter awal):", content[:50])
    exit()

# Konversi ke Pandas DataFrame untuk analisis mudah
df = pd.DataFrame(data)

# Filter hanya data yang valid (kadangkala ada data kosong)
if df.empty:
    print("Data kosong!")
    exit()

print(f"Total Data Terkumpul: {len(df)} langkah")

# --- VISUALISASI 1: PERBANDINGAN KECEPATAN BERPIKIR (TIME COMPLEXITY) ---
# Membandingkan 'thinking_time_ms' antara 'reflex' dan 'defend' (atau 'attack'/'defend')
# Dalam karya ilmiah, ini membuktikan efisiensi algoritma.

plt.figure(figsize=(10, 6))
sns.boxplot(x='mode', y='thinking_time_ms', data=df, palette="Set2")
plt.title('Perbandingan Waktu Berpikir (Time Complexity)')
plt.ylabel('Waktu Eksekusi (ms)')
plt.xlabel('Algoritma AI')
# Simpan grafik
plt.savefig('grafik_kecepatan.png')
print("Grafik 1 disimpan: grafik_kecepatan.png")

# --- VISUALISASI 2: WIN RATE (TINGKAT KEMENANGAN) ---
# Kita perlu menghitung jumlah kemenangan per game unik.
# Kita ambil data terakhir dari setiap game_id untuk melihat siapa pemenangnya.
game_results = df.groupby('game_id').last()['game_result']
win_counts = game_results.value_counts()

plt.figure(figsize=(8, 8))
plt.pie(win_counts, labels=win_counts.index, autopct='%1.1f%%', colors=['#ff7b7b', '#ffe066', '#cccccc'])
plt.title('Persentase Kemenangan')
plt.savefig('grafik_win_rate.png')
print("Grafik 2 disimpan: grafik_win_rate.png")

# --- VISUALISASI 3: PERSEBARAN SKOR KEPUTUSAN ---
# Melihat bagaimana AI menilai papan. AI Reflex (Greedy) biasanya punya skor ekstrem/bervariasi.
# AI Minimax biasanya skornya lebih stabil di angka tertentu.

plt.figure(figsize=(12, 6))
sns.histplot(data=df, x='score', hue='mode', kde=True, element="step")
plt.title('Distribusi Skor Evaluasi (Heuristik vs Minimax)')
plt.xlabel('Nilai Skor Board')
plt.savefig('grafik_distribusi_skor.png')
print("Grafik 3 disimpan: grafik_distribusi_skor.png")

print("\n--- ANALISIS SELESAI ---")
print("Gunakan gambar-gambar PNG yang dihasilkan untuk makalah/karya ilmiah Anda.")
