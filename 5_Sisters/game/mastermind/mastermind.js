/**
 * MASTERMIND - メインロジック
 * 2人対戦・パス＆プレイ・オフライン動作
 */

// =========================================
// 定数
// =========================================
const COLORS    = ['red', 'blue', 'green', 'yellow', 'purple', 'white'];
const PLAYER_NAME = { 1: '三玖', 2: '五月' };
const pName = p => PLAYER_NAME[p];
const MAX_SLOTS = 4;   // コードの長さ
const MAX_TURNS = 4;   // 1人あたりのターン数（合計8回）
const TOTAL_LANES = MAX_TURNS * 2; // 8レーン

// =========================================
// 状態
// =========================================
let state = {
    answer: [],          // 正解コード
    firstPlayer: 1,      // 1 or 2
    currentPlayer: 1,    // 1 or 2
    turn: [0, 0],        // [1P済ターン数, 2P済ターン数] 0-indexed
    history: [],         // { player, guess, hit, blow }[]
    currentGuess: [],    // 現在入力中 (長さ max 4)
    gameOver: false,
    winner: null,        // null | 1 | 2 | 'draw'
};

// =========================================
// DOM 参照
// =========================================
const screens = {
    start: document.getElementById('screen-start'),
    coin:  document.getElementById('screen-coin'),
    game:  document.getElementById('screen-game'),
    pass:  document.getElementById('screen-pass'),
};
const board          = document.getElementById('board');
const palette        = document.getElementById('palette');
const turnLabel      = document.getElementById('turn-label');
const turnCount      = document.getElementById('turn-count');
const btnSubmit      = document.getElementById('btn-submit');
const btnClear       = document.getElementById('btn-clear');
const btnStart       = document.getElementById('btn-start');
const btnToss        = document.getElementById('btn-toss');
const btnGoGame      = document.getElementById('btn-go-game');
const btnPassOk      = document.getElementById('btn-pass-ok');
const btnNextRound   = document.getElementById('btn-next-round');
const btnBack        = document.getElementById('btn-back');
const coinEl         = document.getElementById('coin');
const coinResult     = document.getElementById('coin-result');
const passTitle      = document.getElementById('pass-title');
const passMessage    = document.getElementById('pass-message');
const modalResult    = document.getElementById('modal-result');
const modalTitle     = document.getElementById('modal-title');
const modalMessage   = document.getElementById('modal-message');
const modalAnswer    = document.getElementById('modal-answer');

// =========================================
// 画面切替
// =========================================
function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    if (screens[name]) screens[name].classList.add('active');
}

// =========================================
// スタート
// =========================================
btnStart.addEventListener('click', () => {
    showScreen('coin');
});

// =========================================
// コイントス
// =========================================
btnToss.addEventListener('click', () => {
    btnToss.disabled = true;
    coinEl.classList.add('spinning');
    coinResult.textContent = '';
    btnGoGame.classList.add('hidden');

    const coinImg = document.getElementById('coin-img');
    // ミく↔いつきを交互に指す画像で切り替え
    const FRONT = 'images/mastermind-miku.jpg';
    const BACK  = 'images/mastermind-ituki.jpg';
    let count = 0;
    const interval = setInterval(() => {
        coinImg.src = count % 2 === 0 ? FRONT : BACK;
        count++;
    }, 100);

    setTimeout(() => {
        clearInterval(interval);
        coinEl.classList.remove('spinning');

        const first = Math.random() < 0.5 ? 1 : 2;
        state.firstPlayer   = first;
        state.currentPlayer = first;
        // 表=みく(1P先攻)、裏=いつき(2P先攻) のイメージで結果側も画像に展示
        coinImg.src = first === 1 ? FRONT : BACK;
        coinResult.textContent = first === 1 ? '三玖の先攻！' : '五月の先攻！';
        btnGoGame.classList.remove('hidden');
        btnToss.disabled = false;
    }, 700);
});

btnGoGame.addEventListener('click', () => {
    initGame();
    // パス画面を挟む
    showPassScreen(`${pName(state.currentPlayer)} のターンです`, '準備ができたら「準備OK」を押してください');
});

