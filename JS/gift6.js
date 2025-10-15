/* ヒット＆ブローゲーム JavaScript */
console.log('gift6.js ファイルが読み込まれました');

document.addEventListener("DOMContentLoaded", function () {
    console.log('ヒット&ブローゲーム読み込み開始');
    console.log('DOMContentLoaded イベントが発火しました');
    
    // ゲーム要素の取得
    const startBtn = document.getElementById('start-btn');
    const gameArea = document.getElementById('game-area');
    const gameMessage = document.getElementById('game-message');
    const colorOptions = document.querySelectorAll('.color-option');
    const colorSlots = document.querySelectorAll('.color-slot');
    const clearBtn = document.getElementById('clear-btn');
    const guessBtn = document.getElementById('guess-btn');
    const inputError = document.getElementById('input-error');
    const remainingAttempts = document.getElementById('remaining-attempts');
    const guessHistory = document.getElementById('guess-history');
    const resetBtn = document.getElementById('reset-btn');
    const winSection = document.querySelector('.win-section');
    const loseSection = document.querySelector('.lose-section');
    const winMessage = document.getElementById('win-message');
    const correctAnswer = document.getElementById('correct-answer');
    const openGiftBtn = document.getElementById('open-gift-btn');
    const consolationGiftBtn = document.getElementById('consolation-gift-btn');
    const giftReveal = document.querySelector('.gift-reveal');
    const giftTitle = document.getElementById('gift-title');
    const giftDescription = document.getElementById('gift-description');

    // デバッグ用：答え表示エリアを追加（コメントアウト）
    /*
    const debugAnswerDiv = document.createElement('div');
    debugAnswerDiv.id = 'debug-answer';
    debugAnswerDiv.style = 'margin: 1rem 0; font-size: 1.2rem; color: #dc3545; font-weight: bold;';
    gameMessage.parentNode.insertBefore(debugAnswerDiv, gameMessage.nextSibling);
    */

    // 要素が存在するかチェック
    console.log('Start button:', startBtn);
    console.log('Game area:', gameArea);
    console.log('Color options:', colorOptions.length);
    console.log('Clear button:', clearBtn);
    console.log('Guess button:', guessBtn);
    console.log('Reset button:', resetBtn);
    
    if (!startBtn) {
        console.error('Start button not found!');
        return;
    }

    console.log('すべての要素が正常に取得されました');

    // ゲーム変数
    const colors = ['blue', 'red', 'green', 'yellow', 'purple', 'white'];
    const colorEmojis = {
        'blue': '🔵',
        'red': '🔴',
        'green': '🟢',
        'yellow': '🟡',
        'purple': '🟣',
        'white': '⚪'
    };
    const colorNames = {
        'blue': '青',
        'red': '赤',
        'green': '緑',
        'yellow': '黄',
        'purple': '紫',
        'white': '白'
    };

    let targetColors = [];
    let currentGuess = [];
    let attempts = 0;
    const maxAttempts = 10; // テスト用の1から本来の10に戻す
    let gameStarted = false;

    // ランダムに4色を選択する関数
    function generateTargetColors() {
        const shuffled = [...colors].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 4);
    }

    // ゲーム開始
    console.log('スタートボタンにイベントリスナーを追加します');
    startBtn.addEventListener('click', function() {
        console.log('スタートボタンがクリックされました！');
        gameStarted = true;
        targetColors = generateTargetColors();
        console.log('Target colors:', targetColors); // デバッグ用
        
        startBtn.classList.add('hidden');
        gameArea.classList.remove('hidden');
        resetBtn.classList.remove('hidden');
        
        attempts = 0;
        currentGuess = [];
        updateRemainingAttempts();
        updateColorSlots();
        updateColorOptions();
        updateGuessButton();
        gameMessage.textContent = '6色から4色を選んで予想しよう！';
        // showDebugAnswer(); // コメントアウト
        console.log('ゲーム開始処理完了');
    });

    // 色選択イベント
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            const color = this.dataset.color;
            console.log('色がクリックされました:', color);
            
            if (currentGuess.includes(color) || currentGuess.length >= 4) {
                console.log('選択できません - 重複または4色に達している');
                return;
            }
            
            currentGuess.push(color);
            console.log('現在の選択:', currentGuess);
            updateColorSlots();
            updateColorOptions();
            updateGuessButton();
        });
    });

    // スロットクリックで色を削除
    colorSlots.forEach((slot, index) => {
        slot.addEventListener('click', function() {
            if (currentGuess[index]) {
                currentGuess.splice(index, 1);
                updateColorSlots();
                updateColorOptions();
                updateGuessButton();
            }
        });
    });

    // クリアボタン
    clearBtn.addEventListener('click', function() {
        currentGuess = [];
        updateColorSlots();
        updateColorOptions();
        updateGuessButton();
    });

    // 予想ボタン
    guessBtn.addEventListener('click', function() {
        if (currentGuess.length !== 4) {
            showInputError('4色すべて選択してください');
            return;
        }

        const result = calculateHitAndBlow(currentGuess, targetColors);
        attempts++;
        
        addToHistory(currentGuess, result);
        updateRemainingAttempts();
        
        if (result.hits === 4) {
            // フォーヒット達成
            winGame();
        } else if (attempts >= maxAttempts) {
            // ゲームオーバー
            loseGame();
        } else {
            currentGuess = [];
            updateColorSlots();
            updateColorOptions();
            updateGuessButton();
            gameMessage.textContent = `${result.hits}ヒット ${result.blows}ブロー！続けてチャレンジ！`;
        }
    });

    // ヒット＆ブロー計算
    function calculateHitAndBlow(guess, target) {
        let hits = 0;
        let blows = 0;
        
        // ヒットを計算
        for (let i = 0; i < 4; i++) {
            if (guess[i] === target[i]) {
                hits++;
            }
        }
        
        // ブローを計算
        const guessColors = [...guess];
        const targetColors = [...target];
        
        // ヒットした位置を除外
        for (let i = 3; i >= 0; i--) {
            if (guess[i] === target[i]) {
                guessColors.splice(i, 1);
                targetColors.splice(i, 1);
            }
        }
        
        // 残った色でブローを計算
        for (const color of guessColors) {
            const index = targetColors.indexOf(color);
            if (index !== -1) {
                blows++;
                targetColors.splice(index, 1);
            }
        }
        
        return { hits, blows };
    }

    // UI更新関数
    function updateColorSlots() {
        colorSlots.forEach((slot, index) => {
            if (currentGuess[index]) {
                slot.textContent = colorEmojis[currentGuess[index]];
                slot.classList.add('filled');
            } else {
                slot.textContent = '❓';
                slot.classList.remove('filled');
            }
        });
    }

    function updateColorOptions() {
        colorOptions.forEach(option => {
            const color = option.dataset.color;
            if (currentGuess.includes(color)) {
                option.classList.add('disabled');
            } else {
                option.classList.remove('disabled');
            }
        });
    }

    function updateGuessButton() {
        const shouldEnable = currentGuess.length === 4;
        guessBtn.disabled = !shouldEnable;
        console.log('Guess button updated - enabled:', shouldEnable, 'current guess length:', currentGuess.length);
    }

    function updateRemainingAttempts() {
        remainingAttempts.textContent = maxAttempts - attempts;
    }

    function showInputError(message) {
        inputError.textContent = message;
        inputError.classList.remove('hidden');
        setTimeout(() => {
            inputError.classList.add('hidden');
        }, 3000);
    }

    function addToHistory(guess, result) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const colorsDiv = document.createElement('div');
        colorsDiv.className = 'history-colors';
        
        guess.forEach(color => {
            const colorSpan = document.createElement('span');
            colorSpan.className = 'history-color';
            colorSpan.textContent = colorEmojis[color];
            colorsDiv.appendChild(colorSpan);
        });
        
        const resultDiv = document.createElement('div');
        resultDiv.className = 'history-result';
        resultDiv.innerHTML = `<span class="hit">${result.hits}ヒット</span> <span class="blow">${result.blows}ブロー</span>`;
        
        historyItem.appendChild(colorsDiv);
        historyItem.appendChild(resultDiv);
        
        guessHistory.insertBefore(historyItem, guessHistory.firstChild);
    }

    // showDebugAnswer関数をコメントアウト
    /*
    function showDebugAnswer() {
        if (targetColors.length === 4) {
            debugAnswerDiv.innerHTML = '【答え】' + targetColors.map(c => colorEmojis[c]).join(' ');
        } else {
            debugAnswerDiv.innerHTML = '';
        }
    }
    */
    

    function winGame() {
        gameMessage.textContent = '🎉 フォーヒット達成！おめでとう！';
        winMessage.textContent = `${attempts}回目で見事にフォーヒットを達成しました！`;
        winSection.classList.remove('hidden');
        gameArea.style.pointerEvents = 'none';
    }

    function loseGame() {
        gameMessage.textContent = '😢 ゲームオーバー！でも頑張ったね！';
        const targetEmojis = targetColors.map(color => colorEmojis[color]).join(' ');
        const targetNames = targetColors.map(color => colorNames[color]).join('・');
        correctAnswer.innerHTML = `${targetEmojis}<br>(${targetNames})`;
        loseSection.classList.remove('hidden');
        gameArea.style.pointerEvents = 'none';
        // プレゼント表示はしない
        giftReveal.classList.add('hidden');
    }

    // リセットボタン
    resetBtn.addEventListener('click', function() {
        gameStarted = false;
        targetColors = [];
        currentGuess = [];
        attempts = 0;
        
        // UI をリセット
        startBtn.classList.remove('hidden');
        gameArea.classList.add('hidden');
        resetBtn.classList.add('hidden');
        winSection.classList.add('hidden');
        loseSection.classList.add('hidden');
        giftReveal.classList.add('hidden');
        
        gameMessage.textContent = 'スタートボタンを押してゲーム開始！';
        guessHistory.innerHTML = '';
        gameArea.style.pointerEvents = 'auto';
    });

    // 再挑戦ボタン
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
        retryBtn.addEventListener('click', function() {
            gameStarted = false;
            targetColors = [];
            currentGuess = [];
            attempts = 0;
            // UI をリセット
            startBtn.classList.remove('hidden');
            gameArea.classList.add('hidden');
            resetBtn.classList.add('hidden');
            winSection.classList.add('hidden');
            loseSection.classList.add('hidden');
            giftReveal.classList.add('hidden');
            gameMessage.textContent = 'スタートボタンを押してゲーム開始！';
            guessHistory.innerHTML = '';
            gameArea.style.pointerEvents = 'auto';
            // showDebugAnswer(); // コメントアウト
        });
    }

    // プレゼント開封ボタン
    openGiftBtn.addEventListener('click', function() {
        openGift();
    });

    function openGift() {
        // 詳細なプレゼント情報を設定
        giftTitle.textContent = '9/1日無料券';
        giftDescription.textContent = '9/1日限定でなんでも買っていいよ！';
        
        // 追加の詳細情報があれば設定
        const utilizationElement = document.getElementById('gift-utilization');
        const expirationElement = document.getElementById('gift-expiration');
        
        if (utilizationElement) {
            utilizationElement.textContent = '特になし！';
        }
        if (expirationElement) {
            expirationElement.textContent = '9/1日23:59まで';
        }
        
        winSection.classList.add('hidden');
        loseSection.classList.add('hidden');
        giftReveal.classList.remove('hidden');
        createConfetti();
    }

    // 紙吹雪エフェクト
    function createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.top = '-10px';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '9999';
                confetti.style.borderRadius = '50%';
                confetti.style.animation = 'confettiFall 3s linear forwards';
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    confetti.remove();
                }, 3000);
            }, i * 100);
        }
    }
    
    console.log('ヒット&ブローゲーム初期化完了');
});
