// game.js - Core Logic & UI Controller

const ROWS = 6;
const COLS = 7;
let board = [];
let currentPlayer = "red";
let gameMode = null; // 'ai', 'player', 'ai-vs-ai'
let aiStyle = "attack"; // UI selector state
let gameOver = false;
let isProcessing = false;
let logs = [];
let turnCount = 0;
let gameId = "";

// New Batch State
let isBatchRunning = false;
let batchTotal = 0;
let batchCurrent = 0;

// First Player Configuration
let firstPlayerMode = "random"; // 'random', 'red', 'yellow', 'alternate'
let alternateCounter = 0; // For alternate mode
let isExperimentMode = false; // Distinguish between watch and experiment
let autoPlayEnabled = false; // For watch mode auto-play

// Challenge Mode State
let isChallengeMode = false;
let challengeRound = 0; // 0, 1, 2 (3 rounds)
let challengeScores = { player: 0, computer: 0 }; // Win counter
let challengeHistory = []; // Track each round result

// Move Counter per Player (untuk riset)
let redMoveCount = 0;
let yellowMoveCount = 0;

// Human Thinking Time Tracker
let humanTurnStartTime = 0;
let humanThinkingTime = 0;

// --- GAME CONTROL ---

function startGame(mode) {
  console.log("Starting game mode:", mode);
  gameMode = mode;
  isExperimentMode = false; // Regular watch mode
  isChallengeMode = false; // Not challenge mode

  document.getElementById("modeSelection").style.display = "none";
  document.getElementById("gameArea").style.display = "block";
  document.getElementById("aiVsAiConfig").style.display = "none";
  document.getElementById("challengeHeader").style.display = "none";

  const showAiOpts = mode === "ai";
  document.getElementById("aiSelector").style.display = showAiOpts
    ? "block"
    : "none";

  // Show research panel for AI modes
  const showResearch = mode === "ai" || mode === "ai-vs-ai";
  document.getElementById("researchPanel").style.display = showResearch
    ? "flex"
    : "none";

  // Show appropriate controls
  if (mode === "ai-vs-ai") {
    // Watch mode - show watch controls
    document.getElementById("watchControls").style.display = "block";
    document.getElementById("batchControls").style.display = "none";
  } else if (mode === "ai") {
    // Player vs AI - hide both
    document.getElementById("watchControls").style.display = "none";
    document.getElementById("batchControls").style.display = "none";
  }

  // Sync Selector
  if (showAiOpts) {
    const selector = document.querySelector("#aiSelector select");
    if (selector) aiStyle = selector.value;
  }

  resetGame();
}

function startChallengeMode() {
  console.log("Starting Challenge Mode!");

  isChallengeMode = true;
  gameMode = "ai";
  challengeRound = 0;
  challengeScores = { player: 0, computer: 0 };
  challengeHistory = [];

  document.getElementById("modeSelection").style.display = "none";
  document.getElementById("gameArea").style.display = "block";
  document.getElementById("aiVsAiConfig").style.display = "none";
  document.getElementById("challengeHeader").style.display = "block";
  document.getElementById("aiSelector").style.display = "none";
  document.getElementById("researchPanel").style.display = "none";

  // Set Round 1 AI to Attack
  aiStyle = "attack";

  updateChallengeUI();
  resetGame();
}

function updateChallengeUI() {
  // Update scores
  document.getElementById("playerScore").textContent = challengeScores.player;
  document.getElementById("computerScore").textContent =
    challengeScores.computer;

  // Update round indicators
  for (let i = 1; i <= 3; i++) {
    const roundEl = document.getElementById(`round${i}`);
    if (roundEl) {
      roundEl.classList.remove("active", "completed");
      if (i === challengeRound + 1) {
        roundEl.classList.add("active");
      } else if (i < challengeRound + 1) {
        roundEl.classList.add("completed");
      }
    }
  }
}

function showAIvsAIConfig() {
  document.getElementById("modeSelection").style.display = "none";
  document.getElementById("aiVsAiConfig").style.display = "block";
  updateEstimatedTime();
}

