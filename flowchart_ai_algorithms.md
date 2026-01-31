# Flowchart Algoritma AI - Connect Four

## 1. Reflex Agent (Greedy Heuristic)

```mermaid
flowchart TD
    Start([Mulai: Giliran AI Reflex]) --> Init[Reset Nodes Counter = 0]
    Init --> GetValid[Dapatkan Kolom Valid]

    GetValid --> CheckOne{Hanya 1 kolom<br/>tersedia?}
    CheckOne -->|Ya| ReturnDirect[Return kolom tersebut<br/>Nodes = 0]
    CheckOne -->|Tidak| LoopStart[Loop setiap kolom valid]

    LoopStart --> IncrementNode[Nodes++]
    IncrementNode --> SimPlace[Simulasi: Taruh bidak di kolom]

    SimPlace --> CheckWin{Langkah ini<br/>MENANG instant?}
    CheckWin -->|Ya| ScoreWin[Score = 1,000,000]
    CheckWin -->|Tidak| CheckBlock

    CheckBlock{Langkah ini<br/>BLOKIR lawan menang?}
    CheckBlock -->|Ya| ScoreBlock[Score += 500,000]
    CheckBlock -->|Tidak| CalcAttack

    ScoreBlock --> CalcAttack[Hitung Potensi Serangan<br/>evaluateHeuristics]

    CalcAttack --> CalcCenter[Bonus Kontrol Tengah<br/>Score += 3-abs col-3 × 10]
    CalcCenter --> AddRandom[Tambah Randomness<br/>Score += random 0-20]

    AddRandom --> StoreScore[Simpan col & score]
    StoreScore --> MoreCols{Masih ada<br/>kolom lain?}
    MoreCols -->|Ya| LoopStart
    MoreCols -->|Tidak| SortMoves[Sort moves by score DESC]

    SortMoves --> PickBest[Pilih score tertinggi<br/>dengan sedikit random]
    PickBest --> LogDecision[Log: col, score, nodes, time]
    LogDecision --> ReturnCol([Return kolom terpilih])

    ReturnDirect --> End([Selesai])
    ReturnCol --> End

    style Start fill:#e1f5e1
    style End fill:#ffe1e1
    style CheckWin fill:#fff4e1
    style CheckBlock fill:#fff4e1
    style ScoreWin fill:#c8e6c9
    style ScoreBlock fill:#ffecb3
```

---

## 2. Defend Agent (Minimax + Alpha-Beta Pruning)

```mermaid
flowchart TD
    Start([Mulai: Giliran AI Defend]) --> InitDefend[Reset Nodes Counter = 0<br/>Copy Board State]
    InitDefend --> CallMinimax[Panggil Minimax<br/>depth=4, alpha=-∞, beta=+∞<br/>maximizing=true]

    CallMinimax --> MinimaxStart[MINIMAX FUNCTION]
    MinimaxStart --> IncrNodes[Nodes++]
    IncrNodes --> GetValidMM[Dapatkan Kolom Valid]

    GetValidMM --> TerminalCheck{Terminal Node?}
    TerminalCheck -->|AI Menang| ReturnWin[Return score = +1,000,000]
    TerminalCheck -->|Lawan Menang| ReturnLose[Return score = -1,000,000]
    TerminalCheck -->|Board Penuh| ReturnDraw[Return score = 0]
    TerminalCheck -->|Depth = 0| EvalBoard[Evaluasi Board<br/>scoreBoard function]
    TerminalCheck -->|Tidak| CheckPlayer{Maximizing<br/>Player?}

    EvalBoard --> ReturnEval[Return score heuristik]

    CheckPlayer -->|Ya: AI Turn| MaxLoop[value = -∞<br/>Loop setiap kolom]
    CheckPlayer -->|Tidak: Lawan Turn| MinLoop[value = +∞<br/>Loop setiap kolom]

    MaxLoop --> SimAI[Simulasi: Taruh bidak AI]
    SimAI --> RecurseMin[Rekursi Minimax<br/>depth-1, minimizing=false]
    RecurseMin --> CompareMax{newScore > value?}
    CompareMax -->|Ya| UpdateMax[value = newScore<br/>column = col]
    CompareMax -->|Tidak| CheckAlpha
    UpdateMax --> CheckAlpha{alpha >= beta?}
    CheckAlpha -->|Ya: Pruning| BreakMax[Break loop<br/>Alpha-Beta Cut]
    CheckAlpha -->|Tidak| UpdateAlpha[alpha = max alpha, value]
    UpdateAlpha --> MoreColsMax{Masih ada kolom?}
    MoreColsMax -->|Ya| MaxLoop
    MoreColsMax -->|Tidak| ReturnMax[Return value, column]

    MinLoop --> SimOpp[Simulasi: Taruh bidak Lawan]
    SimOpp --> RecurseMax[Rekursi Minimax<br/>depth-1, maximizing=true]
    RecurseMax --> CompareMin{newScore < value?}
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
```

