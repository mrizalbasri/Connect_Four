import json
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

# 1. BACA DATA

try:
    with open('connect_four_logs1.json', 'r', encoding='utf-8') as f:
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

# Isi NaN first_player dengan 'red' (untuk data lama)
if 'first_player' not in df.columns:
    df['first_player'] = 'red'
else:
    df['first_player'] = df['first_player'].fillna('red')

# Isi NaN first_player_mode dengan 'random' (untuk data lama)
if 'first_player_mode' not in df.columns:
    df['first_player_mode'] = 'random'
else:
    df['first_player_mode'] = df['first_player_mode'].fillna('random')

# --- VISUALISASI 1: PERBANDINGAN KOMPLEKSITAS (NODES EXPLORED) ---
plt.figure(figsize=(10, 6))
sns.barplot(x='mode', y='nodes_explored', data=df, hue='mode', palette="viridis", errorbar=None, legend=False)
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
sns.boxplot(x='mode', y='thinking_time_ms', data=df, hue='mode', palette="Set2", legend=False)
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

# --- ANALISIS TAMBAHAN: FIRST-MOVE ADVANTAGE ---
print("\n=== ANALISIS FIRST-MOVE ADVANTAGE ===")

# Ambil data per game (hanya baris terakhir setiap game)
game_summary = df.groupby('game_id').last()

if 'first_player' in game_summary.columns and 'game_result' in game_summary.columns:
    # Tampilkan mode yang digunakan
    if 'first_player_mode' in game_summary.columns:
        mode_used = game_summary['first_player_mode'].mode()[0] if len(game_summary['first_player_mode'].mode()) > 0 else 'unknown'
        print(f"\n🎯 Mode First Player: {mode_used.upper()}")
    
    # Hitung win rate berdasarkan siapa yang jalan duluan
    first_move_stats = game_summary.groupby('first_player')['game_result'].value_counts().unstack(fill_value=0)
    
    print("\n📊 Win Rate Berdasarkan First Player:")
    print(first_move_stats)
    
    # Hitung persentase
    for player in first_move_stats.index:
        total = first_move_stats.loc[player].sum()
        if player in first_move_stats.columns:
            wins = first_move_stats.loc[player, player]
            win_rate = (wins / total * 100) if total > 0 else 0
            ai_name = "REFLEX" if player == "red" else "MINIMAX"
            print(f"\n{ai_name} ({player.upper()}) jalan duluan:")
            print(f"  - Menang: {wins}/{total} ({win_rate:.1f}%)")
            
            # Hitung lawan menang
            opponent = 'yellow' if player == 'red' else 'red'
            if opponent in first_move_stats.columns:
                opp_wins = first_move_stats.loc[player, opponent]
                opp_rate = (opp_wins / total * 100) if total > 0 else 0
                opp_name = "MINIMAX" if opponent == "yellow" else "REFLEX"
                print(f"  - {opp_name} menang: {opp_wins}/{total} ({opp_rate:.1f}%)")
    
    # Visualisasi First-Move Advantage
    plt.figure(figsize=(10, 6))
    first_move_stats.plot(kind='bar', stacked=False, color=['#ff7b7b', '#ffe066', '#cccccc'])
    plt.title('First-Move Advantage Analysis')
    plt.xlabel('Pemain yang Jalan Duluan')
    plt.ylabel('Jumlah Game')
    plt.legend(title='Pemenang', labels=['Red Wins', 'Yellow Wins', 'Draw'])
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig('grafik_first_move_advantage.png')
    print("\nGrafik 5 disimpan: grafik_first_move_advantage.png")
else:
    print("\n⚠️ Data 'first_player' tidak tersedia. Jalankan game dengan versi terbaru untuk analisis ini.")

