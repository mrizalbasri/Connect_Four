// ai_reflex.js - AI "Reflex" (Agresif & Cepat)
// Menggunakan Heuristik Greedy (Cari poin instan)

let nodesExplored_reflex = 0; // Counter riset

function getReflexMove(boardState, playerColor) {
    const startTime = performance.now();
    nodesExplored_reflex = 0;
    
    const moves = [];
    const validMoves = getValidLocations(boardState);
    
    // Jika hanya ada satu langkah legal, langsung ambil (0 node exploration karena tidak mikir)
    if (validMoves.length === 1) return validMoves[0];

    for (let col of validMoves) {
        nodesExplored_reflex++; // 1 evaluasi = 1 node

        let r = getOpenRow(boardState, col);
        
        // Hitung skor berdasarkan heuristik "Attack"
        let score = evaluateReflex(boardState, r, col, playerColor);
        moves.push({ col: col, score: score });
    }

    // Sort by Score Descending
    moves.sort((a, b) => b.score - a.score);
    
    // Pilih langkah terbaik (dengan sedikit random jika skor sama)
    const bestScore = moves[0].score;
    const candidates = moves.filter(m => m.score >= bestScore - 100); 
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    
    const timeTaken = (performance.now() - startTime).toFixed(2);
    console.log(`[REFLEX AI] Move: Col ${chosen.col}, Score: ${chosen.score}, Decisions: ${nodesExplored_reflex}`);
    
    // Log visual
    if (typeof logDecision === 'function') {
        const selectedWithNodes = { col: chosen.col, score: chosen.score, nodes: nodesExplored_reflex };
        logDecision(moves, selectedWithNodes, timeTaken, 'Reflex (Agresif)');
    }

    return chosen.col;
}

function evaluateReflex(board, row, col, aiColor) {
    let score = 0;
    const oppColor = aiColor === 'red' ? 'yellow' : 'red';

    // Board sementara untuk simulasi
    board[row][col] = aiColor; 
    
    // 1. Menang Sekarang (Instinct)
    if (checkWinBoard(board, aiColor)) {
        board[row][col] = null;
        return 1000000;
    }
    
    // 2. Blokir Lawan (Defense)
    board[row][col] = oppColor;
    if (checkWinBoard(board, oppColor)) {
        score += 500000;
    }
    board[row][col] = null; 

    // 3. Potensi Serangan
    board[row][col] = aiColor;
    const attackPotential = evaluateHeuristics(board, row, col, aiColor);
    score += attackPotential * 2.0; 
    board[row][col] = null;

    // 4. Center Control
    score += (3 - Math.abs(col - 3)) * 10;

    // 5. Randomness
    score += Math.floor(Math.random() * 20);

    return score;
}

// Helper Heuristik Sederhana (Hitung potensi baris)
function evaluateHeuristics(board, row, col, player) {
    let total = 0;
    const dirs = [[0,1], [1,0], [1,1], [1,-1]];
    
    for (let d of dirs) {
        // Cek berapa bidak segaris yang bisa dibentuk
        let count = 1; 
        
        // Arah Positif
        let r = row + d[0], c = col + d[1];
        while (isValidPos(r,c) && board[r][c] === player) { count++; r += d[0]; c += d[1]; }
        let open1 = isValidPos(r,c) && board[r][c] === null;

        // Arah Negatif
        r = row - d[0], c = col - d[1];
        while (isValidPos(r,c) && board[r][c] === player) { count++; r -= d[0]; c -= d[1]; }
        let open2 = isValidPos(r,c) && board[r][c] === null;

        // Poin
        if (count >= 4) total += 1000;
        else if (count === 3 && (open1 || open2)) total += 150; // Ancaman 3
        else if (count === 2 && (open1 && open2)) total += 30;  // Potensi 2
    }
    return total;
}

function isValidPos(r, c) {
    return r >= 0 && r < 6 && c >= 0 && c < 7;
}

