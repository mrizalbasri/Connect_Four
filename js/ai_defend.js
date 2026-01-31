// ai_defend.js - AI "Defend" (Bertahan & Mikir)
// Menggunakan Minimax Algorithm dengan Alpha-Beta Pruning

const SEARCH_DEPTH = 4 ; // Kedalaman berpikir (4 langkah ke depan)
let nodesExplored_defend = 0; // Global counter untuk statistik riset

function getDefendMove(boardState, playerColor) {
    const startTime = performance.now();
    nodesExplored_defend = 0; // Reset counter
    
    // Copy board agar aman
    const boardCopy = JSON.parse(JSON.stringify(boardState));
    
    // Jalankan Minimax
    // playerColor adalah Maximizing Player di tree ini
    const result = minimax(boardCopy, SEARCH_DEPTH, -Infinity, Infinity, true, playerColor);
    
    const timeTaken = (performance.now() - startTime).toFixed(2);
    console.log(`[DEFEND AI] Move: Col ${result.column}, Score: ${result.score}, Time: ${timeTaken}ms, Nodes: ${nodesExplored_defend}`);

    // Log visual
    if (typeof logDecision === 'function') {
        const selectedWithNodes = { col: result.column, score: result.score, nodes: nodesExplored_defend };
        logDecision([], selectedWithNodes, timeTaken, 'Defend (Minimax)');
    }

    // Fallback jika null (misal penuh/draw)
    if (result.column === null) {
        const valid = getValidLocations(boardState);
        return valid[0];
    }

    return result.column;
}

function minimax(boardState, depth, alpha, beta, maximizingPlayer, myself) {
    nodesExplored_defend++; // Hitung node ini sebagai 1 unit simulasi
    
    const validLocations = getValidLocations(boardState);
    const opponent = myself === 'red' ? 'yellow' : 'red';
    
    // Terminal Node Checks
    if (checkWinBoard(boardState, myself)) return { score: 1000000, column: null };
    if (checkWinBoard(boardState, opponent)) return { score: -1000000, column: null };
    if (validLocations.length === 0) return { score: 0, column: null };
    if (depth === 0) {
        return { score: scoreBoard(boardState, myself), column: null };
    }

    // MOVE ORDERING: Cek kolom tengah dulu untuk Alpha-Beta Pruning lebih efektif
    const orderedCols = [3, 2, 4, 1, 5, 0, 6].filter(c => validLocations.includes(c));

    if (maximizingPlayer) {
        let value = -Infinity;
        let column = orderedCols[0]; // Start with center
        
        for (let col of orderedCols) {
            const row = getOpenRow(boardState, col);
            const bCopy = JSON.parse(JSON.stringify(boardState));
            bCopy[row][col] = myself;
            
            const newScore = minimax(bCopy, depth - 1, alpha, beta, false, myself).score;
            
            if (newScore > value) {
                value = newScore;
                column = col;
            }
            alpha = Math.max(alpha, value);
            if (alpha >= beta) break; // Alpha-Beta Pruning
        }
        return { score: value, column: column };
    } else {
        // Minimizing Player (Lawan)
        let value = Infinity;
        let column = orderedCols[0];
        
        for (let col of orderedCols) {
            const row = getOpenRow(boardState, col);
            const bCopy = JSON.parse(JSON.stringify(boardState));
            bCopy[row][col] = opponent;
            
            const newScore = minimax(bCopy, depth - 1, alpha, beta, true, myself).score;
            
            if (newScore < value) {
                value = newScore;
                column = col;
            }
            beta = Math.min(beta, value);
            if (alpha >= beta) break; // Alpha-Beta Pruning
        }
        return { score: value, column: column };
    }
}

function scoreBoard(b, piece) {
    let score = 0;
    const oppPiece = piece === 'red' ? 'yellow' : 'red';

    // Center Preference (turunkan dari 10 ke 4)
    for(let r=0; r<6; r++) {
        if(b[r][3] === piece) score += 4; // Center column
        if(b[r][2] === piece || b[r][4] === piece) score += 2; // Near center
    }

    // Evaluasi Windows: Horizontal, Vertical, Diagonal
    
    // Horizontal
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 4; c++) {
            score += evaluateWindow([b[r][c], b[r][c+1], b[r][c+2], b[r][c+3]], piece, oppPiece);
        }
    }
    // Vertical
    for (let c = 0; c < 7; c++) {
        for (let r = 0; r < 3; r++) {
            score += evaluateWindow([b[r][c], b[r+1][c], b[r+2][c], b[r+3][c]], piece, oppPiece);
        }
    }
    // Diagonal Positif
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
            score += evaluateWindow([b[r][c], b[r+1][c+1], b[r+2][c+2], b[r+3][c+3]], piece, oppPiece);
        }
    }
    // Diagonal Negatif
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
            score += evaluateWindow([b[r+3][c], b[r+2][c+1], b[r+1][c+2], b[r][c+3]], piece, oppPiece);
        }
    }

    return score;
}

function evaluateWindow(window, piece, oppPiece) {
    let score = 0;
    let countPiece = window.filter(x => x === piece).length;
    let countEmpty = window.filter(x => x === null).length;
    let countOpp = window.filter(x => x === oppPiece).length;

    // DEFENSIF: Turunkan dari -500 ke -100 (lebih seimbang)
    if (countOpp === 3 && countEmpty === 1) score -= 100; 
    else if (countOpp === 2 && countEmpty === 2) score -= 20;
    
    // OFENSIF: Turunkan dari +100 ke +30 (lebih seimbang)
    if (countPiece === 4) score += 1000; // Tidak akan tercapai (terminal)
    else if (countPiece === 3 && countEmpty === 1) score += 30; // Turun dari 100
    else if (countPiece === 2 && countEmpty === 2) score += 5; // Turun dari 10

    return score;
}