function startAIvsAIExperiment() {
  const batchSize = parseInt(document.getElementById("batchSizeInput").value);

  if (isNaN(batchSize) || batchSize < 1) {
    alert("⚠️ Masukkan jumlah game yang valid (minimal 1)");
    return;
  }

  if (batchSize > 200) {
    const confirm = window.confirm(
      `🎮 Anda akan memainkan ${batchSize} game AI vs AI.\n\nIni akan memakan waktu ~${Math.ceil((batchSize * 2.5) / 60)} menit.\n\nLanjutkan?`,
    );
    if (!confirm) return;
  }

  // Set experiment mode
  isExperimentMode = true;
  gameMode = "ai-vs-ai";

  // Hide config, show game
  document.getElementById("aiVsAiConfig").style.display = "none";
  document.getElementById("gameArea").style.display = "block";
  document.getElementById("researchPanel").style.display = "flex";

  // Show batch controls, hide watch controls
  document.getElementById("batchControls").style.display = "block";
  document.getElementById("watchControls").style.display = "none";

  // Start batch
  startBatchRun(batchSize);
}

function toggleAutoPlay() {
  autoPlayEnabled = !autoPlayEnabled;
  const btn = document.getElementById("autoPlayBtn");

  if (autoPlayEnabled) {
    btn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
    btn.style.background = "#ef4444";

    // If game is over, start new game
    if (gameOver) {
      resetGame();
    }
  } else {
    btn.innerHTML = '<i class="fa-solid fa-play"></i> Auto';
    btn.style.background = "#f59e0b";
  }
}

function setBatchSize(size) {
  document.getElementById("batchSizeInput").value = size;

  // Update active button
  document.querySelectorAll(".quick-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");

  updateEstimatedTime();
}

function updateEstimatedTime() {
  const batchSize =
    parseInt(document.getElementById("batchSizeInput").value) || 50;
  const secondsPerGame = 2.5; // Average
  const totalSeconds = batchSize * secondsPerGame;

  let timeText;
  if (totalSeconds < 60) {
    timeText = `~${Math.ceil(totalSeconds)} detik`;
  } else {
    const minutes = Math.ceil(totalSeconds / 60);
    timeText = `~${minutes} menit`;
  }

  const timeEl = document.getElementById("estimatedTime");
  if (timeEl) timeEl.textContent = timeText;
}

function updateFirstPlayerMode(mode) {
  firstPlayerMode = mode;
  console.log(`[CONFIG] First player mode set to: ${mode}`);

  // Reset alternate counter when changing mode
  if (mode === "alternate") {
    alternateCounter = 0;
  }

  // Update visual feedback
  document.querySelectorAll(".config-option").forEach((opt) => {
    opt.classList.remove("selected");
  });
  const selected = document.querySelector(
    `.config-option[data-mode="${mode}"]`,
  );
  if (selected) selected.classList.add("selected");
}

function backToMenu() {
  document.getElementById("modeSelection").style.display = "flex";
  document.getElementById("gameArea").style.display = "none";
  document.getElementById("researchPanel").style.display = "none";
  document.getElementById("aiVsAiConfig").style.display = "none";
  closeModal();
}

function resetGame() {
  board = Array(ROWS)
    .fill(null)
    .map(() => Array(COLS).fill(null));

  // DETERMINE FIRST PLAYER berdasarkan mode
  if (gameMode === "ai-vs-ai") {
    if (isExperimentMode) {
      // Experiment mode - use configured first player mode
      switch (firstPlayerMode) {
        case "random":
          currentPlayer = Math.random() < 0.5 ? "red" : "yellow";
          console.log(`[RANDOM] First player: ${currentPlayer.toUpperCase()}`);
          break;
        case "red":
          currentPlayer = "red";
          console.log(`[FIXED] First player: RED (Reflex)`);
          break;
        case "yellow":
          currentPlayer = "yellow";
          console.log(`[FIXED] First player: YELLOW (Minimax)`);
          break;
        case "alternate":
          currentPlayer = alternateCounter % 2 === 0 ? "red" : "yellow";
          console.log(
            `[ALTERNATE] Game #${alternateCounter + 1}, First player: ${currentPlayer.toUpperCase()}`,
          );
          alternateCounter++;
          break;
        default:
          currentPlayer = "red";
      }
    } else {
      // Watch mode - always random for fairness
      currentPlayer = Math.random() < 0.5 ? "red" : "yellow";
      console.log(`[WATCH MODE] First player: ${currentPlayer.toUpperCase()}`);
    }
  } else {
    currentPlayer = "red"; // Default untuk mode lain
  }

  gameOver = false;
  isProcessing = false;
  turnCount = 0;
  redMoveCount = 0;
  yellowMoveCount = 0;
  humanTurnStartTime = 0;
  humanThinkingTime = 0;
  gameId =
    Date.now().toString() + "_" + Math.random().toString(36).substr(2, 9);

  closeModal();
  renderBoard();
  updateTurnDisplay();

  // Start human timer if Human vs AI and human goes first
  if (gameMode === "ai" && currentPlayer === "red") {
    humanTurnStartTime = performance.now();
  }

  if (gameMode === "ai-vs-ai") {
    const delay = isBatchRunning ? 100 : 1000; // Faster in batch mode
    setTimeout(triggerAI, delay);
  }
}

