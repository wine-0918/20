// 大富豪 UI レンダリング（DOM操作専任）

class DaifugoUI {
    constructor(game) {
        this.game = game;
    }

    /** ゲーム画面全体を最新状態に更新 */
    update() {
        const g = this.game;

        // CPUプレイヤー情報
        g.players.forEach((player, index) => {
            if (player.isCPU) {
                const cpuEl = document.getElementById(`${player.id}-player`);
                if (cpuEl) cpuEl.classList.toggle('current-turn', index === g.currentPlayerIndex);
                const badge = document.getElementById(`${player.id}-badge`);
                if (badge) badge.textContent = player.hand.length;
            } else {
                const playerArea = document.getElementById('player-area');
                if (playerArea) playerArea.classList.toggle('current-turn', index === g.currentPlayerIndex);
                const rankSpan = document.getElementById('player-rank');
                if (rankSpan) {
                    if (player.rank) {
                        rankSpan.textContent = this.getRankName(player.rank);
                        rankSpan.className = `player-rank ${player.rank}`;
                    } else {
                        rankSpan.textContent = '';
                        rankSpan.className = 'player-rank';
                    }
                }
            }
        });

        // プレイヤー手札（扇状配置）
        const playerHandDiv = document.getElementById('playerHand');
        playerHandDiv.innerHTML = '';
        const player = g.players[0];
        const cardCount = player.hand.length;
        const maxAngle = Math.min(cardCount * 3, 45);
        const angleStep = cardCount > 1 ? maxAngle / (cardCount - 1) : 0;
        const startAngle = -maxAngle / 2;
        const cardSpacing = window.innerWidth <= 600 ? 20 : 25;

        player.hand.forEach((card, i) => {
            const cardDiv = this.createCardElement(card);
            cardDiv.addEventListener('click', () => {
                if (g.currentPlayerIndex === 0) g.toggleCardSelection(card);
            });
            if (g.selectedCards.some(c => c.suit === card.suit && c.rank === card.rank)) {
                cardDiv.classList.add('selected');
            }
            const angle = startAngle + angleStep * i;
            const offsetX = i * cardSpacing - ((cardCount - 1) * cardSpacing) / 2;
            const offsetY = Math.abs(angle) * 0.5;
            cardDiv.style.transform = `translateX(${offsetX}px) translateY(${offsetY}px) rotate(${angle}deg)`;
            cardDiv.style.zIndex = i;
            playerHandDiv.appendChild(cardDiv);
        });

        // 場のカード
        const fieldCardsDiv = document.getElementById('fieldCards');
        fieldCardsDiv.innerHTML = '';
        if (g.field.length > 0) {
            g.lastPlayedCards.forEach(card => fieldCardsDiv.appendChild(this.createCardElement(card)));
        } else {
            fieldCardsDiv.innerHTML = '<div style="color: rgba(255,255,255,0.4); font-size: 0.9rem;">場にカードがありません</div>';
        }

        // ターン表示
        document.getElementById('turnIndicator').textContent =
            `${g.players[g.currentPlayerIndex].name}のターン`;

        // 状態バッジ
        document.getElementById('revolution-badge').style.display = g.isRevolution ? 'block' : 'none';
        document.getElementById('jback-badge').style.display     = g.isJBack      ? 'block' : 'none';
        document.getElementById('shibari-badge').style.display   = g.shibariSuit  ? 'block' : 'none';

        // ボタン有効/無効
        const isPlayerTurn = g.currentPlayerIndex === 0;
        document.getElementById('playBtn').disabled =
            !isPlayerTurn || g.selectedCards.length === 0 || !g.canPlay(g.selectedCards);
        document.getElementById('passBtn').disabled =
            !isPlayerTurn || g.field.length === 0;
    }

    /** カードDOM要素を生成 */
    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `card ${card.suit}`;

        const topCorner = document.createElement('div');
        topCorner.className = 'card-corner-top';
        const topRank = document.createElement('div'); topRank.textContent = card.rank;
        const topSuit = document.createElement('div'); topSuit.textContent = this.getSuitSymbol(card.suit);
        topCorner.appendChild(topRank);
        topCorner.appendChild(topSuit);

