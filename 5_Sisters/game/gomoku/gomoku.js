// ========================================
// 五目並べ（ゴモク）ゲーム
// ========================================

const BOARD_SIZE = 15;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;
const PLAYER_NAME = { 1: '三玖', 2: '五月' };
const pName = p => PLAYER_NAME[p];

let gameState = {
    board: [],
    currentPlayer: BLACK,
    gameOver: false,
    winner: null,
    player1Stone: BLACK,
    player2Stone: WHITE,
};

let currentScreen = 'start';

// ========================================
// 初期化
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initBoard();
});

function setupEventListeners() {
    document.getElementById('btn-start').addEventListener('click', goToCoinToss);
    document.getElementById('btn-toss').addEventListener('click', tossCoin);
    document.getElementById('btn-go-game').addEventListener('click', () => {
        goToGame();
        showPassMessage();
    });
    document.getElementById('btn-pass-ok').addEventListener('click', () => showScreen('game'));
    document.getElementById('btn-reset').addEventListener('click', resetGame);
    document.getElementById('btn-next-round').addEventListener('click', resetGame);
    document.getElementById('btn-back').addEventListener('click', () => history.back());
}

function initBoard() {
    gameState.board = Array(BOARD_SIZE * BOARD_SIZE).fill(EMPTY);
}

// ========================================
// 画面管理
// ========================================

function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${screenName}`).classList.add('active');
    currentScreen = screenName;
}

function goToCoinToss() {
    showScreen('coin');
}

function tossCoin() {
    const btnToss = document.getElementById('btn-toss');
    const btnGoGame = document.getElementById('btn-go-game');
    const coinEl = document.getElementById('coin');
    const coinImg = document.getElementById('coin-img');
    const coinResult = document.getElementById('coin-result');

    btnToss.disabled = true;
    coinEl.classList.add('spinning');
    coinResult.textContent = '';
    btnGoGame.classList.add('hidden');

    const FRONT = '../mastermind/images/mastermind-miku.jpg';
    const BACK  = '../mastermind/images/mastermind-ituki.jpg';
    let count = 0;
    const interval = setInterval(() => {
        coinImg.src = count % 2 === 0 ? FRONT : BACK;
        count++;
    }, 100);

    setTimeout(() => {
        clearInterval(interval);
        coinEl.classList.remove('spinning');

        const result = Math.random() < 0.5;
        const player1 = result ? '三玖' : '五月';
        const color = result ? '黒' : '白';
        const resultText = `${player1}（${color}）の先攻！`;

        if (result) {
            gameState.player1Stone = BLACK;
            gameState.player2Stone = WHITE;
        } else {
            gameState.player1Stone = WHITE;
            gameState.player2Stone = BLACK;
        }

        gameState.currentPlayer = BLACK;

        coinImg.src = result ? FRONT : BACK;
        coinResult.textContent = resultText;
        btnGoGame.classList.remove('hidden');
        btnToss.disabled = false;
    }, 700);
}

function goToGame() {
    initBoard();
    gameState.gameOver = false;
    gameState.winner = null;
    renderBoard();
    updateTurnBanner();
}

function showPassMessage() {
    const color = gameState.player1Stone === BLACK ? '黒' : '白';
    const msg = `三玖が先手（${color}）です`;
    document.getElementById('pass-message').textContent = msg;
    showScreen('pass');
}

// ========================================
// ボード表示
// ========================================

function renderBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';

    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell empty';
        cell.dataset.index = i;

        const row = Math.floor(i / BOARD_SIZE);
        const col = i % BOARD_SIZE;
        cell.style.gridColumn = col + 2;
        cell.style.gridRow = row + 2;

        const stone = gameState.board[i];
        if (stone !== EMPTY) {
            cell.classList.remove('empty');
            const stoneEl = document.createElement('div');
            stoneEl.className = `stone ${stone === BLACK ? 'black' : 'white'}`;
            cell.appendChild(stoneEl);
        }

        cell.addEventListener('click', () => cellClicked(i));
        boardEl.appendChild(cell);
    }
}

function cellClicked(index) {
    if (gameState.gameOver || gameState.board[index] !== EMPTY) {
        return;
    }

    gameState.board[index] = gameState.currentPlayer;

    if (checkWin(index)) {
        gameState.gameOver = true;
        gameState.winner = gameState.currentPlayer;
        showResult();
    } else {
        gameState.currentPlayer = gameState.currentPlayer === BLACK ? WHITE : BLACK;
        updateTurnBanner();
    }

    renderBoard();
}

// ========================================
// 勝敗判定
// ========================================

function checkWin(lastIndex) {
    const row = Math.floor(lastIndex / BOARD_SIZE);
    const col = lastIndex % BOARD_SIZE;
    const player = gameState.board[lastIndex];

    // 4方向をチェック：水平、垂直、斜め左上、斜め右上
    const directions = [
        { dr: 0, dc: 1 },   // 水平
        { dr: 1, dc: 0 },   // 垂直
        { dr: 1, dc: 1 },   // 斜め（左上～右下）
        { dr: 1, dc: -1 }   // 斜め（右上～左下）
    ];

    for (const dir of directions) {
        let count = 1;

        // 正方向
        let r = row + dir.dr;
        let c = col + dir.dc;
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && gameState.board[r * BOARD_SIZE + c] === player) {
            count++;
            r += dir.dr;
            c += dir.dc;
        }

        // 逆方向
        r = row - dir.dr;
        c = col - dir.dc;
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && gameState.board[r * BOARD_SIZE + c] === player) {
            count++;
            r -= dir.dr;
            c -= dir.dc;
        }

        if (count >= 5) {
            return true;
        }
    }

    return false;
}

// ========================================
// UI更新
// ========================================

function updateTurnBanner() {
    const isPlayer1Turn = gameState.currentPlayer === gameState.player1Stone;
    const playerName = isPlayer1Turn ? '三玖' : '五月';
    const color = gameState.currentPlayer === BLACK ? '黒' : '白';
    document.getElementById('turn-label').textContent = `${playerName} のターン（${color}）`;
}

function showResult() {
    const isPlayer1Win = gameState.winner === gameState.player1Stone;
    const playerName = isPlayer1Win ? '三玖' : '五月';
    const color = gameState.winner === BLACK ? '黒' : '白';

    document.getElementById('modal-title').textContent = '結果';
    document.getElementById('modal-message').textContent = `${playerName}（${color}）の勝利！\n5つ並びました！`;

    document.getElementById('modal-result').classList.remove('hidden');
}

function resetGame() {
    document.getElementById('modal-result').classList.add('hidden');
    goToCoinToss();
}
