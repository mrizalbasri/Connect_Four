import json
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

# 1. BACA DATA

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

# Isi NaN nodes_explored dengan 0 (untuk data lama yang belum ada fiturnya)
if 'nodes_explored' not in df.columns:
    df['nodes_explored'] = 0
else:
    df['nodes_explored'] = df['nodes_explored'].fillna(0)

# --- VISUALISASI 1: PERBANDINGAN KOMPLEKSITAS (NODES EXPLORED) ---
plt.figure(figsize=(10, 6))
sns.barplot(x='mode', y='nodes_explored', data=df, palette="viridis", errorbar=None)
plt.title('Rata-rata Node yang Dieksplorasi (Logika Berpikir)')
plt.ylabel('Jumlah Node (Unit)')
plt.xlabel('Algoritma AI')
# Tambahkan label angka di atas batang
ax = plt.gca()
for p in ax.patches:
    if p.get_height() > 0:
        ax.annotate(f'{int(p.get_height())}', (p.get_x() + p.get_width() / 2., p.get_height()),
                    ha='center', va='center', xytext=(0, 10), textcoords='offset points')
plt.savefig('grafik_kompleksitas_node.png')
print("Grafik 1 disimpan: grafik_kompleksitas_node.png (Nodes Explored)")

# --- VISUALISASI 2: WAKTU BERPIKIR (TIME COMPLEXITY) ---
plt.figure(figsize=(10, 6))
sns.boxplot(x='mode', y='thinking_time_ms', data=df, palette="Set2")
plt.title('Perbandingan Waktu Berpikir (Time Complexity)')
plt.ylabel('Waktu Eksekusi (ms)')
plt.savefig('grafik_waktu.png')
print("Grafik 2 disimpan: grafik_waktu.png")

# --- VISUALISASI 3: WIN RATE (TINGKAT KEMENANGAN) ---
game_results = df.groupby('game_id').last()['game_result']
win_counts = game_results.value_counts()

plt.figure(figsize=(8, 8))
plt.pie(win_counts, labels=win_counts.index, autopct='%1.1f%%', colors=['#ff7b7b', '#ffe066', '#cccccc'])
plt.title('Persentase Kemenangan')
plt.savefig('grafik_win_rate.png')
print("Grafik 3 disimpan: grafik_win_rate.png")

# --- VISUALISASI 4: DISTRIBUSI SKOR ---
plt.figure(figsize=(12, 6))
sns.histplot(data=df, x='score', hue='mode', kde=True, element="step")
plt.title('Distribusi Skor Evaluasi')
plt.xlabel('Nilai Skor Board')
plt.savefig('grafik_distribusi_skor.png')
print("Grafik 4 disimpan: grafik_distribusi_skor.png")

print("\n--- ANALISIS SELESAI ---")
print("Gunakan gambar-gambar PNG yang dihasilkan untuk makalah/karya ilmiah Anda.")
