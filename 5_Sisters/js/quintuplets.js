// JSONデータを読み込んでスケジュールを動的に生成
let scheduleData = null;
let hasWork = true; // デフォルトは仕事ありの状態
let lunchOption = 'misokichi'; // デフォルトはみそきん

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
});

// JSONデータの読み込み
async function loadScheduleData() {
    try {
        const response = await fetch('../data/schedule_data.json');
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
    let html = `
        <div class="timeline-item">
            <div class="time">${item.time}</div>
            <div class="content">
                <div class="content-title">${item.title}</div>
    `;
    
    if (item.detail) {
        html += `<div class="content-detail">${item.detail}</div>`;
    }
    
    if (item.note) {
        html += `<div class="content-note">${item.note}</div>`;
    }
    
    if (item.link) {
        // URLにx.gdが含まれる場合はマップリンクとして扱う
        const isMapLink = item.link.url.includes('x.gd') || item.link.url.includes('maps.app.goo.gl');
        const linkClass = isMapLink ? 'link link-map' : 'link';
        html += `<a href="${item.link.url}" target="_blank" class="${linkClass}">${item.link.text}</a>`;
    }
    
    if (item.links && item.links.length > 0) {
        html += `<div class="links-container">`;
        item.links.forEach(link => {
            // URLにx.gdが含まれる場合はマップリンクとして扱う
            const isMapLink = link.url.includes('x.gd') || link.url.includes('maps.app.goo.gl');
            const linkClass = isMapLink ? 'link link-map' : 'link';
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
    
    // ラジオボタンの状態を設定
    const hasWorkRadios = document.querySelectorAll('input[name="hasWork"]');
    hasWorkRadios.forEach(radio => {
        radio.checked = radio.value === String(hasWork);
    });
    
    const lunchRadios = document.querySelectorAll('input[name="lunchOption"]');
    lunchRadios.forEach(radio => {
        radio.checked = radio.value === lunchOption;
    });
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