function runCustomBatch() {
  const input = document.getElementById("batchInput");
  const val = parseInt(input ? input.value : 50);

  if (isNaN(val) || val < 1) {
    alert("⚠️ Masukkan jumlah game yang valid (minimal 1)");
    return;
  }

  if (val > 100) {
    const confirm = window.confirm(
      `🎮 Anda akan memainkan ${val} game AI vs AI.\n\nIni akan memakan waktu ~${Math.ceil((val * 2) / 60)} menit.\n\nLanjutkan?`,
    );
    if (!confirm) return;
  }

  startBatchRun(val);
}

function startBatchRun(n) {
  const count = parseInt(n);
  if (isNaN(count) || count < 1) return;

  console.log(`[BATCH] Memulai batch run: ${count} game`);
  console.log(`[BATCH] First player mode: ${firstPlayerMode}`);

  isBatchRunning = true;
  batchTotal = count;
  batchCurrent = 0;

  // Reset alternate counter untuk batch baru
  if (firstPlayerMode === "alternate") {
    alternateCounter = 0;
  }

  clearLogs();

  // Update UI indicator
  const logHeader = document.querySelector("#researchPanel h3");
  if (logHeader)
    logHeader.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Memainkan Game: 0/${count}`;

  if (gameMode !== "ai-vs-ai") {
    startGame("ai-vs-ai");
  } else {
    resetGame();
  }
}

function clearLogs() {
  logs = [];
  document.getElementById("logContent").innerHTML =
    '<div style="text-align:center; color: #999; margin-top: 50px;">Log data keputusan AI<br>akan muncul di sini...</div>';
}

function closeModal() {
  document.getElementById("winOverlay").classList.remove("active");
}

function updateAIStyle(style) {
  aiStyle = style;
  resetGame();
}

function updateTurnDisplay() {
  const badge = document.getElementById("turnIndicator");
  const dot = badge.querySelector(".player-dot");
  const text = document.getElementById("turnText");

  if (currentPlayer === "red") {
    dot.style.background = "var(--red-piece)";
    if (gameMode === "ai") text.innerText = "Giliran Anda";
    else if (gameMode === "ai-vs-ai") text.innerText = "AI Reflex (Merah)";
    else text.innerText = "Pemain Merah";
  } else {
    dot.style.background = "var(--yellow-piece)";
    if (gameMode === "ai") text.innerText = "AI Berpikir...";
    else if (gameMode === "ai-vs-ai") text.innerText = "AI Defend (Kuning)";
    else text.innerText = "Pemain Kuning";
  }
}

// --- BOARD RENDER ---

function renderBoard() {
  const boardEl = document.getElementById("board");
  boardEl.innerHTML = "";

  for (let c = 0; c < COLS; c++) {
    const colDiv = document.createElement("div");
    colDiv.style.display = "inline-block";
    colDiv.onclick = () => handleColumnClick(c);

    for (let r = 0; r < ROWS; r++) {
      const cellWrapper = document.createElement("div");
      cellWrapper.className = "cell-wrapper";
      cellWrapper.id = `cell-${r}-${c}`;

      const bg = document.createElement("div");
      bg.className = "cell-bg";
      const mask = document.createElement("div");
      mask.className = "cell-mask";

      cellWrapper.appendChild(bg);
      cellWrapper.appendChild(mask);
      colDiv.appendChild(cellWrapper);
    }
    boardEl.appendChild(colDiv);
  }
}

// --- LOGIC ---

function handleColumnClick(col) {
  if (gameOver || isProcessing) return;

  // Lock input if AI is thinking
  if (gameMode === "ai" && currentPlayer === "yellow") return;
  if (gameMode === "ai-vs-ai") return;

  // Calculate human thinking time
  if (humanTurnStartTime > 0) {
    humanThinkingTime = performance.now() - humanTurnStartTime;
  }

  dropPiece(col, true); // true = human move
}

function dropPiece(col, isHumanMove = false) {
  if (gameOver) return;

  let row = getOpenRow(board, col);
  if (row === -1) return;

  // Log human move if in Player vs AI mode
  if (isHumanMove && gameMode === "ai") {
    logHumanDecision(col, humanThinkingTime);
  }

  isProcessing = true;
  board[row][col] = currentPlayer;
  turnCount++;

  // Track moves per player
  if (currentPlayer === "red") {
    redMoveCount++;
  } else {
    yellowMoveCount++;
  }

  // Animation
  const cell = document.getElementById(`cell-${row}-${col}`);
  const piece = document.createElement("div");
  piece.className = `piece ${currentPlayer}`;
  cell.appendChild(piece);
  requestAnimationFrame(() => piece.classList.add("dropped"));

  const animDelay = isBatchRunning ? 50 : 600;

  setTimeout(() => {
    if (checkWinBoard(board, currentPlayer)) {
      gameOver = true;
      if (!isBatchRunning) piece.classList.add("winning");
      showWinModal(currentPlayer);
      isProcessing = false;
    } else if (checkDraw()) {
      gameOver = true;
      showDrawModal();
      isProcessing = false;
    } else {
      currentPlayer = currentPlayer === "red" ? "yellow" : "red";
      updateTurnDisplay();
      isProcessing = false;

      // Start human thinking timer if it's human's turn
      if (gameMode === "ai" && currentPlayer === "red") {
        humanTurnStartTime = performance.now();
      }

      // Trigger AI Check
      const isAiTurn =
        (gameMode === "ai" && currentPlayer === "yellow") ||
        gameMode === "ai-vs-ai";
      if (isAiTurn && !gameOver) {
        const turnDelay = isBatchRunning ? 10 : 500;
        setTimeout(triggerAI, turnDelay);
      }
    }
  }, animDelay);
}

function triggerAI() {
  if (gameOver) return;
  try {
    let move = -1;

    if (gameMode === "ai-vs-ai") {
      // Configuration:
      // RED = Reflex (Agresif)
      // YELLOW = Defend (Minimax)
      if (currentPlayer === "red") {
        move = getReflexMove(board, "red");
      } else {
        move = getDefendMove(board, "yellow");
      }
    } else if (gameMode === "ai") {
      // Player vs AI (AI is Yellow)
      // Use Selector to decide logic
      if (aiStyle === "attack") {
        move = getReflexMove(board, "yellow");
      } else {
        move = getDefendMove(board, "yellow");
      }
    }

    if (move !== -1) dropPiece(move);
  } catch (e) {
    console.error("AI Error:", e);
    isProcessing = false;
  }
}

// --- UTILS ---

function getOpenRow(b, c) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (b[r][c] === null) return r;
  }
  return -1;
}

function getValidLocations(b) {
  const locations = [];
  for (let c = 0; c < COLS; c++) {
    if (b[0][c] === null) locations.push(c);
  }
  return locations;
}

function checkWinBoard(b, p) {
  // Horizontal
  for (let c = 0; c < COLS - 3; c++) {
    for (let r = 0; r < ROWS; r++) {
      if (
        b[r][c] == p &&
        b[r][c + 1] == p &&
        b[r][c + 2] == p &&
        b[r][c + 3] == p
      )
        return true;
    }
  }
  // Vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      if (
        b[r][c] == p &&
        b[r + 1][c] == p &&
        b[r + 2][c] == p &&
        b[r + 3][c] == p
      )
        return true;
    }
  }
  // Pos Slope
  for (let c = 0; c < COLS - 3; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      if (
        b[r][c] == p &&
        b[r + 1][c + 1] == p &&
        b[r + 2][c + 2] == p &&
        b[r + 3][c + 3] == p
      )
        return true;
    }
  }
  // Neg Slope
  for (let c = 0; c < COLS - 3; c++) {
    for (let r = 3; r < ROWS; r++) {
      if (
        b[r][c] == p &&
        b[r - 1][c + 1] == p &&
        b[r - 2][c + 2] == p &&
        b[r - 3][c + 3] == p
      )
        return true;
    }
  }
  return false;
}

function checkDraw() {
  return board[0].every((cells) => cells !== null);
}

// --- UI HELPERS ---

function showWinModal(winner) {
  if (gameMode === "ai" || gameMode === "ai-vs-ai") saveAllLogs(winner);

  if (isBatchRunning) {
    batchCurrent++;
    console.log(
      `[BATCH] Game ${batchCurrent}/${batchTotal} selesai (Winner: ${winner})`,
    );
    updateBatchUI();

    if (batchCurrent < batchTotal) {
      setTimeout(resetGame, 50);
      return;
    } else {
      isBatchRunning = false;
      console.log(`[BATCH] Semua ${batchTotal} game selesai!`);

      // Tunggu sebentar untuk memastikan semua data tersimpan
      setTimeout(() => {
        showBatchSummary();
      }, 300);
      return;
    }
  }

  // CHALLENGE MODE LOGIC
  if (isChallengeMode) {
    handleChallengeRoundEnd(winner);
    return;
  }

  // Watch mode with auto-play
  if (gameMode === "ai-vs-ai" && autoPlayEnabled && !isExperimentMode) {
    console.log(
      `[AUTO-PLAY] Game selesai (Winner: ${winner}), mulai game baru...`,
    );
    setTimeout(resetGame, 2000); // Wait 2 seconds before next game
    return;
  }

  const modal = document.getElementById("winOverlay");
  const msg = document.getElementById("winMessage");
  const iconEl = document.getElementById("winIcon");

  modal.classList.add("active");

  if (gameMode === "ai") {
    if (winner === "red") {
      iconEl.innerHTML = '<i class="fa-solid fa-trophy"></i>';
      msg.innerText = "Anda Menang!";
      msg.style.color = "var(--primary)";
    } else {
      iconEl.innerHTML = '<i class="fa-solid fa-robot"></i>';
      msg.innerText = "Komputer Menang!";
      msg.style.color = "var(--red-piece)";
    }
  } else if (gameMode === "ai-vs-ai") {
    iconEl.innerHTML = '<i class="fa-solid fa-robot"></i>';
    msg.innerText =
      winner === "red"
        ? "AI Reflex (Merah) Menang!"
        : "AI Defend (Kuning) Menang!";
  } else {
    iconEl.innerHTML = '<i class="fa-solid fa-trophy"></i>';
    msg.innerText = winner === "red" ? "Merah Menang!" : "Kuning Menang!";
  }
}

function handleChallengeRoundEnd(winner) {
  // Update scores
  if (winner === "red") {
    challengeScores.player++;
  } else {
    challengeScores.computer++;
  }

  challengeHistory.push({
    round: challengeRound + 1,
    winner: winner === "red" ? "player" : "computer",
    algorithm: aiStyle,
  });

  console.log(
    `[CHALLENGE] Round ${challengeRound + 1} selesai. Winner: ${winner}`,
  );
  console.log(
    `[CHALLENGE] Score: Player ${challengeScores.player} - ${challengeScores.computer} Computer`,
  );

  // Check if someone won (2 wins)
  if (challengeScores.player >= 2 || challengeScores.computer >= 2) {
    showChallengeEndModal();
    return;
  }

  // Move to next round
  challengeRound++;

  // Set AI for next round (Round 2 & 3 = Defend)
  if (challengeRound >= 1) {
    aiStyle = "defend";
  }

  // Show round end modal
  showChallengeRoundModal(winner);
}

function updateBatchUI() {
  const logHeader = document.querySelector("#researchPanel h3");
  if (logHeader) {
    const percentage = Math.round((batchCurrent / batchTotal) * 100);
    logHeader.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Memainkan Game: ${batchCurrent}/${batchTotal} (${percentage}%)`;
  }
}

