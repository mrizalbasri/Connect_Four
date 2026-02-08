import json
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
import os
import glob

# 1. BACA DATA DARI FOLDER 'data/'

print("="*60)
print("📊 ANALISIS DATA TOURNAMENT CONNECT FOUR")
print("="*60)

# Cari semua file JSON di folder data
data_folder = "data"
if not os.path.exists(data_folder):
    print(f"❌ Error: Folder '{data_folder}' tidak ditemukan!")
    print("   Pastikan tournament sudah dijalankan dan data tersimpan.")
    exit()

json_files = glob.glob(os.path.join(data_folder, "tournament_logs_*.json"))

if not json_files:
    print(f"❌ Error: Tidak ada file tournament di folder '{data_folder}'")
    print("   Jalankan tournament dulu untuk generate data.")
    exit()

print(f"\n✅ Ditemukan {len(json_files)} file tournament:")
for f in json_files:
    print(f"   - {os.path.basename(f)}")

# Gabungkan semua rawLogs dari semua file
all_logs = []
tournament_info = []

for file_path in json_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
        # Ambil rawLogs (data detail setiap move)
        raw_logs = data.get('rawLogs', [])
        all_logs.extend(raw_logs)
        
        # Ambil info tournament
        challenge_result = data.get('challengeResult', {})
        tournament_info.append({
            'file': os.path.basename(file_path),
            'winner': challenge_result.get('winner', 'N/A'),
            'score': challenge_result.get('finalScore', 'N/A'),
            'export_date': data.get('exportDate', 'N/A'),
            'total_moves': len(raw_logs)
        })

print(f"\n📈 Total data terkumpul: {len(all_logs)} langkah dari {len(json_files)} tournament")

# Konversi ke DataFrame
df = pd.DataFrame(all_logs)

if df.empty:
    print("❌ Data kosong!")
    exit()

# Handle missing values
if 'nodes_explored' not in df.columns:
    df['nodes_explored'] = 0
else:
    df['nodes_explored'] = df['nodes_explored'].fillna(0)

if 'first_player' not in df.columns:
    df['first_player'] = 'red'
else:
    df['first_player'] = df['first_player'].fillna('red')

if 'first_player_mode' not in df.columns:
    df['first_player_mode'] = 'random'
else:
    df['first_player_mode'] = df['first_player_mode'].fillna('random')

print(f"\n📊 Statistik Data:")
print(f"   Total langkah: {len(df)}")
print(f"   Total game: {df['game_id'].nunique()}")
print(f"   Mode: {df['mode'].unique().tolist()}")

# Statistik per AI type
print(f"\n🤖 Statistik Per AI Type:")
ai_modes = df[df['mode'] != 'Human']
if not ai_modes.empty:
    for mode in ai_modes['mode'].unique():
        mode_data = ai_modes[ai_modes['mode'] == mode]
        avg_time = mode_data['thinking_time_ms'].mean()
        avg_nodes = mode_data['nodes_explored'].mean()
        print(f"\n   {mode}:")
        print(f"      Avg thinking time: {avg_time:.2f}ms")
        print(f"      Avg nodes explored: {avg_nodes:.0f}")
        print(f"      Total moves: {len(mode_data)}")

# --- VISUALISASI 1: PERBANDINGAN KOMPLEKSITAS (NODES EXPLORED) ---
plt.figure(figsize=(10, 6))
sns.barplot(x='mode', y='nodes_explored', data=df, hue='mode', palette="viridis", errorbar=None, legend=False)
plt.title('Rata-rata Node yang Dieksplorasi (Logika Berpikir)')
plt.ylabel('Jumlah Node (Unit)')
plt.xlabel('Algoritma AI')
ax = plt.gca()
for p in ax.patches:
    if p.get_height() > 0:
        ax.annotate(f'{int(p.get_height())}', (p.get_x() + p.get_width() / 2., p.get_height()),
                    ha='center', va='center', xytext=(0, 10), textcoords='offset points')
plt.savefig('grafik_kompleksitas_node.png')
print("\n✅ Grafik 1 disimpan: grafik_kompleksitas_node.png")

