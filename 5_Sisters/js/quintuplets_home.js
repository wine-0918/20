// アイコン設定
let appIcon = 'icon3'; // デフォルトアイコン（三玖）

// Service Workerの登録（PWA対応）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('../service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful:', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed:', err);
            });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // ローカルストレージからアイコン設定を読み込み
    loadIconSetting();
    
    // モーダル機能を設定
    setupModal();
    
    // アイコンを適用
    updateManifest();
});

// アイコン設定を読み込み
function loadIconSetting() {
    const savedAppIcon = localStorage.getItem('appIcon');
    if (savedAppIcon !== null) {
        appIcon = savedAppIcon;
    }
    
    // ラジオボタンの状態を設定
    const iconRadios = document.querySelectorAll('input[name="appIcon"]');
    iconRadios.forEach(radio => {
        radio.checked = radio.value === appIcon;
    });
}

// モーダル機能の設定
function setupModal() {
    const openBtn = document.getElementById('openIconSettingsBtn');
    const closeBtn = document.getElementById('closeIconSettingsBtn');
    const modal = document.getElementById('iconSettingsModal');
    
    if (openBtn && closeBtn && modal) {
        // 開くボタン
        openBtn.addEventListener('click', function() {
            modal.classList.add('show');
        });
        
        // 閉じるボタン
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('show');
        });
        
        // オーバーレイクリックで閉じる
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }
    
    // アイコン選択のラジオボタン
    const iconRadios = document.querySelectorAll('input[name="appIcon"]');
    iconRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                appIcon = this.value;
                localStorage.setItem('appIcon', appIcon);
                updateManifest();
                
                // 変更を通知
                showNotification('アイコンを変更しました。アプリを一度削除して再度追加してください。');
            }
        });
    });
}

// Manifestファイルとアイコンを更新
function updateManifest() {
    // アイコン名のマッピング
    const iconMap = {
        'icon1': 'itika',
        'icon2': 'nino',
        'icon3': 'miku',
        'icon4': 'yotuba',
        'icon5': 'ituki'
    };
    
    // 既存のmanifest linkを削除
    const existingLink = document.querySelector('link[rel="manifest"]');
    if (existingLink) {
        existingLink.remove();
    }
    
    // 新しいmanifest linkを追加
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = `../manifest-${appIcon}.json`;
    document.head.appendChild(link);
    
    // apple-touch-iconも更新
    const existingAppleIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (existingAppleIcon) {
        existingAppleIcon.remove();
    }
    
    const appleIcon = document.createElement('link');
    appleIcon.rel = 'apple-touch-icon';
    appleIcon.href = `/20/Pictures/5_sisters/${iconMap[appIcon]}.png`;
    document.head.appendChild(appleIcon);
}

// 通知を表示
function showNotification(message) {
    // 既存の通知を削除
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 新しい通知を作成
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #ff69b4, #ff1493);
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        box-shadow: 0 4px 15px rgba(255, 20, 147, 0.4);
        z-index: 2000;
        animation: slideDown 0.3s ease;
        max-width: 90%;
        text-align: center;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    // 3秒後に削除
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