// =========================================
// ゲーム初期化
// =========================================
function initGame() {
    // ランダム正解コード（重複なし）
    const shuffled = [...COLORS].sort(() => Math.random() - 0.5);
    state.answer = shuffled.slice(0, MAX_SLOTS);
    console.log('%c【正解コード】', 'color:#ff1493;font-weight:bold;font-size:14px;', state.answer.join(' → '));
    state.turn         = [0, 0];
    state.history      = [];
    state.currentGuess  = [];
    state.gameOver      = false;
    state.winner        = null;
    state.currentPlayer = state.firstPlayer;

    buildBoard();
    buildPalette();
    updateTurnUI();
}

// =========================================
// ボード構築（8レーン）
// =========================================
function buildBoard() {
    board.innerHTML = '';

    // ヒント凡例
    const legend = document.createElement('div');
    legend.classList.add('hint-legend');
    legend.innerHTML =
        `<span><i class="pin hit" style="display:inline-block;width:12px;height:12px;border-radius:50%;background:var(--hit-color);"></i>Hit：色と位置が正解</span>` +
        `<span><i class="pin blow" style="display:inline-block;width:12px;height:12px;border-radius:50%;background:var(--blow-color);"></i>Blow：色だけ正解</span>`;
    board.appendChild(legend);

    // 行ベース：1P→2P交互に8行
    for (let t = 0; t < MAX_TURNS; t++) {
        for (let p = 0; p < 2; p++) {
            const player = p === 0 ? state.firstPlayer : (state.firstPlayer === 1 ? 2 : 1);
            const laneIndex = t * 2 + p; // 0 ~ 7

            const lane = document.createElement('div');
            lane.classList.add('lane');
            lane.dataset.laneIndex = laneIndex;
            lane.dataset.player = player;
            lane.dataset.turnIndex = t;

            // 左：ターン情報
            const laneInfo = document.createElement('div');
            laneInfo.classList.add('lane-info');
            laneInfo.innerHTML =
                `<div class="lane-num">${laneIndex + 1}</div>` +
                `<span class="player-badge">${pName(player)}</span>`;
            lane.appendChild(laneInfo);

            // 中央：スロット（横4つ）
            const slotArea = document.createElement('div');
            slotArea.classList.add('slot-area');
            slotArea.id = `slots-${laneIndex}`;
            for (let i = 0; i < MAX_SLOTS; i++) {
                const slot = document.createElement('div');
                slot.classList.add('slot');
                slot.dataset.slotIndex = i;
                slot.addEventListener('click', () => onSlotClick(laneIndex, i));
                slotArea.appendChild(slot);
            }
            lane.appendChild(slotArea);

            // 右：判定ピン（2×2）
            const pinArea = document.createElement('div');
            pinArea.classList.add('pin-area');
            pinArea.id = `pins-${laneIndex}`;
            for (let i = 0; i < MAX_SLOTS; i++) {
                const pin = document.createElement('div');
                pin.classList.add('pin');
                pinArea.appendChild(pin);
            }
            lane.appendChild(pinArea);

            board.appendChild(lane);
        }
    }
}

// =========================================
// パレット構築
// =========================================
function buildPalette() {
    palette.innerHTML = '';
    state.selectedColor = null;

    COLORS.forEach(color => {
        const btn = document.createElement('button');
        btn.classList.add('palette-ball');
        btn.dataset.color = color;
        btn.setAttribute('aria-label', color);
        btn.addEventListener('click', () => selectColor(color));
        palette.appendChild(btn);
    });
}

// =========================================
// 色選択 → 上から順に空きスロットへ配置
// パレットボールをタップするだけで入力完結
// =========================================
function selectColor(color) {
    if (state.gameOver) return;

    // 上から最初の空きスロットを探す
    let emptyIdx = -1;
    for (let i = 0; i < MAX_SLOTS; i++) {
        if (!state.currentGuess[i]) { emptyIdx = i; break; }
    }
    if (emptyIdx === -1) return; // 全スロット埋まっている場合は無視

    state.currentGuess[emptyIdx] = color;
    renderCurrentGuess(getCurrentLaneIndex());
    updateSubmitBtn();
}