# --- VISUALISASI 2: WAKTU BERPIKIR (TIME COMPLEXITY) ---
plt.figure(figsize=(10, 6))
sns.boxplot(x='mode', y='thinking_time_ms', data=df, hue='mode', palette="Set2", legend=False)
plt.title('Perbandingan Waktu Berpikir (Time Complexity)')
plt.ylabel('Waktu Eksekusi (ms)')
plt.savefig('grafik_waktu.png')
print("✅ Grafik 2 disimpan: grafik_waktu.png")

# --- VISUALISASI 3: WIN RATE PER AI TYPE (Tournament Focus) ---
if 'game_result' in df.columns:
    # Group by game untuk ambil info AI type
    game_summary = df.groupby('game_id').agg({
        'game_result': 'last',
        'mode': lambda x: 'vs_Reflex' if 'Reflex' in x.values else ('vs_Minimax' if 'Defend' in x.values or 'Minimax' in str(x.values) else 'Unknown')
    }).reset_index()
    
    # Hitung win rate per AI type
    ai_win_stats = game_summary.groupby('mode')['game_result'].value_counts().unstack(fill_value=0)
    
    if not ai_win_stats.empty:
        plt.figure(figsize=(10, 6))
        ai_win_stats.plot(kind='bar', color=['#ff7b7b', '#ffe066', '#cccccc'])
        plt.title('Win Rate: Player vs AI Type')
        plt.xlabel('Lawan AI')
        plt.ylabel('Jumlah Game')
        plt.legend(title='Pemenang', labels=['Player (Red)', 'AI (Yellow)', 'Draw'])
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig('grafik_win_rate.png')
        print("✅ Grafik 3 disimpan: grafik_win_rate.png")
        
        # Print summary
        print("\n📊 Win Rate Summary:")
        for ai_type in ai_win_stats.index:
            total = ai_win_stats.loc[ai_type].sum()
            player_wins = ai_win_stats.loc[ai_type].get('red', 0)
            ai_wins = ai_win_stats.loc[ai_type].get('yellow', 0)
            print(f"\n{ai_type}:")
            print(f"  Player menang: {player_wins}/{total} ({player_wins/total*100:.1f}%)")
            print(f"  AI menang: {ai_wins}/{total} ({ai_wins/total*100:.1f}%)")

# --- VISUALISASI 4: DISTRIBUSI SKOR ---
# Filter hanya data AI yang punya score
df_with_score = df[df['score'].notna()]
if not df_with_score.empty:
    plt.figure(figsize=(12, 6))
    sns.histplot(data=df_with_score, x='score', hue='mode', kde=True, element="step")
    plt.title('Distribusi Skor Evaluasi')
    plt.xlabel('Nilai Skor Board')
    plt.savefig('grafik_distribusi_skor.png')
    print("✅ Grafik 4 disimpan: grafik_distribusi_skor.png")

# --- VISUALISASI 5: TOURNAMENT SUMMARY (Per Peserta) ---
plt.figure(figsize=(12, 6))
tournament_df = pd.DataFrame(tournament_info)
tournament_df['peserta'] = [f"Peserta {i+1}" for i in range(len(tournament_df))]

# Win rate per peserta (Player atau Computer yang menang)
colors = ['#10b981' if w == 'player' else '#ef4444' for w in tournament_df['winner']]
bars = plt.bar(tournament_df['peserta'], tournament_df['total_moves'], color=colors, alpha=0.7)

plt.title('Total Moves Per Peserta Tournament')
plt.xlabel('Peserta')
plt.ylabel('Total Langkah (Moves)')
plt.grid(axis='y', alpha=0.3)

# Tambahkan score di atas bar
for i, (bar, score) in enumerate(zip(bars, tournament_df['score'])):
    height = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2., height,
             f'{score}',
             ha='center', va='bottom', fontweight='bold', fontsize=9)

# Tambahkan legend
from matplotlib.patches import Patch
legend_elements = [
    Patch(facecolor='#10b981', label='Player Menang'),
    Patch(facecolor='#ef4444', label='AI Menang')
]
plt.legend(handles=legend_elements, loc='upper right')
plt.tight_layout()
plt.savefig('grafik_tournament_summary.png')
print("✅ Grafik 5 disimpan: grafik_tournament_summary.png")

