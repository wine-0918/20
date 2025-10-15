document.addEventListener("DOMContentLoaded", function () {
    /* ヒントボタンとヒント表示エリア */
    const hintBtn = document.querySelector(".hint-btn");
    const hintsSection = document.querySelector(".hints");
    const hiddenContent = document.querySelector(".hidden-content");

    /* ヒントリスト */
    const hintTexts = [
        "最近使ってるブランドある？",
        "お出かけ前に欠かせない",
        "スキンケアやメイクで使うもの"
    ];

    /* ヒントボタンのクリックイベント */
    hintBtn.addEventListener("click", function () {
        hiddenContent.style.visibility = "visible"; // プレゼント内容を表示
        hintsSection.style.display = "block"; // ヒントセクションを開く
    });

    /* さらにヒントを見るボタンのクリックイベント */
    const moreHintsBtns = document.querySelectorAll(".more-hints");
    moreHintsBtns.forEach((btn, index) => {
        btn.addEventListener("click", function () {
            const hintParagraph = document.createElement("p"); // ヒント用のp要素を作成
            hintParagraph.innerText = hintTexts[index]; // ヒントの内容を設定
            btn.parentNode.insertBefore(hintParagraph, btn.nextSibling); // ボタンの下に挿入
            btn.style.display = "none"; // ボタンを非表示にする
        });
    });

    /* ★★ 回答チェック機能 ★★ */
    const answerInput = document.getElementById("answer-input");
    const answerSubmit = document.getElementById("answer-submit");
    const answerResult = document.getElementById("answer-result");
    const detailsSection = document.querySelector(".details-section");
    const openGiftBtnSection = document.querySelector(".open-gift-section");

    /* 正解リスト（衣類系ワード） */
    const correctAnswers = [
        "化粧品", "コスメ", "メイク道具", "メイク用品", "アイシャドウ", "口紅",
        "リップ", "ファンデーション", "チーク", "マスカラ", "アイライナー", "化粧水",
        "乳液", "美容液", "スキンケア", "パウダー", "メイクセット", "ネイル", "香水"
    ];


    /* 回答のチェック */
    answerSubmit.addEventListener("click", function () {
        const userAnswer = answerInput.value.trim();

        if (correctAnswers.includes(userAnswer)) {
            answerResult.innerText = "正解ぬ！🎉　さすがですわ";
            answerResult.style.color = "green";

            /* プレゼント開封ボタンを表示 */
            openGiftBtnSection.classList.remove("hidden");
        } else {
            answerResult.innerText = "違いますぬ";
            answerResult.style.color = "red";
        }
    });

    /* プレゼント開封ボタンのクリックイベント */
    const openGiftBtn = document.getElementById("open-gift-btn");
    openGiftBtn.addEventListener("click", function () {
        /* プレゼント詳細を表示（フェードイン効果） */
        detailsSection.classList.remove("hidden");
        detailsSection.style.opacity = "1";
        detailsSection.style.transform = "translateY(0)";

        /* ボタンを非表示にする */
        openGiftBtn.style.display = "none"; // クリック後にボタンを非表示
    });
});
