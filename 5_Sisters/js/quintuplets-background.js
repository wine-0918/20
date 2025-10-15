// 5等分の花嫁 動的背景アニメーション
document.addEventListener('DOMContentLoaded', function() {
    createAnimatedBackground();
    createSakuraPetals();
    createFloatingHearts();
    createCharacterItems(); // 新しく追加
    startGradientAnimation();
    setTimeout(createSparkles, 2000);
});

// 動的背景グラデーションの作成
function createAnimatedBackground() {
    const body = document.body;
    
    // 5等分の花嫁のキャラクターカラー
    const colors = [
        '#ff9a9e', // 一花 - ピンク
        '#fecfef', // 二乃 - ライトピンク
        '#a8e6cf', // 三玖 - グリーン
        '#88d8ff', // 四葉 - ブルー
        '#ffb199'  // 五月 - オレンジ
    ];
    
    // 背景のグラデーションを動的に変更
    let colorIndex = 0;
    setInterval(() => {
        const currentColor = colors[colorIndex % colors.length];
        const nextColor = colors[(colorIndex + 1) % colors.length];
        
        body.style.background = `
            linear-gradient(135deg, 
                ${currentColor} 0%, 
                ${nextColor} 50%, 
                rgba(255, 255, 255, 0.9) 100%
            )
        `;
        
        colorIndex++;
    }, 5000); // 5秒ごとに色を変更
}

// 桜の花びらアニメーション
function createSakuraPetals() {
    const petalContainer = document.createElement('div');
    petalContainer.className = 'sakura-container';
    petalContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
    `;
    document.body.appendChild(petalContainer);
    
    // 桜の花びらを定期的に生成
    setInterval(createPetal, 800);
    
    function createPetal() {
        const petal = document.createElement('div');
        petal.className = 'sakura-petal';
        
        // ランダムな開始位置とサイズ
        const startX = Math.random() * window.innerWidth;
        const size = Math.random() * 15 + 10; // 10-25px
        const opacity = Math.random() * 0.7 + 0.3; // 0.3-1.0
        const duration = Math.random() * 8000 + 6000; // 6-14秒
        
        petal.style.cssText = `
            position: absolute;
            top: -20px;
            left: ${startX}px;
            width: ${size}px;
            height: ${size}px;
            background: linear-gradient(45deg, #ffb6c1, #ffc0cb, #ffe4e1);
            border-radius: 0 100% 0 100%;
            opacity: ${opacity};
            transform: rotate(45deg);
            animation: sakuraFall ${duration}ms linear forwards;
        `;
        
        petalContainer.appendChild(petal);
        
        // アニメーション終了後に要素を削除
        setTimeout(() => {
            if (petal.parentNode) {
                petal.parentNode.removeChild(petal);
            }
        }, duration);
    }
}

// ハートのフローティングアニメーション
function createFloatingHearts() {
    const heartContainer = document.createElement('div');
    heartContainer.className = 'heart-container';
    heartContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
    `;
    document.body.appendChild(heartContainer);
    
    // ハートを定期的に生成
    setInterval(createHeart, 3000);
    
    function createHeart() {
        const heart = document.createElement('div');
        heart.innerHTML = '💕';
        
        const startX = Math.random() * window.innerWidth;
        const size = Math.random() * 20 + 15; // 15-35px
        const opacity = Math.random() * 0.5 + 0.2; // 0.2-0.7
        const duration = Math.random() * 10000 + 8000; // 8-18秒
        
        heart.style.cssText = `
            position: absolute;
            top: 100vh;
            left: ${startX}px;
            font-size: ${size}px;
            opacity: ${opacity};
            animation: heartFloat ${duration}ms ease-out forwards;
        `;
        
        heartContainer.appendChild(heart);
        
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, duration);
    }
}

// 5等分の花嫁キャラクターアイテムアニメーション
function createCharacterItems() {
    const itemContainer = document.createElement('div');
    itemContainer.className = 'character-items-container';
    itemContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
    `;
    document.body.appendChild(itemContainer);
    
    // 各キャラクターのアイテム
    const characterItems = [
        '🥤', // フラペチーノ - 一花
        '🎀', // リボン - 二乃
        '🍵', // 抹茶 - 三玖
        '🍀', // 四葉のクローバー - 四葉
        '🥟'  // 肉まん - 五月
    ];
    
    // アイテムを定期的に生成
    setInterval(() => {
        createFloatingItem(itemContainer, characterItems);
    }, 2000);
    
    function createFloatingItem(container, items) {
        const item = document.createElement('div');
        const randomItem = items[Math.random() * items.length | 0];
        item.innerHTML = randomItem;
        
        // ランダムな開始位置と動きのパターン
        const startSide = Math.random() < 0.5 ? 'left' : 'right';
        const startX = startSide === 'left' ? -50 : window.innerWidth + 50;
        const startY = Math.random() * window.innerHeight * 0.8; // 上部80%から開始
        const size = Math.random() * 25 + 20; // 20-45px
        const opacity = Math.random() * 0.6 + 0.3; // 0.3-0.9
        const duration = Math.random() * 12000 + 8000; // 8-20秒
        const direction = startSide === 'left' ? 1 : -1;
        
        item.style.cssText = `
            position: absolute;
            top: ${startY}px;
            left: ${startX}px;
            font-size: ${size}px;
            opacity: ${opacity};
            animation: characterItemFloat-${startSide} ${duration}ms linear forwards;
            z-index: -1;
        `;
        
        container.appendChild(item);
        
        // アニメーション終了後に要素を削除
        setTimeout(() => {
            if (item.parentNode) {
                item.parentNode.removeChild(item);
            }
        }, duration);
    }
}

// 縦に流れるアイテムアニメーション
function createVerticalCharacterItems() {
    const verticalContainer = document.createElement('div');
    verticalContainer.className = 'vertical-items-container';
    verticalContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
    `;
    document.body.appendChild(verticalContainer);
    
    const characterItems = ['🥤', '🎀', '🍵', '🍀', '🥟'];
    
    // 縦方向のアイテムを定期的に生成
    setInterval(() => {
        createVerticalItem(verticalContainer, characterItems);
    }, 3000);
    
    function createVerticalItem(container, items) {
        const item = document.createElement('div');
        const randomItem = items[Math.random() * items.length | 0];
        item.innerHTML = randomItem;
        
        const startX = Math.random() * window.innerWidth;
        const size = Math.random() * 20 + 15; // 15-35px
        const opacity = Math.random() * 0.5 + 0.2; // 0.2-0.7
        const duration = Math.random() * 15000 + 10000; // 10-25秒
        const rotation = Math.random() * 360;
        
        item.style.cssText = `
            position: absolute;
            top: -50px;
            left: ${startX}px;
            font-size: ${size}px;
            opacity: ${opacity};
            transform: rotate(${rotation}deg);
            animation: verticalItemFall ${duration}ms linear forwards;
        `;
        
        container.appendChild(item);
        
        setTimeout(() => {
            if (item.parentNode) {
                item.parentNode.removeChild(item);
            }
        }, duration);
    }
}