function showDrawModal() {
  if (gameMode === "ai" || gameMode === "ai-vs-ai") saveAllLogs("draw");

  if (isBatchRunning) {
    batchCurrent++;
    updateBatchUI();
    if (batchCurrent < batchTotal) {
      setTimeout(resetGame, 50);
      return;
    } else {
      isBatchRunning = false;
      showBatchSummary();
      return;
    }
  }

  // CHALLENGE MODE - Draw = replay round
  if (isChallengeMode) {
    const modal = document.getElementById("winOverlay");
    const msg = document.getElementById("winMessage");
    const iconEl = document.getElementById("winIcon");

    modal.classList.add("active");
    iconEl.innerHTML = '<i class="fa-solid fa-handshake"></i>';
    msg.innerHTML = `
      <div style="margin-bottom:20px;">Seri! Round ${challengeRound + 1} diulang</div>
      <button class="control-btn btn-primary" onclick="closeModal(); resetGame();" style="padding:12px 24px;">
        <i class="fa-solid fa-rotate-right"></i> Main Lagi
      </button>
    `;
    return;
  }

  // Watch mode with auto-play
  if (gameMode === "ai-vs-ai" && autoPlayEnabled && !isExperimentMode) {
    console.log(`[AUTO-PLAY] Game seri, mulai game baru...`);
    setTimeout(resetGame, 2000);
    return;
  }

  document.getElementById("winOverlay").classList.add("active");
  document.getElementById("winIcon").innerHTML =
    '<i class="fa-solid fa-handshake"></i>';
  document.getElementById("winMessage").innerText = "Seri!";
}

