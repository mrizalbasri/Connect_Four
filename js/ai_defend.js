// ai_defend.js - AI "Defend" (Bertahan & Mikir)
// Menggunakan Minimax Algorithm dengan Alpha-Beta Pruning

const SEARCH_DEPTH = 4; // Kedalaman berpikir (4 langkah ke depan)
let nodesExplored_defend = 0; // Global counter untuk statistik riset

function getDefendMove(boardState, playerColor) {
  const startTime = performance.now();
  nodesExplored_defend = 0; // Reset counter

  // Jalankan Minimax
  // playerColor adalah Maximizing Player di tree ini
  const result = minimax(
    boardState,
    SEARCH_DEPTH,
    -Infinity,
    Infinity,
    true,
    playerColor,
  );

  const timeTaken = (performance.now() - startTime).toFixed(2);
  console.log(
    `[DEFEND AI] Move: Col ${result.column}, Score: ${result.score}, Time: ${timeTaken}ms, Nodes: ${nodesExplored_defend}`,
  );

  // Log visual
  if (typeof logDecision === "function") {
    const selectedWithNodes = {
      col: result.column,
      score: result.score,
      nodes: nodesExplored_defend,
    };
    logDecision([], selectedWithNodes, timeTaken, "Defend (Minimax)");
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
  const opponent = myself === "red" ? "yellow" : "red";

  // Terminal Node Checks
  if (checkWinBoard(boardState, myself))
    return { score: 1000000 + depth, column: null };
  if (checkWinBoard(boardState, opponent))
    return { score: -1000000 - depth, column: null };
  if (validLocations.length === 0) return { score: 0, column: null };
  if (depth === 0) {
    return { score: scoreBoard(boardState, myself), column: null };
  }

  // MOVE ORDERING: Menang langsung -> blokir -> dekat tengah
  const orderedCols = orderMoves(
    boardState,
    validLocations,
    maximizingPlayer ? myself : opponent,
    maximizingPlayer ? opponent : myself,
  );

  if (maximizingPlayer) {
    let value = -Infinity;
    let column = orderedCols[0]; // Start with center

    for (let col of orderedCols) {
      const row = getOpenRow(boardState, col);
      if (row === -1) continue;
      boardState[row][col] = myself;
      const newScore = minimax(
        boardState,
        depth - 1,
        alpha,
        beta,
        false,
        myself,
      ).score;
      boardState[row][col] = null;

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
      if (row === -1) continue;
      boardState[row][col] = opponent;
      const newScore = minimax(
        boardState,
        depth - 1,
        alpha,
        beta,
        true,
        myself,
      ).score;
      boardState[row][col] = null;

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
  const oppPiece = piece === "red" ? "yellow" : "red";
  const centerCol = Math.floor(COLS / 2);

  // Center Preference (turunkan dari 10 ke 4)
  for (let r = 0; r < ROWS; r++) {
    if (b[r][centerCol] === piece) score += 8; // Center column
    if (b[r][centerCol - 1] === piece || b[r][centerCol + 1] === piece)
      score += 4; // Near center
  }

  // Evaluasi Windows: Horizontal, Vertical, Diagonal

  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < 4; c++) {
      score += evaluateWindow(
        [b[r][c], b[r][c + 1], b[r][c + 2], b[r][c + 3]],
        piece,
        oppPiece,
      );
    }
  }
  // Vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < 3; r++) {
      score += evaluateWindow(
        [b[r][c], b[r + 1][c], b[r + 2][c], b[r + 3][c]],
        piece,
        oppPiece,
      );
    }
  }
  // Diagonal Positif
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      score += evaluateWindow(
        [b[r][c], b[r + 1][c + 1], b[r + 2][c + 2], b[r + 3][c + 3]],
        piece,
        oppPiece,
      );
    }
  }
  // Diagonal Negatif
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      score += evaluateWindow(
        [b[r + 3][c], b[r + 2][c + 1], b[r + 1][c + 2], b[r][c + 3]],
        piece,
        oppPiece,
      );
    }
  }

  return score;
}

function evaluateWindow(window, piece, oppPiece) {
  let score = 0;
  let countPiece = window.filter((x) => x === piece).length;
  let countEmpty = window.filter((x) => x === null).length;
  let countOpp = window.filter((x) => x === oppPiece).length;

  // DEFENSIF: Lebih tegas terhadap ancaman lawan
  if (countOpp === 3 && countEmpty === 1) score -= 200;
  else if (countOpp === 2 && countEmpty === 2) score -= 40;

  // OFENSIF: Lebih agresif untuk peluang menang
  if (countPiece === 4)
    score += 1000; // Tidak akan tercapai (terminal)
  else if (countPiece === 3 && countEmpty === 1) score += 80;
  else if (countPiece === 2 && countEmpty === 2) score += 15;

  return score;
}

function orderMoves(boardState, validLocations, currentPlayer, opponent) {
  const winMoves = [];
  const blockMoves = [];
  const otherMoves = [];
  const centerCol = Math.floor(COLS / 2);

  for (let col of validLocations) {
    const row = getOpenRow(boardState, col);
    if (row === -1) continue;

    boardState[row][col] = currentPlayer;
    const isWin = checkWinBoard(boardState, currentPlayer);
    boardState[row][col] = null;
    if (isWin) {
      winMoves.push(col);
      continue;
    }

    boardState[row][col] = opponent;
    const isBlock = checkWinBoard(boardState, opponent);
    boardState[row][col] = null;
    if (isBlock) {
      blockMoves.push(col);
      continue;
    }

    otherMoves.push(col);
  }

  otherMoves.sort((a, b) => {
    const distA = Math.abs(a - centerCol);
    const distB = Math.abs(b - centerCol);
    if (distA !== distB) return distA - distB;
    return a - b;
  });

  return [...winMoves, ...blockMoves, ...otherMoves];
}
