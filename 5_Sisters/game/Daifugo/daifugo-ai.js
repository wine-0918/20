// 大富豪AIロジック

class DaifugoAI {
    constructor(game, player) {
        this.game = game;
        this.player = player;
        this.difficulty = player.difficulty; // 0:普通, 1:強い, 2:恐怖, 3:ぬぬぬ
    }
    
    decideAction() {
        // 場が空の場合
        if (this.game.field.length === 0) {
            return this.playFirstCard();
        }
        
        // 出せるカードを探す
        const playableCards = this.findPlayableCards();
        
        if (playableCards.length === 0) {
            return { type: 'pass' };
        }
        
        // 難易度別の判断
        switch (this.difficulty) {
            case 0:
                return this.normalStrategy(playableCards);
            case 1:
                return this.strongStrategy(playableCards);
            case 2:
                return this.terrorStrategy(playableCards);
            case 3:
                return this.nununuStrategy(playableCards);
            default:
                return this.normalStrategy(playableCards);
        }
    }
    
    // 普通: ランダムまたは弱いカードを出す
    normalStrategy(playableCards) {
        // 30%でパス
        if (Math.random() < 0.3 && this.game.passedPlayers.size < 2) {
            return { type: 'pass' };
        }
        
        // 弱いカードから選ぶ
        const weakCards = playableCards.slice(0, Math.min(3, playableCards.length));
        const selected = weakCards[Math.floor(Math.random() * weakCards.length)];
        
        return { type: 'play', cards: selected };
    }
    
    // 強い: 適切なカードを選択
    strongStrategy(playableCards) {
        // 残り枚数が少ない場合は積極的に
        if (this.player.hand.length <= 3) {
            return { type: 'play', cards: playableCards[0] };
        }
        
        // 他プレイヤーの残り枚数をチェック
        const minHandCount = Math.min(...this.game.players
            .filter(p => !this.game.finishedPlayers.some(fp => fp.id === p.id))
            .map(p => p.hand.length));
        
        // 誰かが上がりそうなら強いカードを出す
        if (minHandCount <= 2) {
            const strongCards = playableCards.slice(-Math.min(3, playableCards.length));
            return { type: 'play', cards: strongCards[strongCards.length - 1] };
        }
        
        // 弱めのカードを出す
        const midIndex = Math.floor(playableCards.length / 3);
        return { type: 'play', cards: playableCards[midIndex] };
    }
    
    // 恐怖: 戦略的に最適な選択
    terrorStrategy(playableCards) {
        const handCount = this.player.hand.length;
        
        // 残り枚数に応じた戦略
        if (handCount === 1) {
            return { type: 'play', cards: playableCards[0] };
        }
        
        if (handCount <= 3) {
            // 連番や同じ数字をまとめて出せるかチェック
            const combo = this.findBestCombo();
            if (combo) {
                return { type: 'play', cards: combo };
            }
            
            return { type: 'play', cards: playableCards[0] };
        }
        
        // 革命を狙う
        if (this.game.rules.revolution && handCount > 8) {
            const revolution = this.findRevolution();
            if (revolution && this.game.field.length === 0) {
                return { type: 'play', cards: revolution };
            }
        }
        
        // 8切りで場を流す
        if (this.game.rules.cut8) {
            const eightCut = this.find8Cut();
            if (eightCut && this.shouldClearField()) {
                return { type: 'play', cards: eightCut };
            }
        }
        
        // 中程度の強さのカードを出す
        const midIndex = Math.floor(playableCards.length / 2);
        return { type: 'play', cards: playableCards[midIndex] };
    }
    
    // ぬぬぬ: 最短ルートで勝ちに来る最強AI
    nununuStrategy(playableCards) {
        const handCount = this.player.hand.length;
        
        // 完璧な上がり戦略
        const perfectPlay = this.calculatePerfectPlay();
        if (perfectPlay) {
            return { type: 'play', cards: perfectPlay };
        }
        
        // 残り枚数が少ない場合の最適解
        if (handCount <= 5) {
            const optimalPlay = this.findOptimalEndGame(playableCards);
            return { type: 'play', cards: optimalPlay };
        }
        
        // 革命判断（手札が不利な時のみ）
        if (this.game.rules.revolution && this.shouldTriggerRevolution()) {
            const revolution = this.findRevolution();
            if (revolution) {
                return { type: 'play', cards: revolution };
            }
        }
        
        // 連番・ペアの効率的な使用
        const efficientPlay = this.findMostEfficientPlay(playableCards);
        if (efficientPlay) {
            return { type: 'play', cards: efficientPlay };
        }
        
        // 他プレイヤーを止めるための戦略
        const blockingPlay = this.findBlockingPlay(playableCards);
        if (blockingPlay) {
            return { type: 'play', cards: blockingPlay };
        }
        
        // デフォルトは最適なカードを選択
        return { type: 'play', cards: this.selectBestCard(playableCards) };
    }
    
    // === ヘルパーメソッド ===
    
    playFirstCard() {
        // 最初のカードを出す
        const hand = this.player.hand;
        
        // 革命を狙う（ぬぬぬ・恐怖のみ）
        if (this.difficulty >= 2 && this.game.rules.revolution) {
            const revolution = this.findRevolution();
            if (revolution && this.shouldTriggerRevolution()) {
                return { type: 'play', cards: revolution };
            }
        }
        
        // 連番を出す
        if (this.game.rules.sequence) {
            const sequence = this.findLongestSequence();
            if (sequence && sequence.length >= 3) {
                return { type: 'play', cards: sequence };
            }
        }
        
        // ペアや3枚を出す
        const pairs = this.findPairs();
        if (pairs.length > 0 && this.difficulty >= 1) {
            return { type: 'play', cards: pairs[0] };
        }
        
        // 弱いカードを1枚出す
        return { type: 'play', cards: [hand[0]] };
    }
    
