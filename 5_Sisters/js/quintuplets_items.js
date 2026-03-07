// 持ち物ページ - JSONから動的に生成
document.addEventListener('DOMContentLoaded', async function() {
    await loadItems();
    setupBagSelector();
    loadChecklistState();
});

// JSONデータから持ち物を読み込んで表示
async function loadItems() {
    try {
        const response = await fetch('../data/schedule_data.json');
        const data = await response.json();
        
        if (data && data.items) {
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
            checkbox.addEventListener('change', saveChecklistState);
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
