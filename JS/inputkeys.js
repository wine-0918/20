/* 右クリックメニューを無効化 */
document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});

/* キーボードショートカットを無効化 */
document.addEventListener('keydown', function (event) {
    if (
        event.key === "F12" || 
        (event.ctrlKey && event.shiftKey && (event.key === "I" || event.key === "J")) || 
        (event.ctrlKey && event.key === "U")
    ) {
        event.preventDefault();
    }
});

/* 開発者ツールの影響を無効化 */
(function() {
    let threshold = 160; // 開発者ツールのウィンドウサイズ閾値
    function neutralizeDevTools() {
        if (window.outerWidth - window.innerWidth > threshold || 
            window.outerHeight - window.innerHeight > threshold) {
            // 何もしないが、開発者ツールの影響を防ぐ
            console.clear(); // コンソールをクリア
        }
    }
    setInterval(neutralizeDevTools, 1000);
})();

/* コンソールの無力化 */
setInterval(() => {
    console.log = function() {}; // console.logを無効化
    console.warn = function() {}; // console.warnを無効化
    console.error = function() {}; // console.errorを無効化
}, 1000);

Object.defineProperty(window, "console", {
    get: function() {
        return {}; // コンソールを空のオブジェクトにする
    },
    configurable: false
});
