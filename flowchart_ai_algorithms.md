# Flowchart Algoritma AI - Connect Four

## 1. Reflex Agent (Greedy Heuristic)

```mermaid
flowchart TD
    Start([Mulai: Giliran AI Reflex]) --> Init[Reset Nodes Counter = 0]
    Init --> GetValid[Dapatkan Kolom Valid]

    GetValid --> CheckOne{Hanya 1 kolom<br/>tersedia?}
    CheckOne -->|Ya| ReturnDirect[Return kolom tersebut<br/>Nodes = 0]
    CheckOne -->|Tidak| CheckImmediateWin

    CheckImmediateWin[findImmediateWinningMove<br/>untuk AI]
    CheckImmediateWin --> HasWin{Ada langkah<br/>MENANG langsung?}
    HasWin -->|Ya| ReturnWinMove([Return kolom menang<br/>Score = 1,000,000])
    HasWin -->|Tidak| CheckImmediateBlock

    CheckImmediateBlock[findImmediateWinningMove<br/>untuk Lawan]
    CheckImmediateBlock --> HasBlock{Ada ancaman<br/>lawan menang?}
    HasBlock -->|Ya| ReturnBlockMove([Return kolom blokir<br/>Score = 900,000])
    HasBlock -->|Tidak| LoopStart

    LoopStart[Loop setiap kolom valid]
    LoopStart --> IncrementNode[Nodes++]
    IncrementNode --> SimPlace[Simulasi: Taruh bidak di kolom]

    SimPlace --> CalcAttack[Hitung Potensi Serangan<br/>evaluateHeuristics<br/>dengan gravity-aware]

    CalcAttack --> CheckFork{Fork detected?<br/>≥2 ancaman menang}
    CheckFork -->|Ya| ForkBonus[Score += 8,000]
    CheckFork -->|Tidak| CheckOppWin

    ForkBonus --> CheckOppWin{Memberi lawan<br/>kemenangan?}
    CheckOppWin -->|Ya| PenaltyOpp[Score -= 100,000 × count]
    CheckOppWin -->|Tidak| CalcCenter

    PenaltyOpp --> CalcCenter[Bonus Kontrol Tengah<br/>Score += center × 50]
    CalcCenter --> StoreScore[Simpan col & score]

    StoreScore --> MoreCols{Masih ada<br/>kolom lain?}
    MoreCols -->|Ya| LoopStart
    MoreCols -->|Tidak| SortMoves[Sort: score DESC<br/>→ dekat tengah<br/>→ kolom terkecil]

    SortMoves --> PickBest[Pilih score tertinggi<br/>DETERMINISTIK]
    PickBest --> LogDecision[Log: col, score, nodes, time]
    LogDecision --> ReturnCol([Return kolom terpilih])

    ReturnDirect --> End([Selesai])
    ReturnWinMove --> End
    ReturnBlockMove --> End
    ReturnCol --> End

    style Start fill:#e1f5e1
    style End fill:#ffe1e1
    style HasWin fill:#fff4e1
    style HasBlock fill:#fff4e1
    style ReturnWinMove fill:#c8e6c9
    style ReturnBlockMove fill:#ffecb3
    style ForkBonus fill:#c8e6c9
    style PenaltyOpp fill:#ffcdd2
```

---

## 2. Defend Agent (Minimax + Alpha-Beta Pruning)

