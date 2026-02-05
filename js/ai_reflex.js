// ai_reflex.js - AI "Reflex" (Agresif & Cepat)
// Menggunakan Heuristik Greedy (Cari poin instan)

let nodesExplored_reflex = 0; // Counter riset

function getReflexMove(boardState, playerColor) {
  const startTime = performance.now();
  nodesExplored_reflex = 0;

  const moves = [];
  const validMoves = getValidLocations(boardState);
  const opponent = playerColor === "red" ? "yellow" : "red";

  // Jika hanya ada satu langkah legal, langsung ambil (0 node exploration karena tidak mikir)
  if (validMoves.length === 1) return validMoves[0];

  // 1) Menang langsung jika ada
  const immediateWin = findImmediateWinningMove(
    boardState,
    playerColor,
    validMoves,
  );
  if (immediateWin !== null) {
    const timeTaken = (performance.now() - startTime).toFixed(2);
    const chosen = { col: immediateWin, score: 1000000 };
    if (typeof logDecision === "function") {
      const selectedWithNodes = {
        col: chosen.col,
        score: chosen.score,
        nodes: nodesExplored_reflex,
      };
      logDecision([chosen], selectedWithNodes, timeTaken, "Reflex (Agresif)");
    }
    return immediateWin;
  }

  // 2) Blokir kemenangan lawan jika ada
  const immediateBlock = findImmediateWinningMove(
    boardState,
    opponent,
    validMoves,
  );
  if (immediateBlock !== null) {
    const timeTaken = (performance.now() - startTime).toFixed(2);
    const chosen = { col: immediateBlock, score: 900000 };
    if (typeof logDecision === "function") {
      const selectedWithNodes = {
        col: chosen.col,
        score: chosen.score,
        nodes: nodesExplored_reflex,
      };
      logDecision([chosen], selectedWithNodes, timeTaken, "Reflex (Agresif)");
    }
    return immediateBlock;
  }

  for (let col of validMoves) {
    nodesExplored_reflex++; // 1 evaluasi = 1 node

    let r = getOpenRow(boardState, col);
    if (r === -1) continue;

    // Hitung skor berdasarkan heuristik "Attack"
    let score = evaluateReflex(boardState, r, col, playerColor);
    moves.push({ col: col, score: score });
  }

  // Sort by Score Descending, lalu dekat tengah, lalu kolom terkecil
  const centerCol = Math.floor(COLS / 2);
  moves.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const distA = Math.abs(a.col - centerCol);
    const distB = Math.abs(b.col - centerCol);
    if (distA !== distB) return distA - distB;
    return a.col - b.col;
  });

  const chosen = moves[0];

  const timeTaken = (performance.now() - startTime).toFixed(2);
  console.log(
    `[REFLEX AI] Move: Col ${chosen.col}, Score: ${chosen.score}, Decisions: ${nodesExplored_reflex}`,
  );

  // Log visual
  if (typeof logDecision === "function") {
    const selectedWithNodes = {
      col: chosen.col,
      score: chosen.score,
      nodes: nodesExplored_reflex,
    };
    logDecision(moves, selectedWithNodes, timeTaken, "Reflex (Agresif)");
  }

  return chosen.col;
}

function evaluateReflex(board, row, col, aiColor) {
  let score = 0;
  const oppColor = aiColor === "red" ? "yellow" : "red";
  if (row === -1) return -Infinity;

  // Board sementara untuk simulasi
  board[row][col] = aiColor;

  // 1. Menang Sekarang (Instinct)
  if (checkWinBoard(board, aiColor)) {
    board[row][col] = null;
    return 1000000;
  }

  // 2. Potensi Serangan (lebih agresif)
  const attackPotential = evaluateHeuristics(board, row, col, aiColor);
  score += attackPotential;

  // 3. Fork Bonus (ancaman ganda)
  const forkCount = countImmediateWins(board, aiColor);
  if (forkCount >= 2) score += 8000;

  // 4. Hindari memberi lawan kemenangan langsung
  const oppWinCount = countImmediateWins(board, oppColor);
  if (oppWinCount > 0) score -= 100000 * oppWinCount;

  // 5. Center Control
  const centerCol = Math.floor(COLS / 2);
  score += (centerCol - Math.abs(col - centerCol)) * 50;

  board[row][col] = null;

  return score;
}

// Helper Heuristik Sederhana (Hitung potensi baris)
function evaluateHeuristics(board, row, col, player) {
  let total = 0;
  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (let d of dirs) {
    // Cek berapa bidak segaris yang bisa dibentuk
    let count = 1;

    // Arah Positif
    let r = row + d[0],
      c = col + d[1];
    while (isValidPos(r, c) && board[r][c] === player) {
      count++;
      r += d[0];
      c += d[1];
    }
    let open1 =
      isValidPos(r, c) && board[r][c] === null && isPlayableCell(board, r, c);

    // Arah Negatif
    ((r = row - d[0]), (c = col - d[1]));
    while (isValidPos(r, c) && board[r][c] === player) {
      count++;
      r -= d[0];
      c -= d[1];
    }
    let open2 =
      isValidPos(r, c) && board[r][c] === null && isPlayableCell(board, r, c);

    // Poin
    if (count >= 4) total += 10000;
    else if (count === 3 && open1 && open2)
      total += 8000; // Ancaman 3 terbuka
    else if (count === 3 && (open1 || open2))
      total += 4000; // Ancaman 3
    else if (count === 2 && open1 && open2)
      total += 600; // Potensi 2 terbuka
    else if (count === 2 && (open1 || open2)) total += 200; // Potensi 2
  }
  return total;
}

function isValidPos(r, c) {
  return r >= 0 && r < ROWS && c >= 0 && c < COLS;
}

function isPlayableCell(board, r, c) {
  if (!isValidPos(r, c)) return false;
  if (board[r][c] !== null) return false;
  return r === ROWS - 1 || board[r + 1][c] !== null;
}

function findImmediateWinningMove(boardState, playerColor, validMoves) {
  const winningMoves = [];
  for (let col of validMoves) {
    nodesExplored_reflex++;
    const row = getOpenRow(boardState, col);
    if (row === -1) continue;
    boardState[row][col] = playerColor;
    const isWin = checkWinBoard(boardState, playerColor);
    boardState[row][col] = null;
    if (isWin) winningMoves.push(col);
  }
  if (winningMoves.length === 0) return null;
  return pickCenterMost(winningMoves);
}

function countImmediateWins(boardState, playerColor) {
  const validMoves = getValidLocations(boardState);
  let count = 0;
  for (let col of validMoves) {
    const row = getOpenRow(boardState, col);
    if (row === -1) continue;
    boardState[row][col] = playerColor;
    const isWin = checkWinBoard(boardState, playerColor);
    boardState[row][col] = null;
    if (isWin) count++;
  }
  return count;
}

function pickCenterMost(cols) {
  const centerCol = Math.floor(COLS / 2);
  return cols.slice().sort((a, b) => {
    const distA = Math.abs(a - centerCol);
    const distB = Math.abs(b - centerCol);
    if (distA !== distB) return distA - distB;
    return a - b;
  })[0];
}