function showChallengeRoundModal(winner) {
  const modal = document.getElementById("winOverlay");
  const msg = document.getElementById("winMessage");
  const iconEl = document.getElementById("winIcon");

  modal.classList.add("active");

  const winnerText = winner === "red" ? "Anda" : "Komputer";
  const nextRound = challengeRound + 1;
  const nextAlgo = aiStyle === "attack" ? "Serang" : "Defend";

  iconEl.innerHTML =
    winner === "red"
      ? '<i class="fa-solid fa-trophy" style="color:#10b981;"></i>'
      : '<i class="fa-solid fa-robot" style="color:#ef4444;"></i>';

  msg.innerHTML = `
    <div style="font-size:1.5rem; font-weight:700; margin-bottom:15px;">
      Round ${challengeRound} Selesai!
    </div>
    <div style="font-size:1.2rem; margin-bottom:20px;">
      ${winnerText} Menang!
    </div>
    <div style="background:#f8fafc; padding:15px; border-radius:12px; margin-bottom:20px;">
      <div style="font-size:2rem; font-weight:800; color:#2b2d42;">
        ${challengeScores.player} - ${challengeScores.computer}
      </div>
      <div style="font-size:0.9rem; color:#666;">Anda vs Komputer</div>
    </div>
    <div style="background:#fff4e1; padding:12px; border-radius:8px; margin-bottom:20px; font-size:0.9rem;">
      <strong>Round ${nextRound}:</strong> Lawan AI ${nextAlgo} 🛡️
    </div>
    <button class="control-btn btn-primary" onclick="closeModal(); updateChallengeUI(); resetGame();" style="padding:12px 24px;">
      <i class="fa-solid fa-arrow-right"></i> Lanjut ke Round ${nextRound}
    </button>
  `;
}