// =========================================
// スロットクリック（タップで削除）
// =========================================
function onSlotClick(laneIndex, slotIndex) {
    if (state.gameOver) return;
    const currentLaneIndex = getCurrentLaneIndex();
    if (laneIndex !== currentLaneIndex) return;

    // タップしたスロットを削除し、それ以降を詰める
    if (!state.currentGuess[slotIndex]) return;
    state.currentGuess.splice(slotIndex, 1);
    // 配列を MAX_SLOTS 未満にならないよう管理（削除で詰まる）
    renderCurrentGuess(laneIndex);
    updateSubmitBtn();
}

// =========================================
// 現在プレイヤーのレーンインデックスを計算
// =========================================
function getCurrentLaneIndex() {
    const p = state.currentPlayer;
    const turnIndex = state.turn[p - 1]; // 0-indexed
    // レーン配置: 先攻プレイヤーはp=0列, 後攻はp=1列 × MAX_TURNSターン
    const isFirst = (p === state.firstPlayer);
    return turnIndex * 2 + (isFirst ? 0 : 1);
}

// =========================================
// 現在のguessをボードに描画
// =========================================
function renderCurrentGuess(laneIndex) {
    const slotArea = document.getElementById(`slots-${laneIndex}`);
    if (!slotArea) return;
    const slots = slotArea.querySelectorAll('.slot');
    // 現在のボール数（アニメ適用用）
    const prevCount = Array.from(slots).filter(s => s.children.length > 0).length;
    slots.forEach((slot, i) => {
        slot.innerHTML = '';
        if (state.currentGuess[i]) {
            const ball = document.createElement('div');
            ball.classList.add('ball');
            ball.dataset.color = state.currentGuess[i];
            // 新しく追加されたボールにのみアニメーション
            if (i >= prevCount) ball.classList.add('placing');
            slot.appendChild(ball);
        }
    });
}

// =========================================
// 判定ボタン更新
// =========================================
function updateSubmitBtn() {
    const filled = state.currentGuess.filter(Boolean).length;
    btnSubmit.disabled = (filled < MAX_SLOTS);
}

// =========================================
// ターンUI更新
// =========================================
function updateTurnUI() {
    const p = state.currentPlayer;
    const t = state.turn[p - 1] + 1; // 1-indexed
    turnLabel.textContent = `${pName(p)} のターン`;
    turnCount.textContent = `${t} / ${MAX_TURNS} ターン目`;

    // アクティブレーンを強調
    const currentLaneIndex = getCurrentLaneIndex();
    document.querySelectorAll('.lane').forEach(lane => {
        lane.classList.toggle('current', Number(lane.dataset.laneIndex) === currentLaneIndex);
    });

    // guessをリセット（新ターン）
    state.currentGuess = [];
    renderCurrentGuess(currentLaneIndex);
    updateSubmitBtn();
}

// =========================================
// 判定ボタン
// =========================================
btnSubmit.addEventListener('click', () => {
    if (state.gameOver) return;
    if (state.currentGuess.filter(Boolean).length < MAX_SLOTS) return;

    const p = state.currentPlayer;
    const laneIndex = getCurrentLaneIndex();
    const { hit, blow } = calcHitBlow(state.currentGuess, state.answer);

    // 履歴に記録
    state.history.push({ player: p, guess: [...state.currentGuess], hit, blow });

    // ピン表示
    showPins(laneIndex, hit, blow);

    // 勝敗判定
    if (hit === MAX_SLOTS) {
        // ピンアニメーション完了後に勝利アニメーション
        setTimeout(() => playWinAnimation(laneIndex, p), 900);
        return;
    }

    // ターンを進める
    state.turn[p - 1]++;

    // 全ターン消費チェック
    const allDone = state.turn[0] >= MAX_TURNS && state.turn[1] >= MAX_TURNS;
    if (allDone) {
        setTimeout(() => endGame('draw'), 900);
        return;
    }

    // プレイヤー交代
    const nextPlayer = p === 1 ? 2 : 1;

    // 次のプレイヤーのターンが残っているか確認
    const nextTurnIdx = state.turn[nextPlayer - 1];
    if (nextTurnIdx >= MAX_TURNS) {
        // もう一方のプレイヤーが続ける
        setTimeout(() => updateTurnUI(), 900);
        return;
    }

    state.currentPlayer = nextPlayer;

    // 結果を見せてからパス画面へ（1.5秒待機）
    setTimeout(() => {
        showPassScreen(
            `端末を${pName(nextPlayer)}に渡してください`,
            `${pName(nextPlayer)} のターンです。準備ができたら「準備OK」を押してください。`
        );
    }, 1500);
});

