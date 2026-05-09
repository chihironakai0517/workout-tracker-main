# GitHub Desktopでアップロードする方法

GitHub Desktopを使ってコマンドラインを使わずにプロジェクトをGitHubにアップロードする手順です。

## 1️⃣ GitHub Desktopのインストール

### ダウンロード
1. [GitHub Desktop公式サイト](https://desktop.github.com/) にアクセス
2. "Download for Windows" をクリック
3. ダウンロードされたインストーラーを実行
4. インストール完了まで待つ

### 初期設定
1. GitHub Desktopを起動
2. GitHubアカウントでサインイン
   - "Sign in to GitHub.com" をクリック
   - ブラウザでGitHub認証
   - 許可をクリック

## 2️⃣ リポジトリの作成

### GitHub.comでリポジトリ作成
1. [GitHub.com](https://github.com) にブラウザでアクセス
2. 右上の `+` → `New repository` をクリック
3. 以下の設定:
   - **Repository name**: `workout-tracker` (または好きな名前)
   - **Description**: `A mobile-first workout and health tracking app`
   - **Public** を選択 (誰でも見れるようにする)
   - ✅ **Add a README file** のチェックを外す (後でアップロードする)
   - ✅ **Add .gitignore** のチェックを外す (プロジェクトに既にある)
   - ✅ **Choose a license** は任意
4. "Create repository" をクリック

### URLをコピー
作成されたリポジトリのページで、緑色の "Code" ボタンをクリックし、URLをコピー:
```
https://github.com/yourusername/workout-tracker.git
```

## 3️⃣ GitHub Desktopでプロジェクトを追加

### プロジェクトフォルダを開く
1. GitHub Desktopを起動
2. "File" → "Add local repository..." をクリック
3. "Choose..." をクリック
4. プロジェクトフォルダを選択: `C:\Users\user\.vscode\workout-tracker-main`
5. "Add repository" をクリック

### リモートリポジトリを設定
1. 画面上部の "Publish repository" ボタンをクリック
2. 以下の設定:
   - **Name**: `workout-tracker` (自動設定される)
   - **Description**: `A mobile-first workout and health tracking app`
   - **Keep this code private** のチェックを外す (Publicにする)
3. "Publish repository" をクリック

## 4️⃣ ファイルをコミットしてプッシュ

### コミット作成
1. GitHub Desktopの左側に変更されたファイルが表示される
2. コミットメッセージを入力:
   ```
   Initial commit - Mobile fitness tracker app
   ```
3. "Commit to main" をクリック

### GitHubにプッシュ
1. 上部の "Push origin" ボタンをクリック
2. プッシュが完了するまで待つ
3. ブラウザでGitHubリポジトリを開いてファイルがアップロードされていることを確認

## 5️⃣ 確認

### GitHubで確認
1. [GitHub.com](https://github.com/yourusername/workout-tracker) を開く
2. すべてのファイルがアップロードされていることを確認
3. "README.md" などのファイルが表示されている

### ローカルで確認
- GitHub Desktopで "Fetch origin" をクリックして同期を確認
- 変更が同期されていることを確認

## 🎯 トラブルシューティング

### エラー: "Repository not found"
- GitHubリポジトリが正しく作成されているか確認
- URLが正しくコピーされているか確認

### エラー: "Authentication failed"
- GitHub Desktopでサインアウト→サインインし直す
- GitHub.comでPersonal Access Tokenを作成する必要がある場合あり

### ファイルが表示されない
- コミットが完了しているか確認
- "Push origin" が完了しているか確認
- GitHub.comをリロード

### 大きなファイルがアップロードできない
- プロジェクトに大きなファイルがないか確認
- `.gitignore` で除外されているか確認

## 💡 Tips

1. **定期的にコミット**: 小さな変更ごとにコミットする
2. **分かりやすいメッセージ**: 何を変更したか明確に書く
3. **ブランチを使う**: 実験的な変更は別ブランチで
4. **同期を忘れずに**: 作業前に "Fetch origin" をクリック

## 🔄 今後のワークフロー

### 変更をプッシュする手順
1. コードを編集
2. GitHub Desktopで変更を確認
3. コミットメッセージを書く
4. "Commit to main" をクリック
5. "Push origin" をクリック

### 変更をプルする手順
1. "Fetch origin" をクリック
2. "Pull origin" をクリック

---

**これでGitHub Desktopを使って簡単にアップロードできます！**
コマンドラインより直感的で使いやすいです。