function showChallengeEndModal() {
  const modal = document.getElementById("winOverlay");
  const msg = document.getElementById("winMessage");
  const iconEl = document.getElementById("winIcon");

  modal.classList.add("active");

  const playerWon = challengeScores.player >= 2;

  if (playerWon) {
    iconEl.innerHTML =
      '<i class="fa-solid fa-trophy" style="color:#fbbf24; font-size:4rem;"></i>';
    msg.innerHTML = `
      <div style="font-size:2rem; font-weight:800; margin-bottom:15px; color:#10b981;">
        🎉 SELAMAT! 🎉
      </div>
      <div style="font-size:1.3rem; margin-bottom:20px;">
        Anda Menang Challenge!
      </div>
      <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding:20px; border-radius:12px; margin-bottom:20px; color:white;">
        <div style="font-size:3rem; margin-bottom:10px;">🍫</div>
        <div style="font-size:1.2rem; font-weight:700;">Anda Dapat Coklat!</div>
      </div>
      <div style="background:#f8fafc; padding:15px; border-radius:12px; margin-bottom:20px;">
        <div style="font-size:0.9rem; color:#666; margin-bottom:10px;">Hasil Akhir:</div>
        <div style="font-size:2rem; font-weight:800; color:#2b2d42;">
          ${challengeScores.player} - ${challengeScores.computer}
        </div>
      </div>
      <div class="control-btns" style="justify-content:center;">
        <button class="control-btn btn-primary" onclick="closeModal(); startChallengeMode();" style="padding:12px 24px;">
          <i class="fa-solid fa-rotate-right"></i> Main Lagi
        </button>
        <button class="control-btn btn-secondary" onclick="closeModal(); backToMenu();" style="padding:12px 24px;">
          <i class="fa-solid fa-house"></i> Menu
        </button>
      </div>
    `;
  } else {
    iconEl.innerHTML =
      '<i class="fa-solid fa-robot" style="color:#ef4444; font-size:4rem;"></i>';
    msg.innerHTML = `
      <div style="font-size:2rem; font-weight:800; margin-bottom:15px; color:#ef4444;">
        Komputer Menang!
      </div>
      <div style="font-size:1.1rem; margin-bottom:20px; color:#666;">
        Jangan menyerah! Coba lagi!
      </div>
      <div style="background:#f8fafc; padding:15px; border-radius:12px; margin-bottom:20px;">
        <div style="font-size:0.9rem; color:#666; margin-bottom:10px;">Hasil Akhir:</div>
        <div style="font-size:2rem; font-weight:800; color:#2b2d42;">
          ${challengeScores.player} - ${challengeScores.computer}
        </div>
      </div>
      <div class="control-btns" style="justify-content:center;">
        <button class="control-btn btn-primary" onclick="closeModal(); startChallengeMode();" style="padding:12px 24px;">
          <i class="fa-solid fa-rotate-right"></i> Coba Lagi
        </button>
        <button class="control-btn btn-secondary" onclick="closeModal(); backToMenu();" style="padding:12px 24px;">
          <i class="fa-solid fa-house"></i> Menu
        </button>
      </div>
    `;
  }
}

