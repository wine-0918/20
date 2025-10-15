document.addEventListener("DOMContentLoaded", function () {
    let celebrationMode = false;
    let cooldownActive = false; // クールダウン状態の管理
    
    function updateCountdown() {
        const targetDate = new Date("2025-09-01T00:00:00").getTime();
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference > 0 && !celebrationMode) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            document.getElementById("timer").innerText =
                `${days}日 ${hours}時間 ${minutes}分 ${seconds}秒`;
        } else if (!celebrationMode) {
            document.getElementById("timer").innerText = "お祝いの日です！";
        }
    }

    function showCelebrationMessage() {
        celebrationMode = true;
        const timerElement = document.getElementById("timer");
        timerElement.innerHTML = `
            <div class="celebration-message">
                <div class="celebration-text">🎉 お祝いの日！ 🎉</div>
                <div class="celebration-subtext">ついに20歳だね！本当におめでとう！！！</div>
                <div class="celebration-emoji">これからもよろしくね！</div>
            </div>
        `;
        timerElement.classList.add('celebration-active');
        
        // 紙吹雪エフェクトを開始
        createConfetti();
    }

    function showCountdown() {
        celebrationMode = false;
        const timerElement = document.getElementById("timer");
        timerElement.classList.remove('celebration-active');
        updateCountdown();
    }

    // 紙吹雪エフェクト
    function createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#ffcc00', '#ff9a9e'];
        
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.top = '-10px';
                // サイズを統一して縦長を防ぐ
                const size = Math.random() * 6 + 8; // 8-14pxの範囲
                confetti.style.width = size + 'px';
                confetti.style.height = size + 'px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '9999';
                confetti.style.borderRadius = '50%'; // 全て円形にして統一
                confetti.style.animation = 'confettiFall ' + (Math.random() * 2 + 3) + 's linear forwards';
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.remove();
                    }
                }, 5000);
            }, i * 50);
        }
    }

    // ボタンイベントリスナー
    const celebrationBtn = document.getElementById('celebration-btn');
    if (celebrationBtn) {
        celebrationBtn.addEventListener('click', function() {
            // クールダウン中の場合は実行しない
            if (cooldownActive) {
                return;
            }
            
            // クールダウンを開始
            cooldownActive = true;
            celebrationBtn.disabled = true;
            celebrationBtn.style.opacity = '0.6';
            
            showCelebrationMessage();
            
            // 5秒後にカウントダウンに戻る
            setTimeout(showCountdown, 5000);
            
            // 8秒後にクールダウン解除
            setTimeout(() => {
                cooldownActive = false;
                celebrationBtn.disabled = false;
                celebrationBtn.textContent = '🎉 お祝いする';
                celebrationBtn.style.opacity = '1';
            }, 8000);
        });
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
});