    findPlayableCards() {
        const result = [];
        const lastCount = this.game.lastPlayedCards.length;
        
        // 単一カードまたはペア
        const grouped = this.groupByRank();
        for (const [rank, cards] of Object.entries(grouped)) {
            for (let count = 1; count <= Math.min(cards.length, 4); count++) {
                if (count === lastCount || lastCount === 1) {
                    const testCards = cards.slice(0, count);
                    if (this.game.canPlay(testCards)) {
                        result.push(testCards);
                    }
                }
            }
        }
        
        // 連番
        if (this.game.rules.sequence && lastCount >= 3) {
            const sequences = this.findAllSequences(lastCount);
            sequences.forEach(seq => {
                if (this.game.canPlay(seq)) {
                    result.push(seq);
                }
            });
        }
        
        // 強さでソート
        result.sort((a, b) => {
            const valA = Math.max(...a.map(c => c.value));
            const valB = Math.max(...b.map(c => c.value));
            return valA - valB;
        });
        
        return result;
    }
    
    groupByRank() {
        const grouped = {};
        this.player.hand.forEach(card => {
            if (!grouped[card.rank]) {
                grouped[card.rank] = [];
            }
            grouped[card.rank].push(card);
        });
        return grouped;
    }
    
    findPairs() {
        const grouped = this.groupByRank();
        const pairs = [];
        
        for (const [rank, cards] of Object.entries(grouped)) {
            if (cards.length >= 2) {
                pairs.push(cards.slice(0, 2));
            }
        }
        
        return pairs;
    }
    
    findRevolution() {
        const grouped = this.groupByRank();
        
        for (const [rank, cards] of Object.entries(grouped)) {
            if (cards.length >= 4) {
                return cards.slice(0, 4);
            }
        }
        
        return null;
    }
    
    find8Cut() {
        const eights = this.player.hand.filter(c => c.rank === '8');
        if (eights.length > 0 && this.game.lastPlayedCards.length === 1) {
            return [eights[0]];
        }
        return null;
    }
    
    findLongestSequence() {
        const sorted = [...this.player.hand].sort((a, b) => a.value - b.value);
        let longest = [];
        let current = [sorted[0]];
        
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i].value === sorted[i-1].value + 1) {
                current.push(sorted[i]);
            } else {
                if (current.length > longest.length) {
                    longest = current;
                }
                current = [sorted[i]];
            }
        }
        
        if (current.length > longest.length) {
            longest = current;
        }
        
        return longest.length >= 3 ? longest : null;
    }
    
    findAllSequences(length) {
        const sequences = [];
        const sorted = [...this.player.hand].sort((a, b) => a.value - b.value);
        
        for (let i = 0; i <= sorted.length - length; i++) {
            const seq = [sorted[i]];
            for (let j = i + 1; j < sorted.length && seq.length < length; j++) {
                if (sorted[j].value === seq[seq.length - 1].value + 1) {
                    seq.push(sorted[j]);
                }
            }
            if (seq.length === length) {
                sequences.push(seq);
            }
        }
        
        return sequences;
    }
    
    shouldClearField() {
        // 他のプレイヤーが有利な時に場を流す
        const opponents = this.game.players.filter(p => 
            p.id !== this.player.id && 
            !this.game.finishedPlayers.some(fp => fp.id === p.id)
        );
        
        return opponents.some(p => p.hand.length <= 3);
    }
    
    shouldTriggerRevolution() {
        const isReversed = this.game.isRevolution !== this.game.isJBack;
        
        // 手札が弱い時に革命を起こす
        const avgValue = this.player.hand.reduce((sum, c) => sum + c.value, 0) / 
                        this.player.hand.length;
        
        return isReversed ? avgValue > 7 : avgValue < 7;
    }
    
    calculatePerfectPlay() {
        // 完璧な上がり手順を計算（ぬぬぬ専用）
        // シミュレーションで最短手順を見つける
        // 簡略版: 実装省略
        return null;
    }
    
    findOptimalEndGame(playableCards) {
        // 残り数枚の時の最適なカード選択
        if (playableCards.length === 0) return null;
        
        // 一番確実に出せるカードを選ぶ
        return playableCards[Math.floor(playableCards.length / 2)];
    }
    
    findMostEfficientPlay(playableCards) {
        // 一番効率的なカードの組み合わせを見つける
        // ペアや連番を優先
        const pairs = playableCards.filter(cards => cards.length >= 2);
        if (pairs.length > 0) {
            return pairs[0];
        }
        
        return null;
    }
    
    findBlockingPlay(playableCards) {
        // 他プレイヤーを妨害するためのカード選択
        const opponents = this.game.players.filter(p => 
            p.id !== this.player.id && 
            !this.game.finishedPlayers.some(fp => fp.id === p.id)
        );
        
        const dangerousOpponent = opponents.find(p => p.hand.length <= 2);
        
        if (dangerousOpponent) {
            // 強いカードを出して妨害
            return playableCards[playableCards.length - 1];
        }
        
        return null;
    }
    
    selectBestCard(playableCards) {
        if (playableCards.length === 0) return null;
        
        // 中程度の強さのカードを選ぶ
        const index = Math.floor(playableCards.length / 2);
        return playableCards[index];
    }
    
    findBestCombo() {
        // 手札の中で最適な組み合わせを見つける
        const sequences = this.findAllSequences(this.game.lastPlayedCards.length);
        if (sequences.length > 0) {
            return sequences[0];
        }
        
        const pairs = this.findPairs();
        if (pairs.length > 0 && pairs[0].length === this.game.lastPlayedCards.length) {
            return pairs[0];
        }
        
        return null;
    }
}
