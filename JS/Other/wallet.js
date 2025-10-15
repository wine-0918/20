/* お財布ページ JavaScript */
document.addEventListener('DOMContentLoaded', function() {
    // チケット使用ボタンの処理
    const useTicketBtns = document.querySelectorAll('.use-ticket-btn');
    const detailsBtns = document.querySelectorAll('.details-btn');
    
    useTicketBtns.forEach((btn, index) => {
        if (!btn.disabled) {
            btn.addEventListener('click', function() {
                const ticketCard = this.closest('.ticket-card');
                const ticketNumber = ticketCard.querySelector('.ticket-number').textContent;
                const ticketTitle = ticketCard.querySelector('h4').textContent;
                
                if (confirm(`${ticketTitle}（プレゼント${ticketNumber}）を使用しますか？`)) {
                    // チケット使用の処理
                    useTicket(ticketNumber, ticketTitle);
                }
            });
        }
    });
    
    detailsBtns.forEach((btn, index) => {
        if (!btn.disabled) {
            btn.addEventListener('click', function() {
                const ticketCard = this.closest('.ticket-card');
                const ticketNumber = ticketCard.querySelector('.ticket-number').textContent;
                
                // 対応するプレゼントページに遷移
                const giftPages = {
                    '①': '../Celebration/gift1.html',
                    '②': '../Celebration/gift2.html',
                    '③': '../Celebration/gift3.html',
                    '④': '../Celebration/gift4_play.html'
                };
                
                if (giftPages[ticketNumber]) {
                    window.location.href = giftPages[ticketNumber];
                }
            });
        }
    });
    
    // アニメーション効果
    const ticketCards = document.querySelectorAll('.ticket-card');
    ticketCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * (index + 1));
    });
});

// チケット使用機能
function useTicket(ticketNumber, ticketTitle) {
    // アニメーション付きでチケットを使用済みに変更
    const ticketCard = document.querySelector(`[data-ticket="${ticketNumber}"]`);
    
    alert(`${ticketTitle}の使用が完了しました！\n詳細は直接お伝えします。`);
    
    // 使用履歴に追加
    addToUsageHistory(ticketNumber, ticketTitle);
    
    // チケットを使用済み状態に変更
    markTicketAsUsed(ticketNumber);
}

// 使用履歴に追加
function addToUsageHistory(ticketNumber, ticketTitle) {
    const historyList = document.querySelector('.history-list');
    const noHistory = document.querySelector('.no-history');
    
    if (noHistory) {
        noHistory.remove();
    }
    
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        <p><strong>${ticketTitle}</strong> - ${new Date().toLocaleDateString('ja-JP')}</p>
    `;
    
    historyList.appendChild(historyItem);
}

// チケットを使用済みに変更
function markTicketAsUsed(ticketNumber) {
    const ticketCard = document.querySelector(`[data-ticket="${ticketNumber}"]`);
    if (ticketCard) {
        ticketCard.classList.add('used');
        const status = ticketCard.querySelector('.ticket-status');
        status.textContent = '使用済み';
        status.style.background = '#f8d7da';
        status.style.color = '#721c24';
        
        const useBtn = ticketCard.querySelector('.use-ticket-btn');
        useBtn.textContent = '使用済み';
        useBtn.disabled = true;
        useBtn.classList.add('disabled');
    }
}

// 総額を動的に計算
function calculateTotalValue() {
    const unlocked = document.querySelectorAll('.ticket-card.unlocked:not(.used)');
    let total = 0;
    
    unlocked.forEach(card => {
        const valueText = card.querySelector('.ticket-details p').textContent;
        const value = parseInt(valueText.match(/\d+,?\d*/)[0].replace(',', ''));
        total += value;
    });
    
    return total;
}

// カウントアップアニメーション
function animateCounter() {
    const amountElement = document.querySelector('.amount');
    const targetValue = 25200;
    let currentValue = 0;
    const increment = targetValue / 50;
    
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        amountElement.textContent = Math.floor(currentValue).toLocaleString();
    }, 30);
}

// ページロード時にカウントアップ実行
window.addEventListener('load', function() {
    setTimeout(animateCounter, 500);
});