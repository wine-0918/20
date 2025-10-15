document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll("section"); // すべてのセクションを取得

    function fadeInSections() {
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            if (rect.top < windowHeight * 0.8) { // 80% の位置に来たら表示
                section.classList.add("active");
            }
        });
    }

    // 初回チェック
    fadeInSections();

    // スクロールイベントでチェック
    window.addEventListener("scroll", fadeInSections);

    // 初期状態でクラスを適用
    sections.forEach(section => section.classList.add("fade-in"));
});


// プレゼントボタンのクリックイベントを処理
document.addEventListener('DOMContentLoaded', () => {
    // すべてのプレゼントボタンを取得
    const giftButtons = document.querySelectorAll('.celebration-btn');

    // ボタンがクリックされたときの処理
    giftButtons.forEach(button => {
        button.addEventListener('click', () => {
            // ボタンのdata-url属性からリンク先を取得
            const url = button.getAttribute('data-url');
            
            // ロックされていないボタンの場合、リンクに遷移
            if (!button.classList.contains('locked')) {
                window.location.href = url;
            } else {
                alert('まだ解禁されていません。');
            }
        });
    });
});


