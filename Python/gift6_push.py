import os
import subprocess

# コミットするファイルパス
file_path = "20/HTML/Celebration/gift6.html"

# git 設定
commit_message = "gift6 テスト内容を自動コミット"

# git add
subprocess.run(["git", "add", file_path], check=True)

# git commit
subprocess.run(["git", "commit", "-m", commit_message], check=True)

# git push
subprocess.run(["git", "push"], check=True)