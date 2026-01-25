// game.js - Core Logic & UI Controller

const ROWS = 6;
const COLS = 7;
let board = [];
let currentPlayer = 'red';
let gameMode = null; // 'ai', 'player', 'ai-vs-ai'
let aiStyle = 'attack'; // UI selector state
let gameOver = false;
let isProcessing = false;
let logs = [];
let turnCount = 0;
let gameId = '';

// --- GAME CONTROL ---

function startGame(mode) {
    console.log("Starting game mode:", mode);
    gameMode = mode;
    document.getElementById('modeSelection').style.display = 'none';
    document.getElementById('gameArea').style.display = 'block';
    
    const showAiOpts = (mode === 'ai'); // Hidden for AI vs AI (auto configured)
    document.getElementById('aiSelector').style.display = showAiOpts ? 'block' : 'none';
    
    // Sync Selector
    if (showAiOpts) {
        const selector = document.querySelector('#aiSelector select');
        if (selector) aiStyle = selector.value;
    }

    document.getElementById('researchPanel').style.display = (mode === 'ai' || mode === 'ai-vs-ai') ? 'flex' : 'none';
    
    resetGame();
    
    // if (mode === 'ai-vs-ai') { ... } // Logic moved to resetGame to support 'Play Again' button
}

function backToMenu() {
    document.getElementById('modeSelection').style.display = 'flex';
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('researchPanel').style.display = 'none';
    closeModal();
}

function resetGame() {
    board = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
    currentPlayer = 'red';
    gameOver = false;
    isProcessing = false;
    turnCount = 0;
    gameId = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
    // logs = []; // JANGAN DI-RESET! Biar bisa menumpuk datanya untuk riset.
    closeModal();
    renderBoard();
    // document.getElementById('logContent').innerHTML = ... // JANGAN RESET TAMPILAN LOG JUGA
    updateTurnDisplay();

    // Kickoff AI vs AI after reset (e.g. Play Again button)
    if (gameMode === 'ai-vs-ai') {
        setTimeout(triggerAI, 1000);
    }
}

function clearLogs() {
    logs = [];
    document.getElementById('logContent').innerHTML = '<div style="text-align:center; color: #999; margin-top: 50px;">Log data keputusan AI<br>akan muncul di sini...</div>';
}

function closeModal() {
    document.getElementById('winOverlay').classList.remove('active');
}

function updateAIStyle(style) {
    aiStyle = style;
    resetGame();
}

function updateTurnDisplay() {
    const badge = document.getElementById('turnIndicator');
    const dot = badge.querySelector('.player-dot');
    const text = document.getElementById('turnText');

    if (currentPlayer === 'red') {
        dot.style.background = 'var(--red-piece)';
        if (gameMode === 'ai') text.innerText = 'Giliran Anda';
        else if (gameMode === 'ai-vs-ai') text.innerText = 'AI Reflex (Merah)';
        else text.innerText = 'Pemain Merah';
    } else {
        dot.style.background = 'var(--yellow-piece)';
        if (gameMode === 'ai') text.innerText = 'AI Berpikir...';
        else if (gameMode === 'ai-vs-ai') text.innerText = 'AI Defend (Kuning)';
        else text.innerText = 'Pemain Kuning';
    }
}

// --- BOARD RENDER ---

function renderBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';

    for (let c = 0; c < COLS; c++) {
        const colDiv = document.createElement('div');
        colDiv.style.display = 'inline-block';
        colDiv.onclick = () => handleColumnClick(c);
        
        for (let r = 0; r < ROWS; r++) {
            const cellWrapper = document.createElement('div');
            cellWrapper.className = 'cell-wrapper';
            cellWrapper.id = `cell-${r}-${c}`;
            
            const bg = document.createElement('div'); bg.className = 'cell-bg';
            const mask = document.createElement('div'); mask.className = 'cell-mask';
            
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
    if (gameMode === 'ai' && currentPlayer === 'yellow') return; 
    if (gameMode === 'ai-vs-ai') return; 

    dropPiece(col);
}

function dropPiece(col) {
    if (gameOver) return;

    let row = getOpenRow(board, col);
    if (row === -1) return;

    isProcessing = true;
    board[row][col] = currentPlayer;
    turnCount++;

    // Animation
    const cell = document.getElementById(`cell-${row}-${col}`);
    const piece = document.createElement('div');
    piece.className = `piece ${currentPlayer}`;
    cell.appendChild(piece);
    requestAnimationFrame(() => piece.classList.add('dropped'));

    setTimeout(() => {
        if (checkWinBoard(board, currentPlayer)) {
            gameOver = true;
            piece.classList.add('winning');
            showWinModal(currentPlayer);
            isProcessing = false;
        } else if (checkDraw()) {
            gameOver = true;
            showDrawModal();
            isProcessing = false;
        } else {
            currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
            updateTurnDisplay();
            isProcessing = false;

            // Trigger AI Check
            const isAiTurn = (gameMode === 'ai' && currentPlayer === 'yellow') || (gameMode === 'ai-vs-ai');
            if (isAiTurn && !gameOver) {
                setTimeout(triggerAI, 500); 
            }
        }
    }, 600);
}

function triggerAI() {
    if (gameOver) return;
    try {
        let move = -1;

        if (gameMode === 'ai-vs-ai') {
            // Configuration: 
            // RED = Reflex (Agresif)
            // YELLOW = Defend (Minimax)
            if (currentPlayer === 'red') {
                move = getReflexMove(board, 'red');
            } else {
                move = getDefendMove(board, 'yellow');
            }
        } 
        else if (gameMode === 'ai') {
            // Player vs AI (AI is Yellow)
            // Use Selector to decide logic
            if (aiStyle === 'attack') {
                move = getReflexMove(board, 'yellow');
            } else {
                move = getDefendMove(board, 'yellow');
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
    for (let c = 0; c < COLS-3; c++) {
        for (let r = 0; r < ROWS; r++) {
            if (b[r][c] == p && b[r][c+1] == p && b[r][c+2] == p && b[r][c+3] == p) return true;
        }
    }
    // Vertical
    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS-3; r++) {
            if (b[r][c] == p && b[r+1][c] == p && b[r+2][c] == p && b[r+3][c] == p) return true;
        }
    }
    // Pos Slope
    for (let c = 0; c < COLS-3; c++) {
        for (let r = 0; r < ROWS-3; r++) {
            if (b[r][c] == p && b[r+1][c+1] == p && b[r+2][c+2] == p && b[r+3][c+3] == p) return true;
        }
    }
    // Neg Slope
    for (let c = 0; c < COLS-3; c++) {
        for (let r = 3; r < ROWS; r++) {
            if (b[r][c] == p && b[r-1][c+1] == p && b[r-2][c+2] == p && b[r-3][c+3] == p) return true;
        }
    }
    return false;
}

function checkDraw() {
    return board[0].every(cells => cells !== null);
}

// --- UI HELPERS ---

function showWinModal(winner) {
    if (gameMode === 'ai' || gameMode === 'ai-vs-ai') saveAllLogs(winner);
    
    const modal = document.getElementById('winOverlay');
    const msg = document.getElementById('winMessage');
    const iconEl = document.getElementById('winIcon');
    
    modal.classList.add('active');
    
    if (gameMode === 'ai') {
        if (winner === 'red') {
            iconEl.innerHTML = '<i class="fa-solid fa-trophy"></i>';
            msg.innerText = "Anda Menang!";
            msg.style.color = "var(--primary)";
        } else {
            iconEl.innerHTML = '<i class="fa-solid fa-robot"></i>';
            msg.innerText = "Komputer Menang!";
            msg.style.color = "var(--red-piece)";
        }
    } else if (gameMode === 'ai-vs-ai') {
        iconEl.innerHTML = '<i class="fa-solid fa-robot"></i>';
        msg.innerText = winner === 'red' ? "AI Reflex (Merah) Menang!" : "AI Defend (Kuning) Menang!";
    } else {
        iconEl.innerHTML = '<i class="fa-solid fa-trophy"></i>';
        msg.innerText = winner === 'red' ? "Merah Menang!" : "Kuning Menang!";
    }
}

function showDrawModal() {
    if (gameMode === 'ai' || gameMode === 'ai-vs-ai') saveAllLogs('draw');
    document.getElementById('winOverlay').classList.add('active');
    document.getElementById('winIcon').innerHTML = '<i class="fa-solid fa-handshake"></i>';
    document.getElementById('winMessage').innerText = "Seri!";
}

function logDecision(moves, selected, timeTaken, modeName) {
    const logPanel = document.getElementById('logContent');
    const entryId = logs.length + 1;
    
        const logData = {
            game_id: gameId,
            log_id: entryId,
            global_turn: turnCount,
            mode: modeName || aiStyle,
            thinking_time_ms: parseFloat(timeTaken), 
            nodes_explored: selected.nodes || 0, // NEW DATA FIELD
            chosen_col: selected.col,
            score: selected.score,
            board_state: JSON.parse(JSON.stringify(board)) 
        };

        logs.push(logData);

        if (logPanel && logPanel.innerText.includes('Log data')) logPanel.innerHTML = ''; 

        if (logPanel) { 
            const div = document.createElement('div');
            div.className = 'log-entry';
            if (selected.score > 2000) div.classList.add('high-score');
            
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
    logs.forEach(l => l.game_result = result);
    // Dummy fetch
    console.log("Saving logs...", logs);
}

function downloadLogs() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const anchor = document.createElement('a');
    anchor.href = dataStr;
    anchor.download = "connect_four_logs.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
}