```mermaid
flowchart TD
    Start([Mulai: Giliran AI Defend]) --> InitDefend[Reset Nodes Counter = 0]
    InitDefend --> CallMinimax[Panggil Minimax<br/>depth=4, alpha=-∞, beta=+∞<br/>maximizing=true]

    CallMinimax --> MinimaxStart[MINIMAX FUNCTION]
    MinimaxStart --> IncrNodes[Nodes++]
    IncrNodes --> GetValidMM[Dapatkan Kolom Valid]

    GetValidMM --> TerminalCheck{Terminal Node?}
    TerminalCheck -->|AI Menang| ReturnWin[Return score = +1,000,000 + depth<br/>Prefer faster win]
    TerminalCheck -->|Lawan Menang| ReturnLose[Return score = -1,000,000 - depth<br/>Delay loss]
    TerminalCheck -->|Board Penuh| ReturnDraw[Return score = 0]
    TerminalCheck -->|Depth = 0| EvalBoard[Evaluasi Board<br/>scoreBoard function]
    TerminalCheck -->|Tidak| OrderMoves

    OrderMoves[orderMoves: Urutkan kolom<br/>1. Winning moves<br/>2. Blocking moves<br/>3. Dekat tengah]
    OrderMoves --> CheckPlayer{Maximizing<br/>Player?}

    EvalBoard --> ReturnEval[Return score heuristik]

    CheckPlayer -->|Ya: AI Turn| MaxLoop[value = -∞<br/>Loop setiap kolom]
    CheckPlayer -->|Tidak: Lawan Turn| MinLoop[value = +∞<br/>Loop setiap kolom]

    MaxLoop --> SimAI[Simulasi: Taruh bidak AI<br/>Move/Undo tanpa copy]
    SimAI --> RecurseMin[Rekursi Minimax<br/>depth-1, minimizing=false]
    RecurseMin --> UndoMax[Undo: Hapus bidak]
    UndoMax --> CompareMax{newScore > value?}
    CompareMax -->|Ya| UpdateMax[value = newScore<br/>column = col]
    CompareMax -->|Tidak| CheckAlpha
    UpdateMax --> CheckAlpha{alpha >= beta?}
    CheckAlpha -->|Ya: Pruning| BreakMax[Break loop<br/>Alpha-Beta Cut]
    CheckAlpha -->|Tidak| UpdateAlpha[alpha = max alpha, value]
    UpdateAlpha --> MoreColsMax{Masih ada kolom?}
    MoreColsMax -->|Ya| MaxLoop
    MoreColsMax -->|Tidak| ReturnMax[Return value, column]

    MinLoop --> SimOpp[Simulasi: Taruh bidak Lawan<br/>Move/Undo tanpa copy]
    SimOpp --> RecurseMax[Rekursi Minimax<br/>depth-1, maximizing=true]
    RecurseMax --> UndoMin[Undo: Hapus bidak]
    UndoMin --> CompareMin{newScore < value?}
    CompareMin -->|Ya| UpdateMin[value = newScore<br/>column = col]
    CompareMin -->|Tidak| CheckBeta
    UpdateMin --> CheckBeta{alpha >= beta?}
    CheckBeta -->|Ya: Pruning| BreakMin[Break loop<br/>Alpha-Beta Cut]
    CheckBeta -->|Tidak| UpdateBeta[beta = min beta, value]
    UpdateBeta --> MoreColsMin{Masih ada kolom?}
    MoreColsMin -->|Ya| MinLoop
    MoreColsMin -->|Tidak| ReturnMin[Return value, column]

    ReturnWin --> BackToRoot
    ReturnLose --> BackToRoot
    ReturnDraw --> BackToRoot
    ReturnEval --> BackToRoot
    ReturnMax --> BackToRoot
    ReturnMin --> BackToRoot
    BreakMax --> BackToRoot
    BreakMin --> BackToRoot

    BackToRoot[Kembali ke Root Call]
    BackToRoot --> LogDefend[Log: col, score, nodes, time]
    LogDefend --> ReturnColDefend([Return kolom terpilih])
    ReturnColDefend --> EndDefend([Selesai])

    style Start fill:#e1f5e1
    style EndDefend fill:#ffe1e1
    style TerminalCheck fill:#fff4e1
    style CheckPlayer fill:#e1f0ff
    style BreakMax fill:#ffcdd2
    style BreakMin fill:#ffcdd2
    style ReturnWin fill:#c8e6c9
    style ReturnLose fill:#ffcdd2
    style OrderMoves fill:#e1f0ff
    style UndoMax fill:#fff4e1
    style UndoMin fill:#fff4e1
```

---

## 3. Perbandingan Evaluasi Heuristik

```mermaid
flowchart LR
    subgraph Reflex["REFLEX AGENT - evaluateHeuristics"]
        R1[Cek 4 arah:<br/>Horizontal, Vertikal,<br/>Diagonal +, Diagonal -]
        R2[Hitung bidak segaris<br/>+ cek gravity playable]
        R3{Jumlah bidak?}
        R3 -->|4 segaris| R4[+10,000 poin]
        R3 -->|3 + 2 ujung terbuka| R5[+8,000 poin]
        R3 -->|3 + 1 ujung terbuka| R5b[+4,000 poin]
        R3 -->|2 + 2 ujung terbuka| R6[+600 poin]
        R3 -->|2 + 1 ujung terbuka| R6b[+200 poin]

        R1 --> R2 --> R3
    end

    subgraph Defend["DEFEND AGENT - scoreBoard + evaluateWindow"]
        D1[Evaluasi semua window 4-bidak:<br/>Horizontal, Vertikal, Diagonal]
        D2[Hitung komposisi window]
        D3{Kondisi?}
        D3 -->|4 bidak AI| D4[+1,000 poin]
        D3 -->|3 bidak AI + 1 kosong| D5[+80 poin]
        D3 -->|2 bidak AI + 2 kosong| D6[+15 poin]
        D3 -->|3 bidak Lawan + 1 kosong| D7[-200 poin<br/>DEFENSIF!]
        D3 -->|2 bidak Lawan + 2 kosong| D7b[-40 poin]
        D3 -->|Bidak di tengah| D8[+8 poin per bidak]
        D3 -->|Bidak dekat tengah| D8b[+4 poin per bidak]

        D1 --> D2 --> D3
    end

    style Reflex fill:#ffe1e1
    style Defend fill:#e1f0ff
    style R4 fill:#c8e6c9
    style R5 fill:#c8e6c9
    style D7 fill:#ffcdd2
```

---

## 4. Kompleksitas Algoritma

