const ICON_MAP = {
    icon1: 'itika',
    icon2: 'nino',
    icon3: 'miku',
    icon4: 'yotuba',
    icon5: 'ituki'
};

class IconBurstAnimator {
    constructor(iconMap) {
        this.iconMap = iconMap;
    }

    getSelectedIconSrc() {
        const selectedIconKey = localStorage.getItem('appIcon') || 'icon3';
        const iconName = this.iconMap[selectedIconKey] || this.iconMap.icon3;
        return `../../Pictures/5_sisters/${iconName}.png`;
    }

    play(checkboxElement) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const rect = checkboxElement.getBoundingClientRect();
        const originX = rect.left + rect.width / 2;
        const originY = rect.top + rect.height / 2;
        const iconSrc = this.getSelectedIconSrc();

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
}

class ChecklistStorage {
    static load() {
        return JSON.parse(localStorage.getItem('checklistState') || '{}');
    }

    static save(checklistState) {
        localStorage.setItem('checklistState', JSON.stringify(checklistState));
    }
}

class ItemsChecklistApp {
    constructor() {
        this.currentBag = 'backpack';
        this.bagTypes = ['backpack', 'suitcase', 'tote'];
        this.itemsData = null;
        this.burstAnimator = new IconBurstAnimator(ICON_MAP);
    }

    async init() {
        await this.loadItemsData();
        this.setupBagSelector();
        this.setupBulkActions();
        this.loadChecklistState();
        this.updateAllProgress();
    }

    async loadItemsData() {
        try {
            // 新しい分割データを優先
            const response = await fetch('../data/items_data.json?t=' + Date.now(), { cache: 'no-store' });
            const data = await response.json();
            if (data && data.items) {
                this.itemsData = data.items;
                this.renderItems();
                return;
            }
        } catch (error) {
            console.warn('items_data.jsonの読み込みに失敗。schedule_data.jsonへフォールバックします。', error);
        }

        // 互換性維持のため旧データへフォールバック
        try {
            const response = await fetch('../data/schedule_data.json?t=' + Date.now(), { cache: 'no-store' });
            const data = await response.json();
            if (data && data.items) {
                this.itemsData = data.items;
                this.renderItems();
            }
        } catch (error) {
            console.error('持ち物データの読み込みに失敗しました:', error);
            this.itemsData = null;
        }
    }

    renderItems() {
        if (!this.itemsData) return;

        this.bagTypes.forEach(bagType => {
            const bagData = this.itemsData[bagType];
            const container = document.getElementById(`${bagType}-items`);
            if (!bagData || !container) return;

            container.innerHTML = bagData.checklist
                .map((item, index) => {
                    const itemId = `${bagType}-${index}`;
                    // item が文字列の場合とオブジェクトの場合に対応
                    const itemText = typeof item === 'string' ? item : item.item;
                    const description = typeof item === 'string' ? '' : (item.description || '');
                    const descriptionHtml = description ? `<span class="item-description">${description}</span>` : '';
                    
                    return `
                        <div class="checklist-item">
                            <input type="checkbox" id="${itemId}" data-bag="${bagType}" data-index="${index}">
                            <label for="${itemId}" class="item-label">
                                <span class="item-text">${itemText}</span>
                                ${descriptionHtml}
                            </label>
                        </div>
                    `;
                })
                .join('');

            container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    this.saveChecklistState();
                    this.updateProgress(bagType);
                    if (checkbox.checked) {
                        this.burstAnimator.play(checkbox);
                    }
                });
            });
        });
    }

    setupBagSelector() {
        const bagButtons = document.querySelectorAll('.bag-button');
        const itemsContents = document.querySelectorAll('.items-content');

        bagButtons.forEach(button => {
            button.addEventListener('click', () => {
                const bagType = button.dataset.bag;
                this.currentBag = bagType;

                bagButtons.forEach(btn => btn.classList.remove('active'));
                itemsContents.forEach(content => content.classList.remove('active'));

                button.classList.add('active');
                const currentContent = document.getElementById(`${bagType}-items`);
                if (currentContent) {
                    currentContent.classList.add('active');
                }
            });
        });
    }

    setupBulkActions() {
        const checkAllBtn = document.getElementById('check-all');
        const uncheckAllBtn = document.getElementById('uncheck-all');
        if (!checkAllBtn || !uncheckAllBtn) return;

        checkAllBtn.addEventListener('click', () => {
            this.getCurrentBagCheckboxes().forEach(cb => {
                cb.checked = true;
            });
            this.saveChecklistState();
            this.updateProgress(this.currentBag);
        });

        uncheckAllBtn.addEventListener('click', () => {
            this.getCurrentBagCheckboxes().forEach(cb => {
                cb.checked = false;
            });
            this.saveChecklistState();
            this.updateProgress(this.currentBag);
        });
    }

    getCurrentBagCheckboxes() {
        return document.querySelectorAll(`#${this.currentBag}-items input[type="checkbox"]`);
    }

    saveChecklistState() {
        const checklistState = {};

        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            const bagType = checkbox.dataset.bag;
            const index = checkbox.dataset.index;
            if (!checklistState[bagType]) {
                checklistState[bagType] = {};
            }
            checklistState[bagType][index] = checkbox.checked;
        });

        ChecklistStorage.save(checklistState);
    }

    loadChecklistState() {
        const checklistState = ChecklistStorage.load();

        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            const bagType = checkbox.dataset.bag;
            const index = checkbox.dataset.index;
            checkbox.checked = Boolean(checklistState[bagType] && checklistState[bagType][index]);
        });
    }

    updateProgress(bagType) {
        const checkboxes = document.querySelectorAll(`input[data-bag="${bagType}"]`);
        const total = checkboxes.length;
        const checked = Array.from(checkboxes).filter(cb => cb.checked).length;

        const progressBadge = document.getElementById(`${bagType}-progress`);
        if (!progressBadge) return;

        progressBadge.textContent = `${checked}/${total}`;
        progressBadge.classList.toggle('complete', total > 0 && checked === total);
    }

    updateAllProgress() {
        this.bagTypes.forEach(bagType => this.updateProgress(bagType));
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const app = new ItemsChecklistApp();
    await app.init();
});
