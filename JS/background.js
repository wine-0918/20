document.addEventListener("DOMContentLoaded", function () {
    generateShapes();
});

function generateShapes() {
    const shapeCount = Math.floor(Math.random() * 31) + 20; // 20〜50個
    const shapes = ["★", "■", "▲", "●", "◆", "♦", "□", "○", "△", "☆"];
    const body = document.body;
    const width = window.innerWidth;
    const height = window.innerHeight;

    for (let i = 0; i < shapeCount; i++) {
        const shape = document.createElement("div");
        shape.classList.add("shape");
        shape.textContent = shapes[Math.floor(Math.random() * shapes.length)];

        /* ランダムな位置 & サイズ設定 */
        const size = Math.random() * 30 + 10; // 10px〜40px
        shape.style.fontSize = `${size}px`;
        shape.style.position = "fixed"; // fixedに変更してスクロールしても位置が固定されるように
        shape.style.left = `${Math.random() * width}px`;
        shape.style.top = `${Math.random() * height}px`;

        // ランダムな色を生成（RGBA形式）
        const randomColor = `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.12)`; // 透明度を0.12に設定
        shape.style.color = randomColor; // ランダムな色を適用

        shape.style.userSelect = "none"; // 選択不可
        shape.style.transition = "left 2s linear, top 2s linear"; // スムーズな移動

        body.appendChild(shape);
        moveShape(shape);
    }
}

function moveShape(shape) {
    function updatePosition() {
        /* ランダムな方向にスムーズに移動 */
        const xMove = (Math.random() - 0.5) * 50; // -25px 〜 +25px の範囲
        const yMove = (Math.random() - 0.5) * 50; // -25px 〜 +25px の範囲

        /* 現在の位置を取得 */
        const currentX = parseFloat(shape.style.left);
        const currentY = parseFloat(shape.style.top);

        /* 画面内に収める */
        const newX = Math.min(Math.max(currentX + xMove, 0), window.innerWidth - 40);
        const newY = Math.min(Math.max(currentY + yMove, 0), window.innerHeight - 40);

        shape.style.left = `${newX}px`;
        shape.style.top = `${newY}px`;

        /* 継続的に移動 */
        setTimeout(updatePosition, 2000); // 2秒ごとに移動
    }

    updatePosition(); // 初回実行
}
