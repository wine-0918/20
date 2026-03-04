// 持ち物ページ - JSONから動的に生成
document.addEventListener('DOMContentLoaded', async function() {
    await loadItems();
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
    const container = document.getElementById('items-container');
    let html = '';
    
    items.forEach(item => {
        const specialClass = item.special ? ' special' : '';
        html += `
            <div class="item-card${specialClass}">
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}</div>
        `;
        
        if (item.detail) {
            html += `<div class="item-detail">${item.detail}</div>`;
        }
        
        html += `</div>`;
    });
    
    container.innerHTML = html;
}
