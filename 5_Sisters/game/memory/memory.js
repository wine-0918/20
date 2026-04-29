// ========================================
// 神経衰弱 - メインロジック
// ========================================

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const PLAYER_NAME = { 1: '三玖', 2: '五月' };
const pName = p => PLAYER_NAME[p];

let gameState = {
    cardCount: 0,
    cards: [],
    revealed: [],
    matched: [],
    currentPlayer: 1,
    player1Score: 0,
    player2Score: 0,
    gameOver: false,
    waiting: false,
};

let currentScreen = 'start';

// ========================================
// 初期化
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

function setupEventListeners() {
    document.querySelectorAll('.btn-card-count').forEach(btn => {
        btn.addEventListener('click', (e) => {
            gameState.cardCount = parseInt(e.target.dataset.count);
            document.querySelectorAll('.btn-card-count').forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            document.getElementById('btn-start').disabled = false;
        });
    });

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
        const playerName = result ? '三玖' : '五月';
        const resultText = `${playerName}の先攻！`;

        gameState.currentPlayer = result ? 1 : 2;

        coinImg.src = result ? FRONT : BACK;
        coinResult.textContent = resultText;
        btnGoGame.classList.remove('hidden');
        btnToss.disabled = false;
    }, 700);
}

function goToGame() {
    initGame();
    renderBoard();
    updateScoreDisplay();
}

function showPassMessage() {
    const msg = `${pName(gameState.currentPlayer)}のターンです`;
    document.getElementById('pass-message').textContent = msg;
    showScreen('pass');
}

// ========================================
// ゲーム初期化
// ========================================

function initGame() {
    gameState.cards = generateCards(gameState.cardCount);
    gameState.revealed = [];
    gameState.matched = [];
    gameState.player1Score = 0;
    gameState.player2Score = 0;
    gameState.gameOver = false;
    gameState.waiting = false;
    gameState.currentPlayer = 1;
}

function generateCards(count) {
    const cards = [];
    const pairCount = count / 2;

    for (let i = 0; i < pairCount; i++) {
        const suit = SUITS[Math.floor(i / RANKS.length) % SUITS.length];
        const rank = RANKS[i % RANKS.length];
        const card = { suit, rank, id: `${suit}-${rank}` };
        cards.push(card);
        cards.push(card);
    }

    // シャッフル
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    return cards;
}

// ========================================
// ボード表示
// ========================================

function renderBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';

    const colCount = gameState.cardCount <= 12 ? 4 : gameState.cardCount <= 16 ? 4 : 5;
    boardEl.style.gridTemplateColumns = `repeat(${colCount}, 1fr)`;

    gameState.cards.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.dataset.index = index;

        const isRevealed = gameState.revealed.includes(index);
        const isMatched = gameState.matched.includes(index);

        if (isRevealed || isMatched) {
            cardEl.classList.add('revealed');
            const cardFace = createCardFace(card);
            cardEl.appendChild(cardFace);
        } else {
            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
            cardEl.appendChild(cardBack);
        }

        if (!isMatched) {
            cardEl.addEventListener('click', () => cardClicked(index));
        }

        boardEl.appendChild(cardEl);
    });
}

function createCardFace(card) {
    const face = document.createElement('div');
    face.className = 'card-face';

    const rankSpan = document.createElement('span');
    rankSpan.className = 'rank';
    rankSpan.textContent = card.rank;

    const suitSpan = document.createElement('span');
    suitSpan.className = 'suit';
    suitSpan.textContent = card.suit;

    const pipsContainer = document.createElement('div');
    pipsContainer.className = 'pips';

    const rankValue = RANKS.indexOf(card.rank) + 2;
    for (let i = 0; i < rankValue; i++) {
        const pip = document.createElement('span');
        pip.className = 'pip';
        pip.textContent = card.suit;
        pipsContainer.appendChild(pip);
    }

    face.appendChild(rankSpan);
    face.appendChild(suitSpan);
    face.appendChild(pipsContainer);

    return face;
}

function cardClicked(index) {
    if (gameState.waiting || gameState.gameOver) return;
    if (gameState.revealed.includes(index) || gameState.matched.includes(index)) return;

    gameState.revealed.push(index);
    renderBoard();

    if (gameState.revealed.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    gameState.waiting = true;

    const [idx1, idx2] = gameState.revealed;
    const card1 = gameState.cards[idx1];
    const card2 = gameState.cards[idx2];

    const isMatch = card1.id === card2.id;

    setTimeout(() => {
        if (isMatch) {
            gameState.matched.push(idx1, idx2);
            if (gameState.currentPlayer === 1) {
                gameState.player1Score++;
            } else {
                gameState.player2Score++;
            }

            gameState.revealed = [];
            renderBoard();
            updateScoreDisplay();

            if (gameState.matched.length === gameState.cards.length) {
                endGame();
            } else {
                gameState.waiting = false;
            }
        } else {
            gameState.revealed = [];
            renderBoard();
            gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
            updateScoreDisplay();

            showPassScreen(
                `${pName(gameState.currentPlayer)}のターンです`,
                '準備ができたら「準備OK」を押してください'
            );
            gameState.waiting = true;
        }
    }, 1000);
}

function showPassScreen(title, message) {
    document.getElementById('pass-title').textContent = title;
    document.getElementById('pass-message').textContent = message;
    showScreen('pass');
}

function updateScoreDisplay() {
    const p1Name = pName(1);
    const p2Name = pName(2);
    const display = `${p1Name}: ${gameState.player1Score} | ${p2Name}: ${gameState.player2Score}`;
    document.getElementById('score-display').textContent = display;
    document.getElementById('turn-label').textContent = `${pName(gameState.currentPlayer)} のターン`;
}

function endGame() {
    gameState.gameOver = true;

    const p1Score = gameState.player1Score;
    const p2Score = gameState.player2Score;
    let resultText = '';

    if (p1Score > p2Score) {
        resultText = `${pName(1)}の勝利！\n${pName(1)}: ${p1Score}ペア ${pName(2)}: ${p2Score}ペア`;
    } else if (p2Score > p1Score) {
        resultText = `${pName(2)}の勝利！\n${pName(1)}: ${p1Score}ペア ${pName(2)}: ${p2Score}ペア`;
    } else {
        resultText = `引き分け！\n${pName(1)}: ${p1Score}ペア ${pName(2)}: ${p2Score}ペア`;
    }

    document.getElementById('modal-title').textContent = '結果';
    document.getElementById('modal-message').textContent = resultText;
    document.getElementById('modal-result').classList.remove('hidden');
}

function resetGame() {
    document.getElementById('modal-result').classList.add('hidden');
    goToCoinToss();
}