function showBatchSummary() {
  const modal = document.getElementById("winOverlay");
  const msg = document.getElementById("winMessage");
  const iconEl = document.getElementById("winIcon");

  // Calculate Stats from logs
  const results = { red: 0, yellow: 0, draw: 0 };
  const processedGames = new Set();

  logs.forEach((l) => {
    if (!processedGames.has(l.game_id) && l.game_result) {
      processedGames.add(l.game_id);
      if (l.game_result === "red") results.red++;
      else if (l.game_result === "yellow") results.yellow++;
      else results.draw++;
    }
  });

  const totalGames = processedGames.size;
  const totalMoves = logs.length;

  iconEl.innerHTML =
    '<i class="fa-solid fa-flag-checkered" style="color: var(--primary);"></i>';
  msg.innerHTML = `
        <div style="text-align:left; background:#f8fafc; padding:20px; border-radius:12px; margin:20px 0;">
            <h3 style="color:var(--primary); margin-bottom:15px; text-align:center;">
                <i class="fa-solid fa-check-circle"></i> BATCH TEST SELESAI!
            </h3>
            <div style="display:grid; gap:10px; font-size:0.95rem;">
                <div style="display:flex; justify-content:space-between; padding:8px; background:white; border-radius:6px;">
                    <span><i class="fa-solid fa-gamepad"></i> Total Game:</span>
                    <strong>${totalGames} game</strong>
                </div>
                <div style="display:flex; justify-content:space-between; padding:8px; background:white; border-radius:6px;">
                    <span><i class="fa-solid fa-chess"></i> Total Langkah:</span>
                    <strong>${totalMoves} moves</strong>
                </div>
                <div style="height:1px; background:#e2e8f0; margin:5px 0;"></div>
                <div style="display:flex; justify-content:space-between; padding:8px; background:#fee2e2; border-radius:6px;">
                    <span>🔴 Reflex (Merah) Menang:</span>
                    <strong>${results.red} kali (${((results.red / totalGames) * 100).toFixed(1)}%)</strong>
                </div>
                <div style="display:flex; justify-content:space-between; padding:8px; background:#fef9c3; border-radius:6px;">
                    <span>🟡 Minimax (Kuning) Menang:</span>
                    <strong>${results.yellow} kali (${((results.yellow / totalGames) * 100).toFixed(1)}%)</strong>
                </div>
                ${
                  results.draw > 0
                    ? `<div style="display:flex; justify-content:space-between; padding:8px; background:#f1f5f9; border-radius:6px;">
                    <span>🤝 Seri:</span>
                    <strong>${results.draw} kali</strong>
                </div>`
                    : ""
                }
            </div>
        </div>
        <div style="background:#dcfce7; padding:15px; border-radius:8px; border:2px solid #22c55e; margin-top:10px;">
            <p style="color:#15803d; font-weight:700; font-size:1.1rem; margin:0; text-align:center;">
                <i class="fa-solid fa-download"></i> Sekarang klik tombol "Data" atau "JSON" di bawah untuk download!
            </p>
        </div>
    `;

  // Pastikan modal muncul
  modal.classList.add("active");

  // Play alert sound (browser default)
  try {
    // Create short beep sound
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5,
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.log("Audio notification not available");
  }

  console.log("[BATCH] Summary modal displayed!");

  // Update header too
  const logHeader = document.querySelector("#researchPanel h3");
  if (logHeader)
    logHeader.innerHTML = `<i class="fa-solid fa-check-circle"></i> Selesai - ${batchTotal} Game Dimainkan`;
}

