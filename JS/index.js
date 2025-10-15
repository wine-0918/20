// JS/welcome.js
function checkPassword() {
    const password = document.getElementById('password').value;
    const correctPassword = '0901'; // ここに正しいパスワードを設定

    // パスワードが正しいか確認
    if (password === correctPassword) {
        // メッセージと入力フォームを非表示にする
        document.getElementById('welcome-screen').style.display = 'none';
        
        // 次のページへ遷移
        window.location.href = 'HTML/home.html'; // 次のページのURLを指定
    } else {
        // エラーメッセージを表示
        document.getElementById('error-message').style.display = 'block';
    }
}
