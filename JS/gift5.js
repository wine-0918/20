/* アナグラムクイズゲーム JavaScript */
document.addEventListener("DOMContentLoaded", function () {
    // ゲーム要素の取得
    const startBtn = document.getElementById('start-btn');
    const gameArea = document.getElementById('game-area');
    const gameMessage = document.getElementById('game-message');
    const scrambledWord = document.getElementById('scrambled-word');
    const answerInput = document.getElementById('answer-input');
    const answerSubmit = document.getElementById('answer-submit');
    const answerResult = document.getElementById('answer-result');
    const hintBtn = document.getElementById('hint-btn');
    const hintText = document.getElementById('hint-text');
    const nextBtn = document.getElementById('next-btn');
    const resetBtn = document.getElementById('reset-btn');
    const openGiftSection = document.querySelector('.open-gift-section');
    const openGiftBtn = document.getElementById('open-gift-btn');
    const giftReveal = document.querySelector('.gift-reveal');

    // 問題データ（単語、ヒント）- 9問用意
    const allProblems = [
        { word: 'きめつのやいば', hint: '大正時代が舞台の人気アニメ・漫画' },
        { word: 'ろくしゅうねん', hint: '今年で何周年？' },
        { word: 'じゃがりこ', hint: 'カルビーの人気スナック菓子' },
        { word: 'ごとうぶんのはなよめ', hint: '五つ子姉妹が登場するラブコメ漫画・アニメ' },
        { word: 'みずいろ', hint: '空や海のような薄い青色' },
        { word: 'にのみやかずなり', hint: '嵐のメンバーの一人' },
        { word: 'とらんぷ', hint: 'カードゲームの定番、52枚のカード🃏' },
        { word: 'のーとぱそこん', hint: '持ち運びできるコンピューター💻' },
        { word: 'すぷらとぅーん', hint: '任天堂の人気シューティングゲーム🦑' }
    ];

    let problems = []; // ランダムに選ばれた問題を格納
    let currentProblemIndex = 0;
    let solvedProblems = 0;
    let gameStarted = false;

    // 配列をシャッフルする関数
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    // ランダムに5問を選択する関数
    function selectRandomProblems() {
        const shuffled = shuffleArray(allProblems);
        problems = shuffled.slice(0, 5); // 9問の中からランダムに5問選択
    }

    // 文字列をシャッフルする関数
    function shuffleString(str) {
        const array = str.split('');
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array.join('');
    }

    // 新しい問題を表示する関数
    function displayProblem() {
        const currentProblem = problems[currentProblemIndex];
        let shuffled = shuffleString(currentProblem.word);
        
        // 元の単語と同じになった場合は再シャッフル
        while (shuffled === currentProblem.word) {
            shuffled = shuffleString(currentProblem.word);
        }
        
        scrambledWord.textContent = shuffled;
        gameMessage.textContent = `問題 ${currentProblemIndex + 1}/${problems.length}`;
        
        // 入力フィールドとボタンをリセット
        answerInput.value = '';
        answerResult.textContent = '';
        answerResult.className = 'answer-result';
        hintText.classList.add('hidden');
        nextBtn.classList.add('hidden');
        
        // ボタンを有効化
        answerSubmit.disabled = false;
        hintBtn.disabled = false;
        answerInput.disabled = false;
    }

    // ゲーム開始
    startBtn.addEventListener('click', function() {
        gameStarted = true;
        startBtn.classList.add('hidden');
        gameArea.classList.remove('hidden');
        resetBtn.classList.remove('hidden');
        
        // ランダムに5問選択
        selectRandomProblems();
        currentProblemIndex = 0;
        solvedProblems = 0;
        displayProblem();
    });

    // 答えをチェックする関数
    function checkAnswer() {
        const userAnswer = answerInput.value.trim().toLowerCase();
        const correctAnswer = problems[currentProblemIndex].word.toLowerCase();
        
        if (userAnswer === correctAnswer) {
            answerResult.textContent = '🎉 正解！';
            answerResult.className = 'answer-result correct';
            solvedProblems++;
            
            // ボタンを無効化
            answerSubmit.disabled = true;
            hintBtn.disabled = true;
            answerInput.disabled = true;
            
            if (currentProblemIndex < problems.length - 1) {
                nextBtn.classList.remove('hidden');
            } else {
                // 全問正解
                setTimeout(() => {
                    gameMessage.textContent = '🎊 全問正解！さすが';
                    openGiftSection.classList.remove('hidden');
                }, 1000);
            }
        } else {
            answerResult.textContent = '❌ 違いますぬ。';
            answerResult.className = 'answer-result incorrect';
            answerInput.value = '';
        }
    }

    // 答えボタンのクリックイベント
    answerSubmit.addEventListener('click', checkAnswer);

    // Enterキーでも答えられるように
    answerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });

    // ヒントボタンのクリックイベント
    hintBtn.addEventListener('click', function() {
        hintText.textContent = `💡 ヒント: ${problems[currentProblemIndex].hint}`;
        hintText.classList.remove('hidden');
    });

    // 次の問題ボタンのクリックイベント
    nextBtn.addEventListener('click', function() {
        currentProblemIndex++;
        displayProblem();
    });

    // リセットボタンのクリックイベント
    resetBtn.addEventListener('click', function() {
        gameStarted = false;
        currentProblemIndex = 0;
        solvedProblems = 0;
        problems = []; // 問題配列もリセット
        
        // UI をリセット
        startBtn.classList.remove('hidden');
        gameArea.classList.add('hidden');
        resetBtn.classList.add('hidden');
        openGiftSection.classList.add('hidden');
        giftReveal.classList.add('hidden');
        
        gameMessage.textContent = 'スタートボタンを押してゲーム開始！';
    });

    // プレゼント開封ボタンのクリックイベント
    openGiftBtn.addEventListener('click', function() {
        openGiftSection.classList.add('hidden');
        giftReveal.classList.remove('hidden');
        
        // 紙吹雪エフェクト
        createConfetti();
    });

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
});