function logDecision(moves, selected, timeTaken, modeName) {
  const logPanel = document.getElementById("logContent");
  const entryId = logs.length + 1;

  // Determine current player from mode
  const player = modeName && modeName.includes("Reflex") ? "red" : "yellow";

  const logData = {
    game_id: gameId,
    log_id: entryId,
    global_turn: turnCount,
    player: player,
    mode: modeName || aiStyle,
    thinking_time_ms: parseFloat(timeTaken),
    nodes_explored: selected.nodes || 0,
    chosen_col: selected.col,
    score: selected.score,
    red_moves_so_far: redMoveCount,
    yellow_moves_so_far: yellowMoveCount,
    board_state: JSON.parse(JSON.stringify(board)),
    first_player: null, // Will be set by saveAllLogs
    first_player_mode: firstPlayerMode, // Track mode yang digunakan
  };

  logs.push(logData);

  if (logPanel && logPanel.innerText.includes("Log data"))
    logPanel.innerHTML = "";

  if (logPanel) {
    const div = document.createElement("div");
    div.className = "log-entry";
    if (selected.score > 2000) div.classList.add("high-score");

    div.innerHTML = `
                <strong>#${entryId} [${modeName || aiStyle}]</strong>
                <span style="float:right; font-size:0.8em; color:#666;">
                    <i class="fa-solid fa-code-branch"></i> ${selected.nodes || 0}
                    <i class="fa-regular fa-clock" style="margin-left:5px;"></i> ${timeTaken}ms
                </span><br>
                Move: Col ${selected.col + 1} (Score: ${selected.score})
            `;
    logPanel.prepend(div);
  }
}

function saveAllLogs(result) {
  if (logs.length === 0) return;

  // Dapatkan first player dari game ini
  const firstLog = logs.find(
    (l) => l.game_id === gameId && l.global_turn === 1,
  );
  const firstPlayer = firstLog
    ? firstLog.mode.includes("Reflex")
      ? "red"
      : firstLog.mode === "Human"
        ? "red"
        : "yellow"
    : "red";

  // Final move counts for this game
  const finalRedMoves = redMoveCount;
  const finalYellowMoves = yellowMoveCount;
  const totalMoves = finalRedMoves + finalYellowMoves;

  logs.forEach((l) => {
    if (l.game_id === gameId) {
      l.game_result = result;
      l.first_player = firstPlayer; // Track siapa yang jalan duluan
      l.red_total_moves = finalRedMoves;
      l.yellow_total_moves = finalYellowMoves;
      l.total_moves = totalMoves;
    }
  });

  console.log(
    `[GAME STATS] Red: ${finalRedMoves} moves, Yellow: ${finalYellowMoves} moves, Total: ${totalMoves}, Winner: ${result}`,
  );
}

function logHumanDecision(col, thinkingTime) {
  const logPanel = document.getElementById("logContent");
  const entryId = logs.length + 1;
  const timeTaken = thinkingTime > 0 ? thinkingTime.toFixed(2) : "0.00";

  const logData = {
    game_id: gameId,
    log_id: entryId,
    global_turn: turnCount + 1, // Will be incremented after
    player: "red",
    mode: "Human",
    thinking_time_ms: parseFloat(timeTaken),
    nodes_explored: 0, // Human doesn't explore nodes
    chosen_col: col,
    score: null, // Human doesn't have score
    red_moves_so_far: redMoveCount + 1,
    yellow_moves_so_far: yellowMoveCount,
    board_state: JSON.parse(JSON.stringify(board)),
    first_player: null,
    first_player_mode: firstPlayerMode,
  };

  logs.push(logData);

  console.log(`[HUMAN] Move: Col ${col + 1}, Thinking Time: ${timeTaken}ms`);

  if (logPanel && logPanel.innerText.includes("Log data"))
    logPanel.innerHTML = "";

  if (logPanel) {
    const div = document.createElement("div");
    div.className = "log-entry human-entry";

    div.innerHTML = `
                <strong>#${entryId} [Human]</strong>
                <span style="float:right; font-size:0.8em; color:#666;">
                    <i class="fa-regular fa-clock"></i> ${timeTaken}ms
                </span><br>
                Move: Col ${col + 1}
            `;
    logPanel.prepend(div);
  }

  // Reset timer for next turn
  humanTurnStartTime = 0;
}

function downloadLogs() {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(logs, null, 2));
  const anchor = document.createElement("a");
  anchor.href = dataStr;
  anchor.download = "connect_four_logs.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
