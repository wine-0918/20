// JSONデータを読み込んでスケジュールを動的に生成
let scheduleData = null;

document.addEventListener('DOMContentLoaded', async function() {
    // JSONデータを読み込み
    await loadScheduleData();
    
    // イベント情報を表示
    displayEventInfo();
    
    // スケジュールを生成
    generateSchedule();
    
    // 日程切り替え機能を設定
    setupDaySelector();
    
    // アコーディオン機能を設定
    setupAccordion();
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
    let html = `<h2 class="day-title">${day1Data.title}</h2>`;
    
    // ルートセクション（アコーディオン形式）
    html += `
        <div class="route-section">
            <div class="route-section-header">
                <h3 class="section-title">${day1Data.route.title}</h3>
                <span class="route-toggle-icon">▼</span>
            </div>
            <div class="route-content">
                <div class="route-flow">
    `;
    
    day1Data.route.points.forEach((point, index) => {
        html += `<span class="route-point">${point}</span>`;
        if (index < day1Data.route.points.length - 1) {
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
    day1Data.timeline.forEach(item => {
        html += generateTimelineItem(item);
    });
    
    html += `</div>`;
    
    // 補足
    if (day1Data.notes && day1Data.notes.length > 0) {
        html += `
            <div class="note-box">
                <div class="note-title">補足</div>
                <ul>
        `;
        day1Data.notes.forEach(note => {
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
                    <h3 class="section-title">${day2Data.route.title}</h3>
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
    
    container.innerHTML = html;
}

// 3日目の生成
function generateDay3(day3Data) {
    const container = document.getElementById('day-3');
    let html = `<h2 class="day-title">${day3Data.title}</h2>`;
    
    // ルートセクション（アコーディオン形式）
    if (day3Data.route) {
        html += `
            <div class="route-section">
                <div class="route-section-header">
                    <h3 class="section-title">${day3Data.route.title}</h3>
                    <span class="route-toggle-icon">▼</span>
                </div>
                <div class="route-content">
                    <div class="route-flow">
        `;
        
        day3Data.route.points.forEach((point, index) => {
            html += `<span class="route-point">${point}</span>`;
            if (index < day3Data.route.points.length - 1) {
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
    day3Data.timeline.forEach(item => {
        html += generateTimelineItem(item);
    });
    
    html += `</div>`;
    
    // 補足
    if (day3Data.notes && day3Data.notes.length > 0) {
        html += `
            <div class="note-box">
                <div class="note-title">補足</div>
                <ul>
        `;
        day3Data.notes.forEach(note => {
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
        html += `<a href="${item.link.url}" target="_blank" class="link">${item.link.text}</a>`;
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
