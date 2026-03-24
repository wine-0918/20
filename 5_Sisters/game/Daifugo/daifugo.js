// 大富豪ゲームメインロジック

class DaifugoGame {
    constructor() {
        this.players = [
            { id: 'player', name: 'あなた', hand: [], rank: null, isCPU: false },
            { id: 'cpu1', name: 'CPU1', hand: [], rank: null, isCPU: true, difficulty: 1 },
            { id: 'cpu2', name: 'CPU2', hand: [], rank: null, isCPU: true, difficulty: 1 },
            { id: 'cpu3', name: 'CPU3', hand: [], rank: null, isCPU: true, difficulty: 1 }
        ];
        
        this.currentPlayerIndex = 0;
        this.field = [];
        this.lastPlayedCards = [];
        this.selectedCards = [];
        this.passedPlayers = new Set();
        this.finishedPlayers = [];
        
        // ゲーム状態
        this.isRevolution = false;
        this.isJBack = false;
        this.shibariSuit = null;
        
        // ルール設定
        this.rules = {
            cut8: true,
            revolution: true,
            jback: true,
            sequence: true,
            shibari: true,
            miyakoochi: true,
            forbidden: true
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.startGame();
    }
    
    setupEventListeners() {
        document.getElementById('passBtn').addEventListener('click', () => {
            this.handlePass();
        });
        
        document.getElementById('playBtn').addEventListener('click', () => {
            this.handlePlay();
        });
        
        document.getElementById('replayBtn').addEventListener('click', () => {
            location.href = 'daifugo-setup.html';
        });
        
        document.getElementById('backToTitleBtn').addEventListener('click', () => {
            location.href = '../../html/game_selection.html';
        });
    }
    
    loadSettings() {
        // localStorageから設定読み込み
        const savedSettings = localStorage.getItem('daifugoSettings');
        
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            // ルール設定
            this.rules.cut8 = settings.rules.cut8;
            this.rules.revolution = settings.rules.revolution;
            this.rules.jback = settings.rules.jback;
            this.rules.sequence = settings.rules.sequence;
            this.rules.shibari = settings.rules.shibari;
            this.rules.miyakoochi = settings.rules.miyakoochi;
            this.rules.forbidden = settings.rules.forbidden;
            
            // CPU難易度
            this.players[1].difficulty = settings.cpuDifficulty.cpu1;
            this.players[2].difficulty = settings.cpuDifficulty.cpu2;
            this.players[3].difficulty = settings.cpuDifficulty.cpu3;
        }
    }
    
    startGame() {
        this.log('ゲーム開始！');
        
        // 前回のランクに基づいて開始プレイヤーを決定（初回はランダム）
        if (this.players.every(p => p.rank === null)) {
            this.currentPlayerIndex = Math.floor(Math.random() * 4);
        } else {
            // 大貧民からスタート
            this.currentPlayerIndex = this.players.findIndex(p => p.rank === 'daihinmin');
            if (this.currentPlayerIndex === -1) this.currentPlayerIndex = 0;
        }
        
        // カード交換（2ゲーム目以降）
        if (this.players.some(p => p.rank !== null)) {
            this.exchangeCards();
        }
        
        // カード配布（アニメーション付き）
        this.dealCardsWithAnimation();
    }
    
    async dealCardsWithAnimation() {
        // まずカードを配布（非表示で）
        this.dealCards();
        
        // 状態リセット
        this.field = [];
        this.lastPlayedCards = [];
        this.selectedCards = [];
        this.passedPlayers.clear();
        this.finishedPlayers = [];
        this.isRevolution = false;
        this.isJBack = false;
        this.shibariSuit = null;
        
        // UI更新
        this.updateUI();
        
        // カード配布アニメーション
        await this.animateCardDealing();
        
        // アニメーション後にゲーム開始
        this.nextTurn();
    }
    