// 回転しながら流れるアイテム
function createRotatingItems() {
    const rotatingContainer = document.createElement('div');
    rotatingContainer.className = 'rotating-items-container';
    rotatingContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
    `;
    document.body.appendChild(rotatingContainer);
    
    const characterItems = ['🥤', '🎀', '🍵', '🍀', '🥟'];
    
    setInterval(() => {
        createRotatingItem(rotatingContainer, characterItems);
    }, 4000);
    
    function createRotatingItem(container, items) {
        const item = document.createElement('div');
        const randomItem = items[Math.random() * items.length | 0];
        item.innerHTML = randomItem;
        
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;
        const size = Math.random() * 30 + 25; // 25-55px
        const opacity = Math.random() * 0.4 + 0.2; // 0.2-0.6
        const duration = Math.random() * 20000 + 15000; // 15-35秒
        
        item.style.cssText = `
            position: absolute;
            top: ${startY}px;
            left: ${startX}px;
            font-size: ${size}px;
            opacity: ${opacity};
            animation: rotatingItemMove ${duration}ms ease-in-out forwards;
        `;
        
        container.appendChild(item);
        
        setTimeout(() => {
            if (item.parentNode) {
                item.parentNode.removeChild(item);
            }
        }, duration);
    }
}

// グラデーション波形アニメーション
function startGradientAnimation() {
    const waveContainer = document.createElement('div');
    waveContainer.className = 'wave-container';
    waveContainer.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 200px;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
    `;
    
    // 3つの波を作成
    for (let i = 0; i < 3; i++) {
        const wave = document.createElement('div');
        wave.className = `wave wave-${i + 1}`;
        
        const colors = [
            'rgba(255, 154, 158, 0.3)', // 一花カラー
            'rgba(254, 207, 239, 0.3)', // 二乃カラー
            'rgba(168, 230, 207, 0.3)'  // 三玖カラー
        ];
        
        wave.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            width: 200%;
            height: 100px;
            background: ${colors[i]};
            border-radius: 50%;
            animation: waveMove ${8 + i * 2}s ease-in-out infinite;
            animation-delay: ${i * 0.5}s;
            transform: translateX(-50%);
        `;
        
        waveContainer.appendChild(wave);
    }
    
    document.body.appendChild(waveContainer);
}

// キラキラエフェクト
function createSparkles() {
    const sparkleContainer = document.createElement('div');
    sparkleContainer.className = 'sparkle-container';
    sparkleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
    `;
    document.body.appendChild(sparkleContainer);
    
    setInterval(createSparkle, 1500);
    
    function createSparkle() {
        const sparkle = document.createElement('div');
        sparkle.innerHTML = '✨';
        
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const size = Math.random() * 15 + 10;
        
        sparkle.style.cssText = `
            position: absolute;
            top: ${y}px;
            left: ${x}px;
            font-size: ${size}px;
            animation: sparkleGlow 2s ease-out forwards;
        `;
        
        sparkleContainer.appendChild(sparkle);
        
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 2000);
    }
}

// ボタンホバー時のエフェクト
document.addEventListener('mouseover', function(e) {
    if (e.target.classList.contains('plan-btn') || 
        e.target.classList.contains('event-btn') || 
        e.target.classList.contains('home-btn')) {
        createButtonSparkle(e.target);
    }
});

function createButtonSparkle(button) {
    const rect = button.getBoundingClientRect();
    const sparkle = document.createElement('div');
    sparkle.innerHTML = '⭐';
    
    sparkle.style.cssText = `
        position: absolute;
        top: ${rect.top + Math.random() * rect.height}px;
        left: ${rect.left + Math.random() * rect.width}px;
        font-size: 12px;
        pointer-events: none;
        z-index: 1000;
        animation: buttonSparkle 1s ease-out forwards;
    `;
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
        if (sparkle.parentNode) {
            sparkle.parentNode.removeChild(sparkle);
        }
    }, 1000);
}

// アニメーション開始
setTimeout(createSparkles, 2000);
setTimeout(createVerticalCharacterItems, 4000);
setTimeout(createRotatingItems, 6000);