// =========================================
// Hit / Blow 計算
// =========================================
function calcHitBlow(guess, answer) {
    let hit = 0, blow = 0;
    const answerCount = {};
    const guessCount  = {};

    for (let i = 0; i < MAX_SLOTS; i++) {
        if (guess[i] === answer[i]) {
            hit++;
        } else {
            answerCount[answer[i]] = (answerCount[answer[i]] || 0) + 1;
            guessCount[guess[i]]   = (guessCount[guess[i]]   || 0) + 1;
        }
    }
    for (const color in guessCount) {
        if (answerCount[color]) {
            blow += Math.min(guessCount[color], answerCount[color]);
        }
    }
    return { hit, blow };
}

// =========================================
// ピン表示
// =========================================
function showPins(laneIndex, hit, blow) {
    const pinArea = document.getElementById(`pins-${laneIndex}`);
    if (!pinArea) return;
    const pins = pinArea.querySelectorAll('.pin');
    let idx = 0;
    for (let h = 0; h < hit; h++, idx++) {
        const pin = pins[idx];
        const delay = idx * 80;
        setTimeout(() => {
            pin.classList.add('hit', 'pop');
            pin.addEventListener('animationend', () => pin.classList.remove('pop'), { once: true });
        }, delay);
    }
    for (let b = 0; b < blow; b++, idx++) {
        const pin = pins[idx];
        const delay = idx * 80;
        setTimeout(() => {
            pin.classList.add('blow', 'pop');
            pin.addEventListener('animationend', () => pin.classList.remove('pop'), { once: true });
        }, delay);
    }
}

// =========================================
// 勝利アニメーション
// =========================================
function playWinAnimation(laneIndex, winner) {
    const slotArea = document.getElementById(`slots-${laneIndex}`);
    if (!slotArea) {
        endGame(winner);
        return;
    }

    const slots = slotArea.querySelectorAll('.slot');
    slots.forEach((slot, index) => {
        setTimeout(() => {
            slot.classList.add('win-animate');
        }, index * 80);
    });

    setTimeout(() => {
        endGame(winner);
    }, 1800);
}

// =========================================
// ゲーム終了
// =========================================
function endGame(winner) {
    state.gameOver = true;
    state.winner   = winner;

    // 正解コードを表示
    modalAnswer.innerHTML = '';
    state.answer.forEach(color => {
        const ball = document.createElement('div');
        ball.classList.add('ball');
        ball.dataset.color = color;
        modalAnswer.appendChild(ball);
    });

    if (winner === 'draw') {
        modalTitle.textContent   = '引き分け';
        modalMessage.textContent = '誰も正解できませんでした。\n正解はこちらです。';
    } else {
        modalTitle.textContent   = `${pName(winner)} の勝ち！🎉`;
        modalMessage.textContent = `正解コードはこちらです。`;
    }

    modalResult.classList.remove('hidden');
}

// =========================================
// 次のラウンドへ
// =========================================
btnNextRound.addEventListener('click', () => {
    modalResult.classList.add('hidden');
    initGame();
    showScreen('game');
    // コイントスをスキップして先攻をランダムに
    state.firstPlayer   = Math.random() < 0.5 ? 1 : 2;
    state.currentPlayer = state.firstPlayer;
    buildBoard();
    buildPalette();
    updateTurnUI();
    showPassScreen(
        `${state.currentPlayer}P が先攻です`,
        '準備ができたら「準備OK」を押してください'
    );
});

// =========================================
// 前のページへ
// =========================================
btnBack.addEventListener('click', () => {
    history.back();
});

// =========================================
// パス画面
// =========================================
function showPassScreen(title, message) {
    passTitle.textContent   = title;
    passMessage.textContent = message;
    showScreen('pass');
}

btnPassOk.addEventListener('click', () => {
    showScreen('game');
    updateTurnUI();
});

// =========================================
// クリアボタン
// =========================================
btnClear.addEventListener('click', () => {
    state.currentGuess = [];
    renderCurrentGuess(getCurrentLaneIndex());
    updateSubmitBtn();
});

// =========================================
// 初期表示
// =========================================
showScreen('start');
