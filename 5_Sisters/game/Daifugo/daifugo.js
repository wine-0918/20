// 大富豪ゲームメインロジック
// 依存: daifugo-rules.js (DaifugoRules), daifugo-ui.js (DaifugoUI), daifugo-ai.js (DaifugoAI)

class DaifugoGame {
    constructor() {
        this.players = [
            { id: 'player', name: 'あなた', hand: [], rank: null, isCPU: false },
            { id: 'cpu1',   name: 'CPU1',   hand: [], rank: null, isCPU: true, difficulty: 1 },
            { id: 'cpu2',   name: 'CPU2',   hand: [], rank: null, isCPU: true, difficulty: 1 },
            { id: 'cpu3',   name: 'CPU3',   hand: [], rank: null, isCPU: true, difficulty: 1 }
        ];

        this.currentPlayerIndex = 0;
        this.field              = [];
        this.lastPlayedCards    = [];
        this.selectedCards      = [];
        this.passedPlayers      = new Set();
        this.finishedPlayers    = [];

        this.isRevolution = false;
        this.isJBack      = false;
        this.shibariSuit  = null;

        this.rules = {
            cut8: true, revolution: true, jback: true,
            sequence: true, shibari: true, miyakoochi: true, forbidden: true
        };

        this.ui = new DaifugoUI(this);
        this.init();
    }

