// JSONデータを読み込んでスケジュールを動的に生成
let scheduleData = null;
let hasWork = true; // デフォルトは仕事ありの状態
let lunchOption = 'misokichi'; // デフォルトはみそきん

// 基本設定
let highlightCurrentTime = false; // デフォルトで現在時刻ハイライトをOFF
let showCountdown = false; // デフォルトでカウントダウン表示をOFF
let darkMode = false; // デフォルトでダークモードをOFF
let appIcon = 'icon3'; // デフォルトアイコン（三玖）

// Service Workerの登録（PWA対応）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('../service-worker.js', { updateViaCache: 'none' })
            .then(registration => {
                console.log('ServiceWorker registration successful:', registration.scope);

                // 起動時に更新確認
                registration.update();

                // 新しいSWが待機中なら即時有効化
                if (registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (!newWorker) return;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                        }
                    });
                });
            })
            .catch(err => {
                console.log('ServiceWorker registration failed:', err);
            });

        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (refreshing) return;
            refreshing = true;
            window.location.reload();
        });
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    // JSONデータを読み込み
    await loadScheduleData();
    
    // ローカルストレージから設定を読み込み
    loadSettings();
    
    // スケジュールを生成
    generateSchedule();
    
    // 日程切り替え機能を設定
    setupDaySelector();
    
    // アコーディオン機能を設定
    setupAccordion();
    
    // フィルター機能を設定
    setupFilters();
    
    // モーダル機能を設定
    setupModal();
    
    // メモ機能を設定
    setupNoteModal();
});

// JSONデータの読み込み
async function loadScheduleData() {
    try {
        const response = await fetch(`../data/schedule_data.json?t=${Date.now()}`, { cache: 'no-store' });
        scheduleData = await response.json();
    } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
        scheduleData = null;
    }
}

// イベント情報の表示
function displayEventInfo() {
    if (!scheduleData) return;
    
    const eventInfo = scheduleData.eventInfo;
    document.getElementById('event-title').textContent = eventInfo.title;
    document.getElementById('event-venue').textContent = eventInfo.venue;
    document.getElementById('event-time').textContent = 
        `開場 ${eventInfo.openTime} / 開演 ${eventInfo.startTime}`;
    document.getElementById('event-link').href = eventInfo.detailUrl;
}

// スケジュールの生成
function generateSchedule() {
    if (!scheduleData) return;
    
    const schedule = scheduleData.schedule;
    
    // 1日目
    generateDay1(schedule.day1);
    
    // 2日目
    generateDay2(schedule.day2);
    
    // 3日目
    generateDay3(schedule.day3);
}

