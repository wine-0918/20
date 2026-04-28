// 大富豪ルール判定ロジック（DOM不使用・純粋ロジック）

class DaifugoRules {
    /**
     * 指定カードが出せるかどうかを判定する
     * @param {Array} cards - 出そうとしているカード配列
     * @param {Object} state - { lastPlayedCards, field, shibariSuit, rules, isRevolution, isJBack }
     */
    static canPlay(cards, { lastPlayedCards, field, shibariSuit, rules, isRevolution, isJBack }) {
        if (cards.length === 0) return false;

        // 場が空の場合：有効な組み合わせかチェック
        if (field.length === 0) {
            if (cards.length === 1) return true;
            const hasJoker = cards.some(c => c.rank === 'Joker');
            // 階段（同マーク連続）
            if (DaifugoRules.isSequence(cards, rules)) return true;
            // Jokerなし：全て同じ数字
            if (!hasJoker) {
                const rank = cards[0].rank;
                return cards.every(c => c.rank === rank);
            }
            // Jokerあり：Joker以外が全て同じ数字
            const nonJokers = cards.filter(c => c.rank !== 'Joker');
            if (nonJokers.length === 0) return true;
            const rank = nonJokers[0].rank;
            return nonJokers.every(c => c.rank === rank);
        }

        // Jokerが含まれている場合：枚数が合えば常に出せる
        const hasJoker = cards.some(c => c.rank === 'Joker');
        if (hasJoker && cards.length === lastPlayedCards.length) return true;

        const isPlayerSeq = DaifugoRules.isSequence(cards, rules);
        const isLastSeq   = DaifugoRules.isSequence(lastPlayedCards, rules);

        // 枚数は常に一致
        if (cards.length !== lastPlayedCards.length) return false;

        // 出す種類は一致（階段→階段、同数字→同数字の混在禁止）
        if (isPlayerSeq !== isLastSeq) return false;

        // 縛りチェック
        if (shibariSuit) {
            if (!cards.every(c => c.suit === shibariSuit || c.suit === 'joker')) return false;
        }

        // Jokerなし・非階段：全て同じ数字
        if (!isPlayerSeq && !hasJoker) {
            const rank = cards[0].rank;
            if (!cards.every(c => c.rank === rank)) return false;
        }

        // 強さ比較
        return DaifugoRules.isStronger(cards, lastPlayedCards, isRevolution, isJBack);
    }

    /**
     * 階段（同マーク・連続数字・3枚以上）かどうか
     */
    static isSequence(cards, rules) {
        if (!rules || !rules.sequence || cards.length < 3) return false;
        if (cards.some(c => c.rank === 'Joker')) return false;
        const firstSuit = cards[0].suit;
        if (!cards.every(c => c.suit === firstSuit)) return false;
        const sorted = [...cards].sort((a, b) => a.value - b.value);
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i].value !== sorted[i - 1].value + 1) return false;
        }
        return true;
    }

    /**
     * cards1 が cards2 より強いかどうか
     */
    static isStronger(cards1, cards2, isRevolution, isJBack) {
        if (cards1.some(c => c.rank === 'Joker')) return true;
        if (cards2.some(c => c.rank === 'Joker')) return false;
        const val1 = Math.max(...cards1.map(c => c.value));
        const val2 = Math.max(...cards2.map(c => c.value));
        const isReversed = isRevolution !== isJBack;
        return isReversed ? val1 < val2 : val1 > val2;
    }

    /**
     * カードランクから強さ数値を取得
     */
    static getCardValue(rank) {
        const values = {
            '3': 1, '4': 2, '5': 3, '6': 4, '7': 5,
            '8': 6, '9': 7, '10': 8, 'J': 9, 'Q': 10,
            'K': 11, 'A': 12, '2': 13
        };
        return values[rank] || 0;
    }
}