# --- ANALISIS FIRST-MOVE ADVANTAGE ---
if 'first_player' in df.columns and 'game_result' in df.columns:
    print("\n" + "="*60)
    print("📊 ANALISIS FIRST-MOVE ADVANTAGE")
    print("="*60)
    
    game_summary = df.groupby('game_id').last()
    
    if 'first_player_mode' in game_summary.columns:
        mode_used = game_summary['first_player_mode'].mode()[0] if len(game_summary['first_player_mode'].mode()) > 0 else 'unknown'
        print(f"\n🎯 Mode First Player: {mode_used.upper()}")
    
    first_move_stats = game_summary.groupby('first_player')['game_result'].value_counts().unstack(fill_value=0)
    
    print("\n📊 Win Rate Berdasarkan First Player:")
    print(first_move_stats)
    
    plt.figure(figsize=(10, 6))
    first_move_stats.plot(kind='bar', stacked=False, color=['#ff7b7b', '#ffe066', '#cccccc'])
    plt.title('First-Move Advantage Analysis')
    plt.xlabel('Pemain yang Jalan Duluan')
    plt.ylabel('Jumlah Game')
    plt.legend(title='Pemenang', labels=['Red Wins', 'Yellow Wins', 'Draw'])
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig('grafik_first_move_advantage.png')
    print("✅ Grafik 6 disimpan: grafik_first_move_advantage.png")

print("\n" + "="*60)
print("✅ ANALISIS SELESAI!")
print("="*60)
print("\n📁 File grafik tersimpan:")
print("   - grafik_kompleksitas_node.png (AI Complexity)")
print("   - grafik_waktu.png (Thinking Time)")
print("   - grafik_win_rate.png (Win Rate vs AI Type)")
print("   - grafik_distribusi_skor.png (Score Distribution)")
print("   - grafik_tournament_summary.png (Per Peserta)")
print("   - grafik_first_move_advantage.png (First Move Analysis)")
print("   - grafik_ai_comparison.png (Reflex vs Minimax)")
print("\n🎓 Gunakan grafik-grafik ini untuk paper/makalah Anda!")

# --- BONUS: AI ALGORITHM COMPARISON CHART ---
print("\n" + "="*60)
print("📊 PERBANDINGAN ALGORITMA AI")
print("="*60)

ai_data = df[df['mode'] != 'Human'].copy()
if not ai_data.empty:
    # Simplify mode names
    ai_data['algorithm'] = ai_data['mode'].apply(lambda x: 'Greedy (Reflex)' if 'Reflex' in str(x) else 'Minimax (Defend)')
    
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))
    
    # Chart 1: Nodes Explored
    sns.boxplot(data=ai_data, x='algorithm', y='nodes_explored', ax=axes[0], palette=['#ff7b7b', '#4ade80'])
    axes[0].set_title('Space Complexity: Nodes Explored', fontweight='bold')
    axes[0].set_ylabel('Nodes Explored')
    axes[0].set_xlabel('Algorithm')
    
    # Chart 2: Thinking Time
    sns.boxplot(data=ai_data, x='algorithm', y='thinking_time_ms', ax=axes[1], palette=['#ff7b7b', '#4ade80'])
    axes[1].set_title('Time Complexity: Thinking Time', fontweight='bold')
    axes[1].set_ylabel('Time (milliseconds)')
    axes[1].set_xlabel('Algorithm')
    
    plt.tight_layout()
    plt.savefig('grafik_ai_comparison.png', dpi=300)
    print("\n✅ Grafik Bonus: grafik_ai_comparison.png")
    
    # Print comparison stats
    print("\n📊 Perbandingan Detail:")
    for algo in ai_data['algorithm'].unique():
        algo_data = ai_data[ai_data['algorithm'] == algo]
        print(f"\n{algo}:")
        print(f"  Avg Nodes: {algo_data['nodes_explored'].mean():.0f}")
        print(f"  Avg Time: {algo_data['thinking_time_ms'].mean():.2f}ms")
        print(f"  Max Nodes: {algo_data['nodes_explored'].max():.0f}")
        print(f"  Max Time: {algo_data['thinking_time_ms'].max():.2f}ms")
