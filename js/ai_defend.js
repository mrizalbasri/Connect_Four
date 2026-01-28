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

    if (maximizingPlayer) {
        let value = -Infinity;
        let column = validLocations[Math.floor(Math.random() * validLocations.length)]; // Random start
        
        for (let col of validLocations) {
            const row = getOpenRow(boardState, col);
            const bCopy = JSON.parse(JSON.stringify(boardState));
            bCopy[row][col] = myself;
            
            const newScore = minimax(bCopy, depth - 1, alpha, beta, false, myself).score;
            
            if (newScore > value) {
                value = newScore;
                column = col;
            }
            alpha = Math.max(alpha, value);
            if (alpha >= beta) break;
        }
        return { score: value, column: column };
    } else {
        // Minimizing Player (Lawan)
        let value = Infinity;
        let column = validLocations[Math.floor(Math.random() * validLocations.length)];
        
        for (let col of validLocations) {
            const row = getOpenRow(boardState, col);
            const bCopy = JSON.parse(JSON.stringify(boardState));
            bCopy[row][col] = opponent;
            
            const newScore = minimax(bCopy, depth - 1, alpha, beta, true, myself).score;
            
            if (newScore < value) {
                value = newScore;
                column = col;
            }
            beta = Math.min(beta, value);
            if (alpha >= beta) break;
        }
        return { score: value, column: column };
    }
}

function scoreBoard(b, piece) {
    let score = 0;
    const oppPiece = piece === 'red' ? 'yellow' : 'red';

    // Prioritas bertahan & menyerang

    // Center Preference
    for(let r=0; r<6; r++) {
        if(b[r][3] === piece) score += 3;
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

    // Defensif: Sangat takut pada 3 punya lawan
    if (countOpp === 3 && countEmpty === 1) score -= 80; // Hati-hati!
    
    // Ofensif standar
    if (countPiece === 4) score += 100;
    else if (countPiece === 3 && countEmpty === 1) score += 5;
    else if (countPiece === 2 && countEmpty === 2) score += 2;

    return score;
}