    animateCardDealing() {
        return new Promise((resolve) => {
            const totalCards = 53; // 52枚 + Joker
            const delayPerCard = 25; // 各カードの配布間隔（ミリ秒）
            const animationDuration = 400; // 1枚のアニメーション時間
            
            // 全てのプレイヤーエリアを取得
            const playerAreas = [
                document.getElementById('player-area'),      // 0: プレイヤー
                document.getElementById('cpu1-player'),      // 1: CPU1
                document.getElementById('cpu2-player'),      // 2: CPU2
                document.getElementById('cpu3-player')       // 3: CPU3
            ];
            
            let cardIndex = 0;
            const dealInterval = setInterval(() => {
                if (cardIndex >= totalCards) {
                    clearInterval(dealInterval);
                    // 全カード配布完了後、少し待ってから解決
                    setTimeout(() => resolve(), animationDuration);
                    return;
                }
                
                // カードを配る対象を決定（順番に配る）
                const playerIndex = cardIndex % 4;
                const targetArea = playerAreas[playerIndex];
                const isPlayer = playerIndex === 0;
                
                if (targetArea) {
                    // プレイヤーは通常サイズ、CPUは小さいサイズ
                    const cardWidth = isPlayer ? 60 : 35;
                    const cardHeight = isPlayer ? 86 : 50;
                    
                    // カードアニメーション要素を作成
                    const cardElement = document.createElement('div');
                    cardElement.className = 'card dealing';
                    cardElement.style.cssText = `
                        width: ${cardWidth}px;
                        height: ${cardHeight}px;
                        background: linear-gradient(135deg, #dc143c 0%, #b91432 100%);
                        border: 2px solid #8b0000;
                        border-radius: 4px;
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        z-index: 1000;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    `;
                    document.body.appendChild(cardElement);
                    
                    // アニメーション開始
                    setTimeout(() => {
                        const rect = targetArea.getBoundingClientRect();
                        cardElement.style.transition = `all ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                        cardElement.style.top = rect.top + rect.height / 2 + 'px';
                        cardElement.style.left = rect.left + rect.width / 2 + 'px';
                        cardElement.style.opacity = '0';
                        cardElement.style.transform = 'scale(0.2)';
                        
                        // アニメーション完了後に削除
                        setTimeout(() => {
                            cardElement.remove();
                        }, animationDuration);
                    }, 10);
                }
                
                cardIndex++;
            }, delayPerCard);
        });
    }
    
    dealCards() {
        // デッキ作成
        const deck = [];
        const suits = ['spade', 'heart', 'diamond', 'club'];
        const ranks = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
        
        for (const suit of suits) {
            for (const rank of ranks) {
                deck.push({ suit, rank, value: this.getCardValue(rank) });
            }
        }
        
        // ジョーカー追加
        deck.push({ suit: 'joker', rank: 'Joker', value: 15 });
        
        // シャッフル
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        
        // 配布
        this.players.forEach(player => {
            player.hand = deck.splice(0, 13);
            this.sortHand(player.hand);
        });
        
        // 残りは最初のプレイヤーに
        if (deck.length > 0) {
            this.players[0].hand.push(...deck);
            this.sortHand(this.players[0].hand);
        }
    }
    
    exchangeCards() {
        const daifugo = this.players.find(p => p.rank === 'daifugo');
        const daihinmin = this.players.find(p => p.rank === 'daihinmin');
        const fugo = this.players.find(p => p.rank === 'fugo');
        const hinmin = this.players.find(p => p.rank === 'hinmin');
        
        if (daifugo && daihinmin) {
            // 大富豪⇔大貧民: 2枚交換
            this.sortHand(daihinmin.hand);
            const toGive = daihinmin.hand.splice(-2);
            
            this.sortHand(daifugo.hand);
            const toReceive = daifugo.hand.splice(0, 2);
            
            daifugo.hand.push(...toGive);
            daihinmin.hand.push(...toReceive);
            
            this.log(`${daifugo.name}と${daihinmin.name}がカードを2枚交換しました`);
        }
        
        if (fugo && hinmin) {
            // 富豪⇔貧民: 1枚交換
            this.sortHand(hinmin.hand);
            const toGive = hinmin.hand.splice(-1);
            
            this.sortHand(fugo.hand);
            const toReceive = fugo.hand.splice(0, 1);
            
            fugo.hand.push(...toGive);
            hinmin.hand.push(...toReceive);
            
            this.log(`${fugo.name}と${hinmin.name}がカードを1枚交換しました`);
        }
        
        // 再ソート
        this.players.forEach(p => this.sortHand(p.hand));
    }
    
    getCardValue(rank) {
        const values = {
            '3': 1, '4': 2, '5': 3, '6': 4, '7': 5, '8': 6, '9': 7,
            '10': 8, 'J': 9, 'Q': 10, 'K': 11, 'A': 12, '2': 13
        };
        return values[rank] || 0;
    }
    
    sortHand(hand) {
        hand.sort((a, b) => {
            if (this.isRevolution !== this.isJBack) {
                return b.value - a.value; // 逆順
            }
            return a.value - b.value; // 通常
        });
    }
    
    nextTurn() {
        // 終了判定
        if (this.finishedPlayers.length >= 3) {
            this.endGame();
            return;
        }
        
        // 次のプレイヤーを探す
        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 4;
        } while (this.finishedPlayers.some(fp => fp.id === this.players[this.currentPlayerIndex].id));
        
        const currentPlayer = this.players[this.currentPlayerIndex];
        
        // パス済みプレイヤーチェック
        if (this.passedPlayers.size >= 3) {
            // 場を流す
            this.clearField();
        }
        
        this.updateUI();
        
        // CPUのターン
        if (currentPlayer.isCPU) {
            setTimeout(() => {
                this.cpuTurn(currentPlayer);
            }, 1000);
        }
    }
    
    cpuTurn(cpu) {
        const ai = new DaifugoAI(this, cpu);
        const action = ai.decideAction();
        
        if (action.type === 'pass') {
            this.log(`${cpu.name}がパスしました`);
            this.passedPlayers.add(cpu.id);
            this.nextTurn();
        } else if (action.type === 'play') {
            this.playCards(cpu, action.cards);
        }
    }
    
    handlePass() {
        if (this.field.length === 0) {
            alert('場にカードがないのでパスできません');
            return;
        }
        
        const player = this.players[this.currentPlayerIndex];
        this.log(`${player.name}がパスしました`);
        this.passedPlayers.add(player.id);
        this.nextTurn();
    }
    
    handlePlay() {
        if (this.selectedCards.length === 0) {
            alert('カードを選択してください');
            return;
        }
        
        const player = this.players[this.currentPlayerIndex];
        
        if (!this.canPlay(this.selectedCards)) {
            alert('そのカードは出せません');
            return;
        }
        
        this.playCards(player, this.selectedCards);
        this.selectedCards = [];
    }
    
    playCards(player, cards) {
        // 手札から削除
        cards.forEach(card => {
            const index = player.hand.findIndex(c => 
                c.suit === card.suit && c.rank === card.rank
            );
            if (index !== -1) {
                player.hand.splice(index, 1);
            }
        });
        
        // 場に追加
        this.lastPlayedCards = cards;
        this.field.push(...cards);
        
        this.log(`${player.name}が${this.describeCards(cards)}を出しました`);
        
        // パスリセット
        this.passedPlayers.clear();
        
        // 特殊効果判定
        this.checkSpecialEffects(cards);
        
        // 上がり判定
        if (player.hand.length === 0) {
            this.playerFinished(player);
            return;
        }
        
        // 縛り判定
        if (this.rules.shibari && this.field.length >= 2) {
            this.checkShibari();
        }
        
        this.nextTurn();
    }
    
    checkSpecialEffects(cards) {
        const isAll8 = cards.every(c => c.rank === '8');
        const isAll11 = cards.every(c => c.rank === 'J');
        const is4Cards = cards.length === 4;
        
        // 8切り
        if (this.rules.cut8 && isAll8) {
            this.log('8切り！場が流れました');
            this.clearField();
        }
        
        // 革命
        if (this.rules.revolution && is4Cards && cards.every(c => c.rank === cards[0].rank)) {
            this.isRevolution = !this.isRevolution;
            this.log(this.isRevolution ? '革命発動！' : '革命解除！');
            this.players.forEach(p => this.sortHand(p.hand));
        }
        
        // 11Back
        if (this.rules.jback && isAll11) {
            this.isJBack = !this.isJBack;
            this.log(this.isJBack ? '11Back発動！' : '11Back解除！');
            this.players.forEach(p => this.sortHand(p.hand));
        }
    }
    
    checkShibari() {
        if (this.field.length < 2) {
            this.shibariSuit = null;
            return;
        }
        
        const lastSuit = this.lastPlayedCards[0].suit;
        const prevCards = this.field.slice(0, -this.lastPlayedCards.length);
        
        if (prevCards.length > 0) {
            const prevSuit = prevCards[prevCards.length - 1].suit;
            if (lastSuit === prevSuit && lastSuit !== 'joker') {
                this.shibariSuit = lastSuit;
                this.log(`縛り発動！${this.getSuitName(lastSuit)}限定`);
            } else {
                this.shibariSuit = null;
            }
        }
    }
    
    getSuitName(suit) {
        const names = {
            'spade': 'スペード',
            'heart': 'ハート',
            'diamond': 'ダイヤ',
            'club': 'クラブ'
        };
        return names[suit] || suit;
    }
    
    clearField() {
        this.field = [];
        this.lastPlayedCards = [];
        this.shibariSuit = null;
        this.isJBack = false;
        this.updateUI();
    }
    
    playerFinished(player) {
        // 反則上がりチェック
        if (this.rules.forbidden) {
            const hasJoker = this.lastPlayedCards.some(c => c.rank === 'Joker');
            if (hasJoker) {
                this.log(`${player.name}は反則上がり！カードが戻されました`);
                player.hand.push(...this.lastPlayedCards);
                this.field.splice(-this.lastPlayedCards.length);
                this.sortHand(player.hand);
                this.nextTurn();
                return;
            }
        }
        
        this.finishedPlayers.push(player);
        this.log(`${player.name}が${this.finishedPlayers.length}位で上がりました！`);
        
        if (this.finishedPlayers.length >= 3) {
            this.endGame();
        } else {
            this.nextTurn();
        }
    }
    
    endGame() {
        // ランク決定
        const ranks = ['daifugo', 'fugo', 'hinmin', 'daihinmin'];
        this.finishedPlayers.forEach((player, index) => {
            player.rank = ranks[index];
        });
        
        // 最後のプレイヤー
        const lastPlayer = this.players.find(p => 
            !this.finishedPlayers.some(fp => fp.id === p.id)
        );
        if (lastPlayer) {
            lastPlayer.rank = 'daihinmin';
            
            // 都落ちチェック
            if (this.rules.miyakoochi && lastPlayer.rank === 'daifugo') {
                this.log(`${lastPlayer.name}は都落ち！`);
            }
        }
        
        this.log('--- ゲーム終了 ---');
        this.log(`大富豪: ${this.players.find(p => p.rank === 'daifugo').name}`);
        this.log(`富豪: ${this.players.find(p => p.rank === 'fugo').name}`);
        this.log(`貧民: ${this.players.find(p => p.rank === 'hinmin').name}`);
        this.log(`大貧民: ${this.players.find(p => p.rank === 'daihinmin').name}`);
        
        this.updateUI();
        this.showResultModal();
    }
    
    showResultModal() {
        const rankResultsDiv = document.getElementById('rankResults');
        const daifugo = this.players.find(p => p.rank === 'daifugo');
        const fugo = this.players.find(p => p.rank === 'fugo');
        const hinmin = this.players.find(p => p.rank === 'hinmin');
        const daihinmin = this.players.find(p => p.rank === 'daihinmin');
        
        rankResultsDiv.innerHTML = `
            <div style="font-size: 1.5rem; font-weight: 700; color: #ff1493; margin-bottom: 30px;">
                ${daifugo.id === 'player' ? '🎉 おめでとうございます！ 🎉' : 'ゲーム終了'}
            </div>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div style="padding: 15px; background: linear-gradient(135deg, #ffd700, #ffed4e); border-radius: 15px; font-size: 1.2rem; font-weight: 700; color: #8b4513;">
                    🥇 大富豪: ${daifugo.name}
                </div>
                <div style="padding: 15px; background: linear-gradient(135deg, #c0c0c0, #e8e8e8); border-radius: 15px; font-size: 1.1rem; font-weight: 600; color: #666;">
                    🥈 富豪: ${fugo.name}
                </div>
                <div style="padding: 15px; background: linear-gradient(135deg, #cd7f32, #e5a673); border-radius: 15px; font-size: 1rem; font-weight: 600; color: white;">
                    🥉 貧民: ${hinmin.name}
                </div>
                <div style="padding: 15px; background: linear-gradient(135deg, #696969, #909090); border-radius: 15px; font-size: 1rem; font-weight: 600; color: white;">
                    😢 大貧民: ${daihinmin.name}
                </div>
            </div>
        `;
        
        document.getElementById('resultModal').classList.add('show');
    }
    
    canPlay(cards) {
        if (cards.length === 0) return false;
        
        // 場が空なら何でもOK
        if (this.field.length === 0) return true;
        
        // Jokerが含まれている場合は常にOK（枚数が合っていれば）
        const hasJoker = cards.some(c => c.rank === 'Joker');
        if (hasJoker && cards.length === this.lastPlayedCards.length) {
            // 同じ枚数のJokerは常に出せる
            return true;
        }
        
        // 階段かどうかを判定
        const isPlayerSequence = this.isSequence(cards);
        const isLastSequence = this.isSequence(this.lastPlayedCards);
        
        // 枚数チェック
        if (cards.length !== this.lastPlayedCards.length) {
            // 階段同士でない限りfalse
            if (!isPlayerSequence || !isLastSequence) return false;
        }
        
        // 縛りチェック
        if (this.shibariSuit) {
            if (!cards.every(c => c.suit === this.shibariSuit || c.suit === 'joker')) {
                return false;
            }
        }
        
        // 階段でない場合は同じ数字チェック（Joker以外）
        if (!isPlayerSequence && !hasJoker) {
            const rank = cards[0].rank;
            if (!cards.every(c => c.rank === rank)) return false;
        }
        
        // 階段の場合は同じマークチェック（isSequenceで既にチェック済みだが念のため）
        if (isPlayerSequence) {
            const firstSuit = cards[0].suit;
            if (!cards.every(c => c.suit === firstSuit)) return false;
        }
        
        // 強さ比較
        return this.isStronger(cards, this.lastPlayedCards);
    }
    
    isSequence(cards) {
        if (!this.rules.sequence || cards.length < 3) return false;
        
        // Jokerが含まれている場合は階段ではない
        if (cards.some(c => c.rank === 'Joker')) return false;
        
        // 同じマークでなければ階段ではない
        const firstSuit = cards[0].suit;
        if (!cards.every(c => c.suit === firstSuit)) return false;
        
        const sorted = [...cards].sort((a, b) => a.value - b.value);
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i].value !== sorted[i-1].value + 1) return false;
        }
        return true;
    }
    
    isStronger(cards1, cards2) {
        // ジョーカーは最強
        if (cards1.some(c => c.rank === 'Joker')) return true;
        if (cards2.some(c => c.rank === 'Joker')) return false;
        
        const val1 = Math.max(...cards1.map(c => c.value));
        const val2 = Math.max(...cards2.map(c => c.value));
        
        const isReversed = this.isRevolution !== this.isJBack;
        
        return isReversed ? val1 < val2 : val1 > val2;
    }
    
    toggleCardSelection(card) {
        const index = this.selectedCards.findIndex(c => 
            c.suit === card.suit && c.rank === card.rank
        );
        
        if (index >= 0) {
            this.selectedCards.splice(index, 1);
        } else {
            this.selectedCards.push(card);
        }
        
        this.updateUI();
    }
    
    describeCards(cards) {
        if (cards.length === 1) {
            return `${this.getSuitName(cards[0].suit)}の${cards[0].rank}`;
        }
        if (this.isSequence(cards)) {
            return `${cards[0].rank}からの階段`;
        }
        return `${cards[0].rank}を${cards.length}枚`;
    }
    
    updateUI() {
        // CPUプレイヤー情報更新
        this.players.forEach((player, index) => {
            if (player.isCPU) {
                const cpuPlayer = document.getElementById(`${player.id}-player`);
                if (cpuPlayer) {
                    cpuPlayer.classList.toggle('current-turn', index === this.currentPlayerIndex);
                }
                
                const badge = document.getElementById(`${player.id}-badge`);
                if (badge) {
                    badge.textContent = player.hand.length;
                }
            } else {
                // プレイヤーエリア
                const playerArea = document.getElementById('player-area');
                if (playerArea) {
                    playerArea.classList.toggle('current-turn', index === this.currentPlayerIndex);
                }
                
                const rankSpan = document.getElementById('player-rank');
                if (rankSpan && player.rank) {
                    rankSpan.textContent = this.getRankName(player.rank);
                    rankSpan.className = `player-rank ${player.rank}`;
                } else if (rankSpan) {
                    rankSpan.textContent = '';
                    rankSpan.className = 'player-rank';
                }
            }
        });
        
        // プレイヤーの手札（扇状配置）
        const playerHandDiv = document.getElementById('playerHand');
        const player = this.players[0];
        playerHandDiv.innerHTML = '';
        
        const cardCount = player.hand.length;
        const maxAngle = Math.min(cardCount * 3, 45); // 最大45度
        const angleStep = cardCount > 1 ? maxAngle / (cardCount - 1) : 0;
        const startAngle = -maxAngle / 2;
        
        // 画面幅に応じたカード間隔調整
        const isMobile = window.innerWidth <= 600;
        const cardSpacing = isMobile ? 20 : 25;
        
        player.hand.forEach((card, i) => {
            const cardDiv = this.createCardElement(card);
            cardDiv.addEventListener('click', () => {
                if (this.currentPlayerIndex === 0) {
                    this.toggleCardSelection(card);
                }
            });
            
            if (this.selectedCards.some(c => c.suit === card.suit && c.rank === card.rank)) {
                cardDiv.classList.add('selected');
            }
            
            // 扇状配置の計算
            const angle = startAngle + (angleStep * i);
            const offsetX = i * cardSpacing - ((cardCount - 1) * cardSpacing) / 2; // 中央揃え
            const offsetY = Math.abs(angle) * 0.5; // 角度に応じた高さ調整
            
            cardDiv.style.transform = `translateX(${offsetX}px) translateY(${offsetY}px) rotate(${angle}deg)`;
            cardDiv.style.zIndex = i;
            
            playerHandDiv.appendChild(cardDiv);
        });
        
        // 場のカード
        const fieldCardsDiv = document.getElementById('fieldCards');
        fieldCardsDiv.innerHTML = '';
        
        if (this.field.length > 0) {
            this.lastPlayedCards.forEach(card => {
                const cardDiv = this.createCardElement(card);
                fieldCardsDiv.appendChild(cardDiv);
            });
        } else {
            fieldCardsDiv.innerHTML = '<div style="color: rgba(255,255,255,0.4); font-size: 0.9rem;">場にカードがありません</div>';
        }
        
        // ターン表示
        const turnDiv = document.getElementById('turnIndicator');
        const currentPlayer = this.players[this.currentPlayerIndex];
        turnDiv.textContent = `${currentPlayer.name}のターン`;
        
        // バッジ表示
        document.getElementById('revolution-badge').style.display = 
            this.isRevolution ? 'block' : 'none';
        document.getElementById('jback-badge').style.display = 
            this.isJBack ? 'block' : 'none';
        document.getElementById('shibari-badge').style.display = 
            this.shibariSuit ? 'block' : 'none';
        
        // ボタン状態
        const playBtn = document.getElementById('playBtn');
        const passBtn = document.getElementById('passBtn');
        
        const isPlayerTurn = this.currentPlayerIndex === 0;
        playBtn.disabled = !isPlayerTurn || this.selectedCards.length === 0 || 
                          !this.canPlay(this.selectedCards);
        passBtn.disabled = !isPlayerTurn || this.field.length === 0;
    }
    
    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `card ${card.suit}`;
        
        // 左上のコーナー
        const topCorner = document.createElement('div');
        topCorner.className = 'card-corner-top';
        const topRank = document.createElement('div');
        topRank.textContent = card.rank;
        const topSuit = document.createElement('div');
        topSuit.textContent = this.getSuitSymbol(card.suit);
        topCorner.appendChild(topRank);
        topCorner.appendChild(topSuit);
        
        // 中央の表示
        const rankDiv = document.createElement('div');
        rankDiv.className = 'card-rank';
        rankDiv.textContent = card.rank;
        
        const suitDiv = document.createElement('div');
        suitDiv.className = 'card-suit';
        suitDiv.textContent = this.getSuitSymbol(card.suit);
        
        // 右下のコーナー（上下反転）
        const bottomCorner = document.createElement('div');
        bottomCorner.className = 'card-corner-bottom';
        const bottomRank = document.createElement('div');
        bottomRank.textContent = card.rank;
        const bottomSuit = document.createElement('div');
        bottomSuit.textContent = this.getSuitSymbol(card.suit);
        bottomCorner.appendChild(bottomRank);
        bottomCorner.appendChild(bottomSuit);
        
        cardDiv.appendChild(topCorner);
        cardDiv.appendChild(rankDiv);
        cardDiv.appendChild(suitDiv);
        cardDiv.appendChild(bottomCorner);
        
        return cardDiv;
    }
    
    getSuitSymbol(suit) {
        const symbols = {
            'spade': '♠',
            'heart': '♥',
            'diamond': '♦',
            'club': '♣',
            'joker': '🃏'
        };
        return symbols[suit] || '';
    }
    
    getRankName(rank) {
        const names = {
            'daifugo': '大富豪',
            'fugo': '富豪',
            'hinmin': '貧民',
            'daihinmin': '大貧民'
        };
        return names[rank] || '';
    }
    
    log(message) {
        // ログ機能を削除（コンソールには出力）
        console.log(message);
    }
}

// ゲーム初期化
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new DaifugoGame();
});