    // ── 初期化 ────────────────────────────────────────────────────

    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.startGame();
    }

    setupEventListeners() {
        document.getElementById('passBtn').addEventListener('click', () => this.handlePass());
        document.getElementById('playBtn').addEventListener('click', () => this.handlePlay());
        document.getElementById('replayBtn').addEventListener('click', () => {
            location.href = 'daifugo-setup.html';
        });
        document.getElementById('backToTitleBtn').addEventListener('click', () => {
            location.href = '../../html/game_selection.html';
        });
    }

    loadSettings() {
        const saved = localStorage.getItem('daifugoSettings');
        if (!saved) return;
        const settings = JSON.parse(saved);
        Object.assign(this.rules, settings.rules);
        this.players[1].difficulty = settings.cpuDifficulty.cpu1;
        this.players[2].difficulty = settings.cpuDifficulty.cpu2;
        this.players[3].difficulty = settings.cpuDifficulty.cpu3;
    }

    // ── ゲーム開始・カード配布 ────────────────────────────────────

    startGame() {
        console.log('ゲーム開始！');
        if (this.players.every(p => p.rank === null)) {
            this.currentPlayerIndex = Math.floor(Math.random() * 4);
        } else {
            this.currentPlayerIndex = this.players.findIndex(p => p.rank === 'daihinmin');
            if (this.currentPlayerIndex === -1) this.currentPlayerIndex = 0;
        }
        this.dealCardsWithAnimation();
    }

    async dealCardsWithAnimation() {
        // ① 状態リセット（ランク情報は player.rank に残したまま）
        this.field           = [];
        this.lastPlayedCards = [];
        this.selectedCards   = [];
        this.passedPlayers.clear();
        this.finishedPlayers = [];
        this.isRevolution    = false;  // ★ exchangeCards前にリセット（sortHandの強弱が正しくなる）
        this.isJBack         = false;
        this.shibariSuit     = null;

        // ② カードを配る（手札が埋まる）
        this.dealCards();

        // ③ カード交換（2ゲーム目以降：手札が埋まった後に実施）
        if (this.players.some(p => p.rank !== null)) this.exchangeCards();

        this.ui.update();
        await this.ui.animateCardDealing();
        this.nextTurn();
    }

    dealCards() {
        const deck  = [];
        const suits = ['spade', 'heart', 'diamond', 'club'];
        const ranks = ['3','4','5','6','7','8','9','10','J','Q','K','A','2'];
        for (const suit of suits) {
            for (const rank of ranks) {
                deck.push({ suit, rank, value: DaifugoRules.getCardValue(rank) });
            }
        }
        deck.push({ suit: 'joker', rank: 'Joker', value: 15 });

        // Fisher-Yates シャッフル
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        this.players.forEach(player => {
            player.hand = deck.splice(0, 13);
            this.sortHand(player.hand);
        });
        if (deck.length > 0) {
            this.players[0].hand.push(...deck);
            this.sortHand(this.players[0].hand);
        }
    }

    exchangeCards() {
        const daifugo  = this.players.find(p => p.rank === 'daifugo');
        const daihinmin= this.players.find(p => p.rank === 'daihinmin');
        const fugo     = this.players.find(p => p.rank === 'fugo');
        const hinmin   = this.players.find(p => p.rank === 'hinmin');

        if (daifugo && daihinmin) {
            this.sortHand(daihinmin.hand);
            const toGive    = daihinmin.hand.splice(-2);
            this.sortHand(daifugo.hand);
            const toReceive = daifugo.hand.splice(0, 2);
            daifugo.hand.push(...toGive);
            daihinmin.hand.push(...toReceive);
            console.log(`${daifugo.name}と${daihinmin.name}が2枚交換`);
        }
        if (fugo && hinmin) {
            this.sortHand(hinmin.hand);
            const toGive    = hinmin.hand.splice(-1);
            this.sortHand(fugo.hand);
            const toReceive = fugo.hand.splice(0, 1);
            fugo.hand.push(...toGive);
            hinmin.hand.push(...toReceive);
            console.log(`${fugo.name}と${hinmin.name}が1枚交換`);
        }
        this.players.forEach(p => this.sortHand(p.hand));
    }

    sortHand(hand) {
        const reversed = this.isRevolution !== this.isJBack;
        hand.sort((a, b) => reversed ? b.value - a.value : a.value - b.value);
    }

    // ── ターン管理 ────────────────────────────────────────────────

    nextTurn() {
        if (this.finishedPlayers.length >= 3) {
            this.endGame();
            return;
        }

        // 上がっているプレイヤーを飛ばして次へ
        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 4;
        } while (this.finishedPlayers.some(fp => fp.id === this.players[this.currentPlayerIndex].id));

        // アクティブプレイヤー全員がパスしたら場を流す
        const activeCount = this.players.filter(p =>
            !this.finishedPlayers.some(fp => fp.id === p.id)
        ).length;
        if (this.passedPlayers.size >= activeCount - 1) {
            this.clearField();
        }

        this.ui.update();

        const currentPlayer = this.players[this.currentPlayerIndex];
        if (currentPlayer.isCPU) {
            setTimeout(() => this.cpuTurn(currentPlayer), 1000);
        }
    }

    cpuTurn(cpu) {
        const ai     = new DaifugoAI(this, cpu);
        const action = ai.decideAction();
        if (action.type === 'pass') {
            console.log(`${cpu.name}がパスしました`);
            this.passedPlayers.add(cpu.id);
            this.nextTurn();
        } else {
            this.playCards(cpu, action.cards);
        }
    }

    // ── プレイヤー操作ハンドラ ────────────────────────────────────

    handlePass() {
        if (this.field.length === 0) {
            alert('場にカードがないのでパスできません');
            return;
        }
        const player = this.players[this.currentPlayerIndex];
        console.log(`${player.name}がパスしました`);
        this.passedPlayers.add(player.id);
        this.nextTurn();
    }

    handlePlay() {
        if (this.selectedCards.length === 0) {
            alert('カードを選択してください');
            return;
        }
        if (!this.canPlay(this.selectedCards)) {
            alert('そのカードは出せません');
            return;
        }
        const player = this.players[this.currentPlayerIndex];
        this.playCards(player, this.selectedCards);
        this.selectedCards = [];
    }

    toggleCardSelection(card) {
        const index = this.selectedCards.findIndex(c => c.suit === card.suit && c.rank === card.rank);
        if (index >= 0) {
            this.selectedCards.splice(index, 1);
        } else {
            this.selectedCards.push(card);
        }
        this.ui.update();
    }

    // ── カードを出す ──────────────────────────────────────────────

    playCards(player, cards) {
        // 手札から削除
        cards.forEach(card => {
            const index = player.hand.findIndex(c => c.suit === card.suit && c.rank === card.rank);
            if (index !== -1) player.hand.splice(index, 1);
        });

        this.lastPlayedCards = cards;
        this.field.push(...cards);
        console.log(`${player.name}が${this.ui.describeCards(cards)}を出しました`);

        this.passedPlayers.clear();
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

        // ★ 8切り: 8を出した場合は常に同じプレイヤーが続けて出す（空場含む）
        if (this.rules.cut8 && cards.every(c => c.rank === '8')) {
            this.ui.update();
            if (player.isCPU) setTimeout(() => this.cpuTurn(player), 1000);
            return;
        }

        this.nextTurn();
    }

    // ── 特殊ルール処理 ────────────────────────────────────────────

    checkSpecialEffects(cards) {
        const isAll8   = cards.every(c => c.rank === '8');
        const isAll11  = cards.every(c => c.rank === 'J');
        const is4Same  = cards.length === 4 && cards.every(c => c.rank === cards[0].rank);

        if (this.rules.cut8 && isAll8) {
            console.log('8切り！場が流れました');
            this.clearField();
        }
        if (this.rules.revolution && is4Same) {
            this.isRevolution = !this.isRevolution;
            console.log(this.isRevolution ? '革命発動！' : '革命解除！');
            this.players.forEach(p => this.sortHand(p.hand));
        }
        if (this.rules.jback && isAll11) {
            this.isJBack = !this.isJBack;
            console.log(this.isJBack ? '11Back発動！' : '11Back解除！');
            this.players.forEach(p => this.sortHand(p.hand));
        }
    }

    checkShibari() {
        if (this.field.length < 2) { this.shibariSuit = null; return; }
        const prevCards = this.field.slice(0, -this.lastPlayedCards.length);
        if (prevCards.length === 0) return;
        const lastSuit = this.lastPlayedCards[0].suit;
        const prevSuit = prevCards[prevCards.length - 1].suit;
        if (lastSuit === prevSuit && lastSuit !== 'joker') {
            this.shibariSuit = lastSuit;
            console.log(`縛り発動！${this.ui.getSuitName(lastSuit)}限定`);
        } else {
            this.shibariSuit = null;
        }
    }

    clearField() {
        this.field           = [];
        this.lastPlayedCards = [];
        this.shibariSuit     = null;
        this.isJBack         = false;
        this.passedPlayers.clear();
    }

    // ── 上がり・ゲーム終了 ────────────────────────────────────────

    playerFinished(player) {
        // ★ 反則上がりチェック（Jokerのみで上がり禁止）
        if (this.rules.forbidden && this.lastPlayedCards.some(c => c.rank === 'Joker')) {
            console.log(`${player.name}は反則上がり！カードが戻されました`);
            player.hand.push(...this.lastPlayedCards);
            this.sortHand(player.hand);
            // lastPlayedCards が無効になるため場をリセット
            this.clearField();
            this.nextTurn();
            return;
        }

        this.finishedPlayers.push(player);
        console.log(`${player.name}が${this.finishedPlayers.length}位で上がりました！`);

        if (this.finishedPlayers.length >= 3) {
            this.endGame();
        } else {
            this.nextTurn();
        }
    }

    endGame() {
        const ranks = ['daifugo', 'fugo', 'hinmin', 'daihinmin'];
        this.finishedPlayers.forEach((player, i) => { player.rank = ranks[i]; });

        const lastPlayer = this.players.find(p =>
            !this.finishedPlayers.some(fp => fp.id === p.id)
        );
        if (lastPlayer) {
            const prevRank = lastPlayer.rank;
            lastPlayer.rank = 'daihinmin';
            if (this.rules.miyakoochi && prevRank === 'daifugo') {
                console.log(`${lastPlayer.name}は都落ち！`);
            }
        }

        console.log('--- ゲーム終了 ---');
        console.log(`大富豪: ${this.players.find(p => p.rank === 'daifugo').name}`);
        console.log(`富豪:   ${this.players.find(p => p.rank === 'fugo').name}`);
        console.log(`貧民:   ${this.players.find(p => p.rank === 'hinmin').name}`);
        console.log(`大貧民: ${this.players.find(p => p.rank === 'daihinmin').name}`);

        this.ui.update();
        this.ui.showResultModal();
    }

    // ── ルール判定（DaifugoRulesへ委譲） ─────────────────────────

    canPlay(cards) {
        return DaifugoRules.canPlay(cards, {
            lastPlayedCards: this.lastPlayedCards,
            field:           this.field,
            shibariSuit:     this.shibariSuit,
            rules:           this.rules,
            isRevolution:    this.isRevolution,
            isJBack:         this.isJBack
        });
    }

    isSequence(cards) {
        return DaifugoRules.isSequence(cards, this.rules);
    }
}

// ゲーム初期化
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new DaifugoGame();
});
