const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const resetBtn = document.getElementById("reset-btn");
const timerEl = document.getElementById("timer");
const resultMessage = document.getElementById("result-message");
const detailsSection = document.querySelector(".details-section");
const openGiftSection = document.querySelector(".open-gift-section");
const openGiftBtn = document.getElementById("open-gift-btn");

let startTime = null;
let timerId = null;
let fadeTimeout = null;

/** タイマー表示を更新 */
function updateTimer() {
    const now = performance.now();
    const elapsed = (now - startTime) / 1000;
    timerEl.textContent = elapsed.toFixed(2) + "秒";
}

/** タイマー開始処理 */
startBtn.addEventListener("click", () => {
    startTime = performance.now();
    timerEl.textContent = "0.00秒";

    // タイマー表示リセット＆表示
    timerEl.style.display = "block";
    timerEl.style.opacity = "1";
    timerEl.style.transition = "none";

    resultMessage.textContent = "タイマー開始！";
    resultMessage.style.opacity = "1";
    resultMessage.style.transition = "none";
    resultMessage.style.display = "block";

    detailsSection.classList.add("hidden");
    openGiftSection.classList.add("hidden");
    detailsSection.style.opacity = "0";
    detailsSection.style.transform = "translateY(20px)";

    if (timerId) clearInterval(timerId);
    timerId = setInterval(updateTimer, 10);

    startBtn.disabled = true;
    stopBtn.disabled = false;
    resetBtn.disabled = true;

    if (fadeTimeout) clearTimeout(fadeTimeout);

    // 3秒後にメッセージとタイマーをフェードアウト開始
    setTimeout(() => {
        resultMessage.style.transition = "opacity 1s ease";
        resultMessage.style.opacity = "0";
        timerEl.style.transition = "opacity 1s ease";
        timerEl.style.opacity = "0";
    }, 3000);

    // 4秒後に非表示に切り替え
    fadeTimeout = setTimeout(() => {
        resultMessage.style.display = "none";
        timerEl.style.display = "none";
    }, 4000);
});

/** タイマー停止処理 */
stopBtn.addEventListener("click", () => {
    if (!timerId) return; // 動いてなければ無視

    clearInterval(timerId);
    timerId = null;

    const now = performance.now();
    const elapsed = ((now - startTime) / 1000).toFixed(2);

    // 結果メッセージに経過時間を表示
    resultMessage.textContent = `ストップ！`;
    resultMessage.style.opacity = "1";
    resultMessage.style.transition = "none";
    resultMessage.style.display = "block";

    // タイマーもそのまま見せる（透明度戻す）
    timerEl.style.opacity = "1";
    timerEl.style.transition = "none";
    timerEl.style.display = "block";

    // プレゼント開封ボタンの表示制御

    // 【テスト用：1秒以上5秒以下で表示】
    // if (elapsed >= 1 && elapsed <= 5) {
    //     openGiftSection.classList.remove("hidden");  // 追加：親セクションを表示
    //     openGiftBtn.style.display = "inline-block"; // ボタンを表示
    // } else {
    //     openGiftSection.classList.add("hidden");  // 親セクション非表示
    //     openGiftBtn.style.display = "none";       // ボタン非表示
    // }

    // 【通常用：10秒ぴったりの時に表示（±0.1秒の範囲内で許容）】
    if (Math.abs(elapsed - 10) < 0.1) {
        openGiftSection.classList.remove("hidden");  // 追加：親セクションを表示
        openGiftBtn.style.display = "inline-block"; // ボタンを表示
    } else {
        openGiftSection.classList.add("hidden");  // 親セクション非表示
        openGiftBtn.style.display = "none";       // ボタン非表示
    }

    startBtn.disabled = false;
    stopBtn.disabled = true;
    resetBtn.disabled = false;

    if (fadeTimeout) {
        clearTimeout(fadeTimeout);
        fadeTimeout = null;
    }
});

/** リセット処理 */
resetBtn.addEventListener("click", () => {
    timerEl.textContent = "0.00秒";
    resultMessage.textContent = "";
    resultMessage.style.opacity = "1";
    resultMessage.style.display = "block";

    detailsSection.classList.add("hidden");
    openGiftSection.classList.add("hidden");  // 追加：リセット時は親セクションも非表示
    detailsSection.style.opacity = "0";
    detailsSection.style.transform = "translateY(20px)";

    startTime = null;

    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
    if (fadeTimeout) {
        clearTimeout(fadeTimeout);
        fadeTimeout = null;
    }

    // タイマーとプレゼント開封ボタンもリセットして非表示
    timerEl.style.display = "block";
    timerEl.style.opacity = "1";
    timerEl.style.transition = "none";

    openGiftBtn.style.display = "none";

    startBtn.disabled = false;
    stopBtn.disabled = true;
    resetBtn.disabled = true;
});

/** プレゼント開封ボタン */
openGiftBtn.addEventListener("click", () => {
    detailsSection.classList.remove("hidden");
    detailsSection.style.opacity = "1";
    detailsSection.style.transform = "translateY(0)";
});
