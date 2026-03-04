// 日程切り替え機能
document.addEventListener('DOMContentLoaded', function() {
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
});