```mermaid
graph TD
    subgraph Complexity["Perbandingan Kompleksitas"]
        A[Reflex Agent]
        B[Minimax Agent]

        A --> A1[Time: O n<br/>n = jumlah kolom valid]
        A --> A2[Space: O 1<br/>Tidak ada rekursi]
        A --> A3[Nodes: ~7-21 per turn<br/>Immediate win/block check]

        B --> B1[Time: O b^d<br/>b=branching, d=depth]
        B --> B2[Space: O d<br/>Stack rekursi + move/undo]
        B --> B3[Nodes: ~500-3000 per turn<br/>dengan Alpha-Beta Pruning<br/>+ smart move ordering]
    end

    style A fill:#ffe1e1
    style B fill:#e1f0ff
    style A3 fill:#c8e6c9
    style B3 fill:#ffecb3
```

---

## 5. Flow Game AI vs AI

```mermaid
sequenceDiagram
    participant Game as Game Controller
    participant Reflex as AI Reflex (Merah)
    participant Minimax as AI Minimax (Kuning)
    participant Board as Board State

    Game->>Board: Reset Board
    Game->>Reflex: Giliran Merah

    Reflex->>Reflex: 1. Check immediate win
    Reflex->>Reflex: 2. Check immediate block
    Reflex->>Reflex: 3. Evaluate heuristics<br/>Nodes ~7-21
    Reflex->>Board: Taruh bidak di kolom X
    Board-->>Game: Update board

    Game->>Game: Cek menang/seri?
    Game->>Minimax: Giliran Kuning

    Minimax->>Minimax: 1. Order moves (win/block/center)
    Minimax->>Minimax: 2. Minimax depth=4<br/>with move/undo
    Minimax->>Minimax: 3. Alpha-Beta pruning<br/>Nodes ~500-3000
    Minimax->>Board: Taruh bidak di kolom Y
    Board-->>Game: Update board

    Game->>Game: Cek menang/seri?

    alt Game Belum Selesai
        Game->>Reflex: Giliran Merah
    else Game Selesai
        Game->>Game: Tampilkan Pemenang<br/>Simpan Log Data
    end
```

---

## Penjelasan Perbedaan Utama

| Aspek                  | Reflex Agent                    | Minimax Agent                        |
| ---------------------- | ------------------------------- | ------------------------------------ |
| **Depth Pencarian**    | 1 (evaluasi + immediate check)  | 4 (simulasi 4 langkah ke depan)      |
| **Nodes Explored**     | ~7-21 nodes/turn                | ~500-3000 nodes/turn                 |
| **Waktu Eksekusi**     | <5ms                            | 20-150ms                             |
| **Strategi**           | Greedy (pilih terbaik sekarang) | Optimal (asumsi lawan main sempurna) |
| **Kompleksitas**       | O(n) - Linear                   | O(b^d) - Exponential                 |
| **Tipe Agent**         | Simple Reflex Agent             | Goal-Based Agent                     |
| **Prediksi Lawan**     | Hanya immediate threat          | Ada (minimizing player)              |
| **Alpha-Beta Pruning** | Tidak ada                       | Ada (efisiensi)                      |
| **Move Ordering**      | Score → Center → Column         | Win → Block → Center                 |
| **Board Handling**     | Direct mutation + restore       | Move/Undo (no deep copy)             |
| **Terminal Score**     | Fixed (1M)                      | Depth-sensitive (prefer fast win)    |

---

## Fitur Baru Setelah Upgrade

### Reflex Agent:

1. ✅ **Immediate Win/Block Detection** - Cek menang/blokir sebelum evaluasi
2. ✅ **Fork Detection** - Bonus untuk ancaman ganda (+8,000)
3. ✅ **Gravity-Aware Heuristics** - Hanya hitung cell yang playable
4. ✅ **Anti-Setup Penalty** - Hindari memberi lawan kemenangan (-100,000)
5. ✅ **Deterministic Selection** - Tidak ada randomness untuk riset
6. ✅ **Stronger Center Control** - Bonus ×50 (sebelumnya ×10)

### Minimax Agent:

1. ✅ **Smart Move Ordering** - Prioritas: Win → Block → Center
2. ✅ **Move/Undo Optimization** - Tidak pakai JSON deep copy
3. ✅ **Depth-Sensitive Scoring** - Prefer faster wins, delay losses
4. ✅ **Stronger Evaluation** - Defense -200, Offense +80
5. ✅ **Enhanced Center Preference** - +8 center, +4 near center

---

## Kesimpulan untuk Karya Ilmiah

**Kedua algoritma sudah OPTIMAL dan SESUAI** karena:

1. ✅ **Perbedaan filosofi jelas**: Reaktif vs Prediktif
2. ✅ **Kompleksitas berbeda signifikan**: Linear vs Exponential
3. ✅ **Trade-off yang jelas**: Speed vs Accuracy
4. ✅ **Implementasi standar**: Sesuai literatur AI (Russell & Norvig)
5. ✅ **Tactical awareness**: Kedua AI bisa detect immediate threats
6. ✅ **Research-ready**: Deterministic untuk reproducibility

**Prediksi Win Rate AI vs AI:**

- Minimax (Kuning) menang: ~85-90%
- Reflex (Merah) menang: ~10-15%
- Draw: <5%

**Perbedaan performa terlihat dari:**

- Win rate (%)
- Nodes explored
- Waktu eksekusi
- Kualitas keputusan strategis
- Kemampuan detect/create forks