        const rankDiv = document.createElement('div');
        rankDiv.className = 'card-rank';
        rankDiv.textContent = card.rank;

        const suitDiv = document.createElement('div');
        suitDiv.className = 'card-suit';
        suitDiv.textContent = this.getSuitSymbol(card.suit);

        const bottomCorner = document.createElement('div');
        bottomCorner.className = 'card-corner-bottom';
        const bottomRank = document.createElement('div'); bottomRank.textContent = card.rank;
        const bottomSuit = document.createElement('div'); bottomSuit.textContent = this.getSuitSymbol(card.suit);
        bottomCorner.appendChild(bottomRank);
        bottomCorner.appendChild(bottomSuit);

        cardDiv.appendChild(topCorner);
        cardDiv.appendChild(rankDiv);
        cardDiv.appendChild(suitDiv);
        cardDiv.appendChild(bottomCorner);
        return cardDiv;
    }

    /** 結果モーダルを表示 */
    showResultModal() {
        const g = this.game;
        const daifugo  = g.players.find(p => p.rank === 'daifugo');
        const fugo     = g.players.find(p => p.rank === 'fugo');
        const hinmin   = g.players.find(p => p.rank === 'hinmin');
        const daihinmin= g.players.find(p => p.rank === 'daihinmin');

        document.getElementById('rankResults').innerHTML = `
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

    /** カード配布アニメーション（Promiseで完了を通知） */
    animateCardDealing() {
        return new Promise((resolve) => {
            const totalCards = 53;
            const delayPerCard = 25;
            const animationDuration = 400;
            const playerAreas = [
                document.getElementById('player-area'),
                document.getElementById('cpu1-player'),
                document.getElementById('cpu2-player'),
                document.getElementById('cpu3-player')
            ];

            let cardIndex = 0;
            const dealInterval = setInterval(() => {
                if (cardIndex >= totalCards) {
                    clearInterval(dealInterval);
                    setTimeout(() => resolve(), animationDuration);
                    return;
                }
                const playerIndex = cardIndex % 4;
                const targetArea = playerAreas[playerIndex];
                const isPlayer = playerIndex === 0;
                if (targetArea) {
                    const cardWidth  = isPlayer ? 60 : 35;
                    const cardHeight = isPlayer ? 86 : 50;
                    const cardEl = document.createElement('div');
                    cardEl.className = 'card dealing';
                    cardEl.style.cssText = `
                        width: ${cardWidth}px; height: ${cardHeight}px;
                        background: linear-gradient(135deg, #dc143c 0%, #b91432 100%);
                        border: 2px solid #8b0000; border-radius: 4px;
                        position: fixed; top: 50%; left: 50%;
                        z-index: 1000; box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    `;
                    document.body.appendChild(cardEl);
                    setTimeout(() => {
                        const rect = targetArea.getBoundingClientRect();
                        cardEl.style.transition = `all ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                        cardEl.style.top  = rect.top  + rect.height / 2 + 'px';
                        cardEl.style.left = rect.left + rect.width  / 2 + 'px';
                        cardEl.style.opacity   = '0';
                        cardEl.style.transform = 'scale(0.2)';
                        setTimeout(() => cardEl.remove(), animationDuration);
                    }, 10);
                }
                cardIndex++;
            }, delayPerCard);
        });
    }

    // ── 表示用ユーティリティ ──────────────────────────────────────

    getSuitSymbol(suit) {
        return { spade: '♠', heart: '♥', diamond: '♦', club: '♣', joker: '🃏' }[suit] || '';
    }

    getSuitName(suit) {
        return { spade: 'スペード', heart: 'ハート', diamond: 'ダイヤ', club: 'クラブ' }[suit] || suit;
    }

    getRankName(rank) {
        return { daifugo: '大富豪', fugo: '富豪', hinmin: '貧民', daihinmin: '大貧民' }[rank] || '';
    }

    describeCards(cards) {
        if (cards.length === 1) return `${this.getSuitName(cards[0].suit)}の${cards[0].rank}`;
        if (DaifugoRules.isSequence(cards, this.game.rules)) return `${cards[0].rank}からの階段`;
        return `${cards[0].rank}を${cards.length}枚`;
    }
}