---

## 3. Perbandingan Evaluasi Heuristik

```mermaid
flowchart LR
    subgraph Reflex["REFLEX AGENT - evaluateHeuristics"]
        R1[Cek 4 arah:<br/>Horizontal, Vertikal,<br/>Diagonal +, Diagonal -]
        R2[Hitung bidak segaris]
        R3{Jumlah bidak?}
        R3 -->|4 segaris| R4[+1000 poin]
        R3 -->|3 segaris + 1 kosong| R5[+150 poin]
        R3 -->|2 segaris + 2 kosong| R6[+30 poin]

        R1 --> R2 --> R3
    end

    subgraph Defend["DEFEND AGENT - scoreBoard + evaluateWindow"]
        D1[Evaluasi semua window 4-bidak:<br/>Horizontal, Vertikal, Diagonal]
        D2[Hitung komposisi window]
        D3{Kondisi?}
        D3 -->|4 bidak AI| D4[+100 poin]
        D3 -->|3 bidak AI + 1 kosong| D5[+5 poin]
        D3 -->|2 bidak AI + 2 kosong| D6[+2 poin]
        D3 -->|3 bidak Lawan + 1 kosong| D7[-80 poin<br/>DEFENSIF!]
        D3 -->|Bidak di tengah| D8[+3 poin per bidak]

        D1 --> D2 --> D3
    end

    style Reflex fill:#ffe1e1
    style Defend fill:#e1f0ff
    style R4 fill:#c8e6c9
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
        A --> A3[Nodes: ~7 per turn]

        B --> B1[Time: O b^d<br/>b=branching, d=depth]
        B --> B2[Space: O d<br/>Stack rekursi]
        B --> B3[Nodes: ~100-1000 per turn<br/>dengan Alpha-Beta Pruning]
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

    Reflex->>Reflex: Evaluasi 7 kolom<br/>Nodes ~7
    Reflex->>Board: Taruh bidak di kolom X
    Board-->>Game: Update board

    Game->>Game: Cek menang/seri?
    Game->>Minimax: Giliran Kuning

    Minimax->>Minimax: Minimax depth=4<br/>Nodes ~500
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
| **Depth Pencarian**    | 0 (hanya evaluasi langsung)     | 4 (simulasi 4 langkah ke depan)      |
| **Nodes Explored**     | ~7 nodes/turn                   | ~100-1000 nodes/turn                 |
| **Waktu Eksekusi**     | <5ms                            | 50-500ms                             |
| **Strategi**           | Greedy (pilih terbaik sekarang) | Optimal (asumsi lawan main sempurna) |
| **Kompleksitas**       | O(n) - Linear                   | O(b^d) - Exponential                 |
| **Tipe Agent**         | Simple Reflex Agent             | Goal-Based Agent                     |
| **Prediksi Lawan**     | Tidak ada                       | Ada (minimizing player)              |
| **Alpha-Beta Pruning** | Tidak ada                       | Ada (efisiensi)                      |

---

## Kesimpulan untuk Karya Ilmiah

**Kedua algoritma sudah SEIMBANG dan SESUAI** karena:

1. ✅ **Perbedaan filosofi jelas**: Reaktif vs Prediktif
2. ✅ **Kompleksitas berbeda signifikan**: Linear vs Exponential
3. ✅ **Trade-off yang jelas**: Speed vs Accuracy
4. ✅ **Implementasi standar**: Sesuai literatur AI (Russell & Norvig)

**Tidak perlu mengubah skor evaluasi** - perbedaan performa akan terlihat dari:

- Win rate (%)
- Nodes explored
- Waktu eksekusi
- Kualitas keputusan strategis