// 1日目の生成
function generateDay1(day1Data) {
    const container = document.getElementById('day-1');
    const data = hasWork ? day1Data.hasWork : day1Data.noWork;
    const routeData = hasWork ? day1Data.route : day1Data.noWork.route;
    
    let html = `<h2 class="day-title">${day1Data.title}`;
    
    if (day1Data.subtitle) {
        html += ` <span class="day-label">${day1Data.subtitle}</span>`;
    }
    
    html += `</h2>`;
    
    // ルートセクション（アコーディオン形式）
    html += `
        <div class="route-section">
            <div class="route-section-header">
                <div class="route-header-content">
                    <h3 class="section-title">${routeData.title}</h3>
                    <span class="route-hint">クリックして開閉</span>
                </div>
                <span class="route-toggle-icon">▼</span>
            </div>
            <div class="route-content">
                <div class="route-flow">
    `;
    
    routeData.points.forEach((point, index) => {
        html += `<span class="route-point">${point}</span>`;
        if (index < routeData.points.length - 1) {
            html += `<span class="route-arrow">→</span>`;
        }
    });
    
    html += `
                </div>
            </div>
        </div>
        <div class="schedule-timeline">
    `;
    
    // タイムライン
    data.timeline.forEach(item => {
        html += generateTimelineItem(item);
    });
    
    html += `</div>`;
    
    // 補足
    if (data.notes && data.notes.length > 0) {
        html += `
            <div class="note-box">
                <div class="note-title">補足</div>
                <ul>
        `;
        data.notes.forEach(note => {
            html += `<li>${note}</li>`;
        });
        html += `
                </ul>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// 2日目の生成
function generateDay2(day2Data) {
    const container = document.getElementById('day-2');
    let html = `<h2 class="day-title">${day2Data.title}`;
    
    if (day2Data.subtitle) {
        html += ` <span class="day-label">${day2Data.subtitle}</span>`;
    }
    
    html += `</h2>`;
    
    // ルートセクション（アコーディオン形式）
    if (day2Data.route) {
        html += `
            <div class="route-section">
                <div class="route-section-header">
                    <div class="route-header-content">
                        <h3 class="section-title">${day2Data.route.title}</h3>
                        <span class="route-hint">クリックして開閉</span>
                    </div>
                    <span class="route-toggle-icon">▼</span>
                </div>
                <div class="route-content">
                    <div class="route-flow">
        `;
        
        day2Data.route.points.forEach((point, index) => {
            html += `<span class="route-point">${point}</span>`;
            if (index < day2Data.route.points.length - 1) {
                html += `<span class="route-arrow">→</span>`;
            }
        });
        
        html += `
                    </div>
                </div>
            </div>
        `;
    }
    
    html += `<div class="schedule-timeline">`;
    
    // セクションごとに処理
    day2Data.sections.forEach(section => {
        const sectionClass = section.isEvent ? 'timeline-section event-section' : 'timeline-section';
        html += `
            <div class="${sectionClass}">
                <div class="section-header">${section.sectionName}</div>
        `;
        
        section.timeline.forEach(item => {
            html += generateTimelineItem(item);
        });
        
        html += `</div>`;
    });
    
    html += `</div>`;
    
    // 補足
    if (day2Data.notes && day2Data.notes.length > 0) {
        html += `
            <div class="note-box">
                <div class="note-title">補足</div>
                <ul>
        `;
        day2Data.notes.forEach(note => {
            html += `<li>${note}</li>`;
        });
        html += `
                </ul>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// 3日目の生成
function generateDay3(day3Data) {
    const container = document.getElementById('day-3');
    const workData = hasWork ? day3Data.hasWork : day3Data.noWork;
    const data = workData[lunchOption]; // みそきん or レッドロック
    
    let html = `<h2 class="day-title">${day3Data.title}</h2>`;
    
    // ルートセクション（アコーディオン形式）
    if (data.route) {
        html += `
            <div class="route-section">
                <div class="route-section-header">
                    <div class="route-header-content">
                        <h3 class="section-title">${data.route.title}</h3>
                        <span class="route-hint">クリックして開閉</span>
                    </div>
                    <span class="route-toggle-icon">▼</span>
                </div>
                <div class="route-content">
                    <div class="route-flow">
        `;
        
        data.route.points.forEach((point, index) => {
            html += `<span class="route-point">${point}</span>`;
            if (index < data.route.points.length - 1) {
                html += `<span class="route-arrow">→</span>`;
            }
        });
        
        html += `
                    </div>
                </div>
            </div>
        `;
    }
    
    html += `<div class="schedule-timeline">`;
    
    // タイムライン
    data.timeline.forEach(item => {
        html += generateTimelineItem(item);
    });
    
    html += `</div>`;
    
    // 補足
    if (data.notes && data.notes.length > 0) {
        html += `
            <div class="note-box">
                <div class="note-title">補足</div>
                <ul>
        `;
        data.notes.forEach(note => {
            html += `<li>${note}</li>`;
        });
        html += `
                </ul>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// タイムラインアイテムの生成（共通処理）
function generateTimelineItem(item) {
    // ユニークなIDを生成（時刻とタイトルから）
    const itemId = `item-${item.time.replace(':', '')}-${item.title.replace(/\s+/g, '-')}`;
    
    let html = `
        <div class="timeline-item" data-item-id="${itemId}">
            <div class="item-time">${item.time}</div>
            <div class="item-content">
                <div class="item-header">
                    <div class="item-title">${item.title}</div>
                    <button class="note-icon" data-item-id="${itemId}" data-time="${item.time}" data-title="${item.title}" title="メモを追加">
                        <span class="note-icon-text">📝</span>
                    </button>
                </div>
    `;
    
    if (item.detail) {
        html += `<div class="item-detail">${item.detail}</div>`;
    }
    
    if (item.note) {
        html += `<div class="item-note">${item.note}</div>`;
    }
    
    if (item.link) {
        // リンクタイプに基づいてクラスを設定
        let linkClass = 'link';
        if (item.link.type === 'menu') {
            linkClass = 'link link-menu';
        } else {
            const isMapLink = item.link.url.includes('x.gd') || item.link.url.includes('maps.app.goo.gl');
            linkClass = isMapLink ? 'link link-map' : 'link';
        }
        html += `<a href="${item.link.url}" target="_blank" class="${linkClass}">${item.link.text}</a>`;
    }
    
    if (item.links && item.links.length > 0) {
        html += `<div class="links-container">`;
        item.links.forEach(link => {
            // リンクタイプに基づいてクラスを設定
            let linkClass = 'link';
            if (link.type === 'menu') {
                linkClass = 'link link-menu';
            } else {
                const isMapLink = link.url.includes('x.gd') || link.url.includes('maps.app.goo.gl');
                linkClass = isMapLink ? 'link link-map' : 'link';
            }
            html += `<a href="${link.url}" target="_blank" class="${linkClass}">${link.text}</a>`;
        });
        html += `</div>`;
    }
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

// 日程切り替え機能の設定
function setupDaySelector() {
    const dayButtons = document.querySelectorAll('.day-button');
    const scheduleContents = document.querySelectorAll('.schedule-content');

    dayButtons.forEach(button => {
        button.addEventListener('click', function() {
            const day = this.getAttribute('data-day');

            // すべてのボタンとコンテンツから active クラスを削除
            dayButtons.forEach(btn => btn.classList.remove('active'));
            scheduleContents.forEach(content => content.classList.remove('active'));

            // クリックされたボタンと対応するコンテンツに active クラスを追加
            this.classList.add('active');
            document.getElementById(`day-${day}`).classList.add('active');
        });
    });
}

// アコーディオン機能の設定
function setupAccordion() {
    // 動的に生成されたコンテンツを待つためにsetTimeoutを使用
    setTimeout(() => {
        const routeSections = document.querySelectorAll('.route-section');
        
        routeSections.forEach(section => {
            const header = section.querySelector('.route-section-header');
            
            if (header) {
                header.addEventListener('click', function() {
                    section.classList.toggle('open');
                });
            }
        });
    }, 100);
}

// ローカルストレージから設定を読み込み
function loadSettings() {
    // 仕事の有無
    const savedHasWork = localStorage.getItem('hasWork');
    if (savedHasWork !== null) {
        hasWork = savedHasWork === 'true';
    }
    
    // 昼ごはんの選択
    const savedLunchOption = localStorage.getItem('lunchOption');
    if (savedLunchOption !== null) {
        lunchOption = savedLunchOption;
    }
    
    // 基本設定
    const savedHighlight = localStorage.getItem('highlightCurrentTime');
    if (savedHighlight !== null) {
        highlightCurrentTime = savedHighlight === 'true';
    }
    
    const savedCountdown = localStorage.getItem('showCountdown');
    if (savedCountdown !== null) {
        showCountdown = savedCountdown === 'true';
    }
    
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
        darkMode = savedDarkMode === 'true';
    }
    
    // アイコン選択
    const savedAppIcon = localStorage.getItem('appIcon');
    if (savedAppIcon !== null) {
        appIcon = savedAppIcon;
    }
    
    // ラジオボタンの状態を設定
    const hasWorkRadios = document.querySelectorAll('input[name="hasWork"]');
    hasWorkRadios.forEach(radio => {
        radio.checked = radio.value === String(hasWork);
    });
    
    const lunchRadios = document.querySelectorAll('input[name="lunchOption"]');
    lunchRadios.forEach(radio => {
        radio.checked = radio.value === lunchOption;
    });
    
    // チェックボックスの状態を設定
    const highlightCheckbox = document.getElementById('highlightCurrentTime');
    if (highlightCheckbox) highlightCheckbox.checked = highlightCurrentTime;
    
    const countdownCheckbox = document.getElementById('showCountdown');
    if (countdownCheckbox) countdownCheckbox.checked = showCountdown;
    
    const darkModeCheckbox = document.getElementById('darkMode');
    if (darkModeCheckbox) darkModeCheckbox.checked = darkMode;
    
    // ダークモードを適用
    applyDarkMode();
    
    // アイコンを適用
    updateManifest();
}

// フィルター機能の設定
function setupFilters() {
    // 仕事の有無のラジオボタン
    const hasWorkRadios = document.querySelectorAll('input[name="hasWork"]');
    hasWorkRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                hasWork = this.value === 'true';
                localStorage.setItem('hasWork', hasWork);
                generateSchedule();
                setupAccordion();
            }
        });
    });
    
    // 昼ごはんのラジオボタン
    const lunchRadios = document.querySelectorAll('input[name="lunchOption"]');
    lunchRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                lunchOption = this.value;
                localStorage.setItem('lunchOption', lunchOption);
                generateSchedule();
                setupAccordion();
            }
        });
    });
    
    // 基本設定のチェックボックス
    const highlightCheckbox = document.getElementById('highlightCurrentTime');
    if (highlightCheckbox) {
        highlightCheckbox.addEventListener('change', function() {
            highlightCurrentTime = this.checked;
            localStorage.setItem('highlightCurrentTime', highlightCurrentTime);
            updateCurrentTimeHighlight();
        });
    }
    
    const countdownCheckbox = document.getElementById('showCountdown');
    if (countdownCheckbox) {
        countdownCheckbox.addEventListener('change', function() {
            showCountdown = this.checked;
            localStorage.setItem('showCountdown', showCountdown);
            updateCountdownDisplay();
        });
    }
    
    const darkModeCheckbox = document.getElementById('darkMode');
    if (darkModeCheckbox) {
        darkModeCheckbox.addEventListener('change', function() {
            darkMode = this.checked;
            localStorage.setItem('darkMode', darkMode);
            applyDarkMode();
        });
    }

}

// Manifestファイルを更新
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
    appleIcon.href = `../../Pictures/5_sisters/${iconMap[appIcon]}.png`;
    document.head.appendChild(appleIcon);
}

// モーダル機能の設定
function setupModal() {
    const openBtn = document.getElementById('openSettingsBtn');
    const closeBtn = document.getElementById('closeSettingsBtn');
    const modal = document.getElementById('settingsModal');
    const modalOverlay = modal;
    
    // 設定ボタンをクリックしたらモーダルを開く
    if (openBtn) {
        openBtn.addEventListener('click', function() {
            modal.classList.add('show');
        });
    }
    
    // 閉じるボタンをクリックしたらモーダルを閉じる
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('show');
        });
    }
    
    // モーダルの外側をクリックしたら閉じる
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
}

// ダークモードの適用
function applyDarkMode() {
    if (darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// 現在時刻ハイライトの更新
function updateCurrentTimeHighlight() {
    if (!highlightCurrentTime) {
        // ハイライトをオフにする場合、すべてのハイライトを削除
        document.querySelectorAll('.timeline-item.current-time').forEach(item => {
            item.classList.remove('current-time');
        });
        document.querySelectorAll('.timeline-item.next-event').forEach(item => {
            item.classList.remove('next-event');
        });
        return;
    }
    
    // 現在の時刻を取得
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    // すべてのタイムライン項目を取得
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    let currentItem = null;
    let nextItem = null;
    
    timelineItems.forEach(item => {
        const timeText = item.querySelector('.item-time')?.textContent;
        if (timeText) {
            const [hour, minute] = timeText.split(':').map(num => parseInt(num));
            const itemTimeInMinutes = hour * 60 + minute;
            
            // 現在時刻と比較
            if (itemTimeInMinutes <= currentTimeInMinutes) {
                currentItem = item;
            } else if (!nextItem && itemTimeInMinutes > currentTimeInMinutes) {
                nextItem = item;
            }
        }
    });
    
    // すべてのハイライトクラスをクリア
    timelineItems.forEach(item => {
        item.classList.remove('current-time', 'next-event');
    });
    
    // 現在のイベントをハイライト
    if (currentItem) {
        currentItem.classList.add('current-time');
    }
    
    // 次のイベントをハイライト
    if (nextItem) {
        nextItem.classList.add('next-event');
    }
}

// カウントダウン表示の更新
function updateCountdownDisplay() {
    let countdownElement = document.getElementById('countdown-bar');
    
    if (!showCountdown) {
        // カウントダウンをオフにする場合、要素を削除
        if (countdownElement) {
            countdownElement.remove();
        }
        return;
    }
    
    // カウントダウン要素が存在しない場合は作成
    if (!countdownElement) {
        countdownElement = document.createElement('div');
        countdownElement.id = 'countdown-bar';
        countdownElement.className = 'countdown-bar';
        // day-selectorの次に挿入
        const daySelector = document.querySelector('.day-selector');
        if (daySelector && daySelector.parentNode) {
            daySelector.parentNode.insertBefore(countdownElement, daySelector.nextSibling);
        } else {
            document.body.insertBefore(countdownElement, document.body.firstChild);
        }
    }
    
    // 現在の時刻を取得
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    const currentTimeInSeconds = currentHour * 3600 + currentMinute * 60 + currentSecond;
    
    // すべてのタイムライン項目を取得
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    let nextItem = null;
    let nextItemTime = null;
    let nextItemTitle = null;
    
    timelineItems.forEach(item => {
        const timeText = item.querySelector('.item-time')?.textContent;
        const titleText = item.querySelector('.item-title')?.textContent;
        if (timeText) {
            const [hour, minute] = timeText.split(':').map(num => parseInt(num));
            const itemTimeInSeconds = hour * 3600 + minute * 60;
            
            // 現在時刻より後の最初のイベントを見つける
            if (itemTimeInSeconds > currentTimeInSeconds && !nextItem) {
                nextItem = item;
                nextItemTime = itemTimeInSeconds;
                nextItemTitle = titleText;
            }
        }
    });
    
    if (nextItem && nextItemTime) {
        // 残り時間を計算
        const remainingSeconds = nextItemTime - currentTimeInSeconds;
        const hours = Math.floor(remainingSeconds / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        
        let timeText = '';
        if (hours > 0) {
            timeText = `あと ${hours}時間${minutes}分`;
        } else {
            timeText = `あと ${minutes}分`;
        }
        
        countdownElement.innerHTML = `
            <div class="countdown-content">
                <div class="countdown-label">次のイベント</div>
                <div class="countdown-time">${timeText}</div>
                <div class="countdown-event">${nextItemTitle}</div>
            </div>
        `;
        
        // クリックでスクロール
        countdownElement.onclick = function() {
            nextItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
    } else {
        countdownElement.innerHTML = `
            <div class="countdown-content">
                <div class="countdown-label">本日のスケジュールは終了しました</div>
            </div>
        `;
        countdownElement.onclick = null;
    }
}

// 定期的に更新
setInterval(() => {
    if (highlightCurrentTime) {
        updateCurrentTimeHighlight();
    }
    if (showCountdown) {
        updateCountdownDisplay();
    }
}, 60000); // 1分ごとに更新

// 初回実行（DOMContentLoaded後に呼ぶ）
setTimeout(() => {
    if (highlightCurrentTime) {
        updateCurrentTimeHighlight();
    }
    if (showCountdown) {
        updateCountdownDisplay();
    }
}, 1000);

// メモ機能
let currentNoteItemId = null;

function setupNoteModal() {
    const noteModal = document.getElementById('noteModal');
    const closeNoteBtn = document.getElementById('closeNoteBtn');
    const saveNoteBtn = document.getElementById('saveNoteBtn');
    const clearNoteBtn = document.getElementById('clearNoteBtn');
    const noteTextarea = document.getElementById('noteTextarea');
    
    // メモアイコンのクリックイベントを設定（イベント委譲）
    document.addEventListener('click', function(e) {
        if (e.target.closest('.note-icon')) {
            const noteIcon = e.target.closest('.note-icon');
            const itemId = noteIcon.dataset.itemId;
            const time = noteIcon.dataset.time;
            const title = noteIcon.dataset.title;
            
            openNoteModal(itemId, time, title);
        }
    });
    
    // 閉じるボタン
    if (closeNoteBtn) {
        closeNoteBtn.addEventListener('click', () => {
            noteModal.classList.remove('show');
        });
    }
    
    // モーダルの外側をクリックしたら閉じる
    noteModal.addEventListener('click', function(e) {
        if (e.target === noteModal) {
            noteModal.classList.remove('show');
        }
    });
    
    // 保存ボタン
    if (saveNoteBtn) {
        saveNoteBtn.addEventListener('click', () => {
            saveNote();
        });
    }
    
    // クリアボタン
    if (clearNoteBtn) {
        clearNoteBtn.addEventListener('click', () => {
            if (confirm('このメモを削除しますか？')) {
                clearNote();
            }
        });
    }
    
    // スケジュール生成後、保存済みメモを反映
    updateNoteIcons();
}

function openNoteModal(itemId, time, title) {
    currentNoteItemId = itemId;
    
    const noteModal = document.getElementById('noteModal');
    const noteTime = document.getElementById('noteTime');
    const noteEvent = document.getElementById('noteEvent');
    const noteTextarea = document.getElementById('noteTextarea');
    
    // モーダルにアイテム情報を表示
    noteTime.textContent = time;
    noteEvent.textContent = title;
    
    // 保存済みのメモを読み込み
    const savedNote = localStorage.getItem(`note-${itemId}`);
    noteTextarea.value = savedNote || '';
    
    // モーダルを表示
    noteModal.classList.add('show');
    noteTextarea.focus();
}

function saveNote() {
    const noteTextarea = document.getElementById('noteTextarea');
    const noteText = noteTextarea.value.trim();
    
    if (noteText) {
        localStorage.setItem(`note-${currentNoteItemId}`, noteText);
    } else {
        localStorage.removeItem(`note-${currentNoteItemId}`);
    }
    
    // アイコンの表示を更新
    updateNoteIcons();
    
    // モーダルを閉じる
    document.getElementById('noteModal').classList.remove('show');
}

function clearNote() {
    localStorage.removeItem(`note-${currentNoteItemId}`);
    document.getElementById('noteTextarea').value = '';
    
    // アイコンの表示を更新
    updateNoteIcons();
    
    // モーダルを閉じる
    document.getElementById('noteModal').classList.remove('show');
}

function updateNoteIcons() {
    // すべてのメモアイコンをチェック
    document.querySelectorAll('.note-icon').forEach(icon => {
        const itemId = icon.dataset.itemId;
        const savedNote = localStorage.getItem(`note-${itemId}`);
        
        if (savedNote) {
            icon.classList.add('has-note');
        } else {
            icon.classList.remove('has-note');
        }
    });
}
