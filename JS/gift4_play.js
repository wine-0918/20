/* 料理記憶ゲーム（神経衰弱風） */
document.addEventListener("DOMContentLoaded", function () {
    // ゲーム要素の取得
    const gameBoard = document.getElementById('game-board');
    const gameMessage = document.getElementById('game-message');
    const resetBtn = document.getElementById('reset-btn');
    const startBtn = document.getElementById('start-btn');
    const giftSection = document.querySelector('.gift-reveal');
    
    // 料理の絵文字配列（10ペア = 20枚）
    const foodEmojis = ['🍕', '🍜', '🍣', '🍰', '🍔', '🍙', '🍱', '🍛', '🥗', '🍖'];
    
    // ゲーム状態管理
    let gameCards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let isGameActive = false;
    let canFlip = true;
    let isGameStarted = false;
    let missCount = 0;
    const maxMisses = 2;
    
    // ゲーム初期化
    function initGame() {
        // カードの配列を作成（各絵文字を2枚ずつ）
        const cardPairs = [...foodEmojis, ...foodEmojis];
        
        // シャッフル
        gameCards = shuffleArray(cardPairs);
        
        // ゲームボードをクリア
        gameBoard.innerHTML = '';
        
        // カードを生成（初期状態は裏向き）
        gameCards.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.emoji = emoji;
            card.dataset.index = index;
            
            card.innerHTML = `
                <div class="card-face card-front">❓</div>
                <div class="card-face card-back">${emoji}</div>
            `;
            
            card.addEventListener('click', () => flipCard(card, index));
            gameBoard.appendChild(card);
        });
        
        // ゲーム状態リセット
        flippedCards = [];
        matchedPairs = 0;
        missCount = 0;
        isGameActive = false;
        canFlip = false;
        isGameStarted = false;
        
        // UI状態をリセット
        gameMessage.textContent = 'スタートボタンを押してゲーム開始！';
        gameMessage.style.color = '#333';
        gameMessage.style.fontSize = '1.2rem';
        gameMessage.style.fontWeight = 'bold';
        
        startBtn.classList.remove('hidden');
        resetBtn.classList.add('hidden');
        giftSection.classList.add('hidden');
        
        // プレゼント開封セクションも非表示にする
        const openGiftSection = document.querySelector('.open-gift-section');
        if (openGiftSection) {
            openGiftSection.classList.add('hidden');
        }
    }
    
    // ゲーム開始機能
    function startGame() {
        if (isGameStarted) return;
        
        isGameStarted = true;
        startBtn.classList.add('hidden');
        resetBtn.classList.remove('hidden');
        
        // 10秒間カードを表示
        showAllCards();
    }
    
    // 全カードを7秒間表示
    function showAllCards() {
        const cards = document.querySelectorAll('.memory-card');
        cards.forEach(card => card.classList.add('flipped'));
        canFlip = false;
        
        gameMessage.textContent = '7秒間覚えてね...';
        gameMessage.style.color = '#ff6b6b';
        
        // カウントダウン表示
        let countdown = 7;
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                gameMessage.textContent = `${countdown}秒間覚えてください...`;
            }
        }, 1000);
        
        setTimeout(() => {
            clearInterval(countdownInterval);
            cards.forEach(card => card.classList.remove('flipped'));
            canFlip = true;
            isGameActive = true;
            gameMessage.textContent = '同じ料理のペアを見つけよう！';
            gameMessage.style.color = '#333';
        }, 7000);
    }
    
    // 配列をシャッフル
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // カードをめくる
    function flipCard(card, index) {
        if (!isGameActive || !canFlip || !isGameStarted || card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }
        
        // カードをめくる
        card.classList.add('flipped');
        flippedCards.push({ card, index, emoji: card.dataset.emoji });
        
        // 2枚めくられた場合
        if (flippedCards.length === 2) {
            canFlip = false;
            checkMatch();
        }
    }
    
    // マッチチェック
    function checkMatch() {
        const [card1, card2] = flippedCards;
        
        if (card1.emoji === card2.emoji) {
            // マッチした場合
            setTimeout(() => {
                card1.card.classList.add('matched');
                card2.card.classList.add('matched');
                matchedPairs++;
                
                gameMessage.textContent = `いいね！ ${matchedPairs}/10 ペア完成`;
                gameMessage.style.color = '#28a745';
                
                // マッチしたカードを1秒後に消す
                setTimeout(() => {
                    card1.card.style.transition = 'all 0.5s ease-out';
                    card2.card.style.transition = 'all 0.5s ease-out';
                    card1.card.style.opacity = '0';
                    card2.card.style.opacity = '0';
                    card1.card.style.transform = 'scale(0.8)';
                    card2.card.style.transform = 'scale(0.8)';
                    
                    // 完全に非表示にする
                    setTimeout(() => {
                        card1.card.style.visibility = 'hidden';
                        card2.card.style.visibility = 'hidden';
                    }, 500);
                }, 1000);
                
                // 全ペア完成チェック
                if (matchedPairs === 10) {
                    setTimeout(() => {
                        gameComplete();
                    }, 1500);
                } else {
                    flippedCards = [];
                    canFlip = true;
                }
            }, 500);
        } else {
            // マッチしなかった場合
            missCount++;
            setTimeout(() => {
                card1.card.classList.remove('flipped');
                card2.card.classList.remove('flipped');
                flippedCards = [];
                canFlip = true;
                
                if (missCount >= maxMisses) {
                    gameMessage.textContent = `${maxMisses}回ミスしました！ゲームリセット！`;
                    gameMessage.style.color = '#dc3545';
                    
                    setTimeout(() => {
                        initGame();
                    }, 2000);
                } else {
                    gameMessage.textContent = `残念！あと${maxMisses - missCount}回ミスでリセット！`;
                    gameMessage.style.color = '#dc3545';
                    
                    // 1秒後にメッセージを戻す
                    setTimeout(() => {
                        gameMessage.textContent = '同じ料理のペアを見つけよう！';
                        gameMessage.style.color = '#333';
                    }, 1000);
                }
            }, 1000);
        }
    }
    
    // ゲーム完了
    function gameComplete() {
        isGameActive = false;
        
        // 祝福メッセージ
        gameMessage.innerHTML = '🎉 おめでとう！全ペア完成！ 🎉';
        gameMessage.style.color = '#ff6b6b';
        gameMessage.style.fontSize = '1.5rem';
        gameMessage.style.fontWeight = 'bold';
        
        // カード全体にエフェクト
        const cards = document.querySelectorAll('.memory-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                if (card.style.visibility !== 'hidden') {
                    card.style.transform = 'scale(1.1) rotate(5deg)';
                    card.style.filter = 'brightness(1.2)';
                }
            }, index * 100);
        });
        
        // プレゼント開封ボタンを表示
        setTimeout(() => {
            showOpenGiftButton();
        }, 2000);
    }
    
    // プレゼント開封ボタンを表示
    function showOpenGiftButton() {
        const openGiftSection = document.querySelector('.open-gift-section');
        openGiftSection.classList.remove('hidden');
        openGiftSection.style.opacity = '0';
        openGiftSection.style.transform = 'translateY(30px)';
        
        // フェードインアニメーション
        setTimeout(() => {
            openGiftSection.style.transition = 'all 0.8s ease-out';
            openGiftSection.style.opacity = '1';
            openGiftSection.style.transform = 'translateY(0)';
        }, 100);
        
        // 紙吹雪エフェクト
        createConfetti();
    }
    
    // プレゼント表示
    function revealGift() {
        giftSection.classList.remove('hidden');
        giftSection.style.opacity = '0';
        giftSection.style.transform = 'translateY(30px)';
        
        // フェードインアニメーション
        setTimeout(() => {
            giftSection.style.transition = 'all 0.8s ease-out';
            giftSection.style.opacity = '1';
            giftSection.style.transform = 'translateY(0)';
        }, 100);
        
        // 紙吹雪エフェクト
        createConfetti();
    }
    
    // 紙吹雪エフェクト
    function createConfetti() {
        const confettiContainer = document.createElement('div');
        confettiContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1000;
        `;
        document.body.appendChild(confettiContainer);
        
        // 50個の紙吹雪を作成
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                
                confetti.style.cssText = `
                    position: absolute;
                    top: -10px;
                    left: ${Math.random() * 100}%;
                    width: 10px;
                    height: 10px;
                    background: ${randomColor};
                    animation: confettiFall 3s linear forwards;
                `;
                
                confettiContainer.appendChild(confetti);
                
                // 3秒後に削除
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 3000);
            }, i * 50);
        }
        
        // 5秒後にコンテナを削除
        setTimeout(() => {
            if (confettiContainer.parentNode) {
                confettiContainer.parentNode.removeChild(confettiContainer);
            }
        }, 5000);
    }
    
    // イベントリスナー
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', initGame);
    
    // プレゼント開封ボタンのイベントリスナー
    const openGiftBtn = document.getElementById('open-gift-btn');
    if (openGiftBtn) {
        openGiftBtn.addEventListener('click', function() {
            revealGift();
            openGiftBtn.style.display = 'none';
        });
    }
    
    // ゲーム初期化
    initGame();
});