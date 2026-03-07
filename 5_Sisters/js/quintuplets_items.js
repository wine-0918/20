// 持ち物ページ - JSONから動的に生成
let itemsData = null;
let currentBag = 'backpack';
const ICON_MAP = {
    icon1: 'itika',
    icon2: 'nino',
    icon3: 'miku',
    icon4: 'yotuba',
    icon5: 'ituki'
};

document.addEventListener('DOMContentLoaded', async function() {
    await loadItems();
    setupBagSelector();
    setupBulkActions();
    loadChecklistState();
    updateAllProgress();
});

// JSONデータから持ち物を読み込んで表示
async function loadItems() {
    try {
        const response = await fetch('../data/schedule_data.json');
        const data = await response.json();
        
        if (data && data.items) {
            itemsData = data.items;
            displayItems(data.items);
        }
    } catch (error) {
        console.error('持ち物データの読み込みに失敗しました:', error);
    }
}

// 持ち物の表示
function displayItems(items) {
    const bags = ['backpack', 'suitcase', 'tote'];
    
    bags.forEach(bagType => {
        const bagData = items[bagType];
        const container = document.getElementById(`${bagType}-items`);
        
        if (!bagData) return;
        
        let html = '';
        bagData.checklist.forEach((item, index) => {
            const itemId = `${bagType}-${index}`;
            html += `
                <div class="checklist-item">
                    <input type="checkbox" id="${itemId}" data-bag="${bagType}" data-index="${index}">
                    <label for="${itemId}" class="item-label">${item}</label>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // チェックボックスのイベントリスナーを設定
        container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                saveChecklistState();
                updateProgress(bagType);

                // 準備モチベ用のバースト演出（チェック時のみ）
                if (this.checked) {
                    playIconBurst(this);
                }
            });
        });
    });
}

// バッグセレクターのセットアップ
function setupBagSelector() {
    const bagButtons = document.querySelectorAll('.bag-button');
    const itemsContents = document.querySelectorAll('.items-content');
    
    bagButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bagType = this.dataset.bag;
            currentBag = bagType;
            
            // アクティブクラスを更新
            bagButtons.forEach(btn => btn.classList.remove('active'));
            itemsContents.forEach(content => content.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(`${bagType}-items`).classList.add('active');
        });
    });
}

// チェックリストの状態を保存
function saveChecklistState() {
    const checklistState = {};
    
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        const bagType = checkbox.dataset.bag;
        const index = checkbox.dataset.index;
        const key = `${bagType}-${index}`;
        
        if (!checklistState[bagType]) {
            checklistState[bagType] = {};
        }
        
        checklistState[bagType][index] = checkbox.checked;
    });
    
    localStorage.setItem('checklistState', JSON.stringify(checklistState));
}

// チェックリストの状態を読み込み
function loadChecklistState() {
    const checklistState = JSON.parse(localStorage.getItem('checklistState') || '{}');
    
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        const bagType = checkbox.dataset.bag;
        const index = checkbox.dataset.index;
        
        if (checklistState[bagType] && checklistState[bagType][index]) {
            checkbox.checked = true;
        }
    });
}

// 進捗表示を更新
function updateProgress(bagType) {
    const checkboxes = document.querySelectorAll(`input[data-bag="${bagType}"]`);
    const total = checkboxes.length;
    const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
    
    const progressBadge = document.getElementById(`${bagType}-progress`);
    if (progressBadge) {
        progressBadge.textContent = `${checked}/${total}`;
        
        // 完了率に応じて色を変更
        if (checked === total) {
            progressBadge.classList.add('complete');
        } else {
            progressBadge.classList.remove('complete');
        }
    }
}

// すべての進捗を更新
function updateAllProgress() {
    ['backpack', 'suitcase', 'tote'].forEach(bagType => {
        updateProgress(bagType);
    });
}

// 一括操作ボタンのセットアップ
function setupBulkActions() {
    const checkAllBtn = document.getElementById('check-all');
    const uncheckAllBtn = document.getElementById('uncheck-all');
    
    checkAllBtn.addEventListener('click', function() {
        const checkboxes = document.querySelectorAll(`#${currentBag}-items input[type="checkbox"]`);
        checkboxes.forEach(cb => cb.checked = true);
        saveChecklistState();
        updateProgress(currentBag);
    });
    
    uncheckAllBtn.addEventListener('click', function() {
        const checkboxes = document.querySelectorAll(`#${currentBag}-items input[type="checkbox"]`);
        checkboxes.forEach(cb => cb.checked = false);
        saveChecklistState();
        updateProgress(currentBag);
    });
}

function getSelectedIconSrc() {
    const selectedIconKey = localStorage.getItem('appIcon') || 'icon3';
    const iconName = ICON_MAP[selectedIconKey] || ICON_MAP.icon3;
    return `../../Pictures/5_sisters/${iconName}.png`;
}

function playIconBurst(checkboxElement) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const rect = checkboxElement.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const iconSrc = getSelectedIconSrc();

    const layer = document.createElement('div');
    layer.className = 'icon-burst-layer';
    document.body.appendChild(layer);

    const ring = document.createElement('div');
    ring.className = 'icon-burst-ring';
    ring.style.left = `${originX}px`;
    ring.style.top = `${originY}px`;
    layer.appendChild(ring);

    const particleCount = 9;
    const baseDistance = 72;

    for (let i = 0; i < particleCount; i += 1) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const distance = baseDistance + Math.random() * 36;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        const rotation = Math.floor(Math.random() * 220 - 110);
        const delay = Math.floor(Math.random() * 70);

        const particle = document.createElement('img');
        particle.className = 'icon-burst-particle';
        particle.src = iconSrc;
        particle.alt = '';
        particle.draggable = false;
        particle.style.left = `${originX}px`;
        particle.style.top = `${originY}px`;
        particle.style.setProperty('--dx', `${dx}px`);
        particle.style.setProperty('--dy', `${dy}px`);
        particle.style.setProperty('--rot', `${rotation}deg`);
        particle.style.setProperty('--delay', `${delay}ms`);
        layer.appendChild(particle);
    }

    setTimeout(() => {
        layer.remove();
    }, 1200);
}
