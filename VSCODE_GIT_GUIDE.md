# VS Code内でGitHubにアップロードする方法

VS CodeのGit統合機能を使って、コマンドラインを使わずにGitHubにアップロードします。

## 1️⃣ Gitのインストール確認

### VS CodeでGitが使えるか確認
1. VS Codeを開く
2. 左側のアクティビティバーで **ソースコントロール** アイコンをクリック (または `Ctrl+Shift+G`)
3. Gitがインストールされていない場合、以下のメッセージが表示される:
   ```
   Git was not detected on your system. Would you like to download it?
   ```

### Gitをインストール
1. 上記のメッセージで "Download Git" をクリック
2. 公式Gitインストーラーがダウンロードされる
3. インストーラーを実行してGitをインストール
4. VS Codeを再起動

## 2️⃣ VS Codeでプロジェクトを開く

1. VS Codeを開く
2. `File` → `Open Folder...` をクリック
3. プロジェクトフォルダを選択: `C:\Users\user\.vscode\workout-tracker-main`
4. `Select Folder` をクリック

## 3️⃣ Gitリポジトリの初期化

### VS CodeでGit初期化
1. ソースコントロールパネルで `Initialize Repository` をクリック
2. または、VS Codeのターミナルで:
   ```bash
   git init
   ```

### すべてのファイルをステージング
1. ソースコントロールパネルで `+` ボタンをクリック (すべてのファイルをステージング)
2. または、VS Codeターミナルで:
   ```bash
   git add .
   ```

### コミット作成
1. コミットメッセージを入力: `Initial commit - Mobile fitness tracker app`
2. `✓` ボタンをクリック (コミット)
3. または、VS Codeターミナルで:
   ```bash
   git commit -m "Initial commit - Mobile fitness tracker app"
   ```

## 4️⃣ GitHubリポジトリの作成

### VS Codeから直接作成 (推奨)
1. ソースコントロールパネルで `...` → `Remote` → `Add Remote...` をクリック
2. リモート名: `origin`
3. リモートURL: 空欄のまま `OK` をクリック

### ブラウザでGitHubリポジトリ作成
1. [GitHub.com](https://github.com) をブラウザで開く
2. 右上の `+` → `New repository` をクリック
3. 設定:
   - **Repository name**: `workout-tracker`
   - **Description**: `Mobile fitness tracker app`
   - **Public** を選択
   - **Add a README file** のチェックを外す
   - **Add .gitignore** のチェックを外す
4. `Create repository` をクリック

### リモートURLを設定
1. GitHubリポジトリページで緑の `Code` ボタンをクリック
2. URLをコピー: `https://github.com/yourusername/workout-tracker.git`
3. VS Codeに戻り、ソースコントロールパネルで `...` → `Remote` → `Add Remote...` をクリック
4. リモート名: `origin`
5. リモートURL: コピーしたURLを貼り付け
6. `OK` をクリック

## 5️⃣ GitHubにプッシュ

### VS Codeからプッシュ
1. ソースコントロールパネルで `...` → `Push` をクリック
2. または、VS Codeターミナルで:
   ```bash
   git push -u origin main
   ```

### 認証
- GitHubアカウントで認証を求められる場合があります
- ブラウザが開いて認証を完了してください

## 6️⃣ 確認

### GitHubで確認
1. [GitHub.com](https://github.com/yourusername/workout-tracker) をブラウザで開く
2. すべてのファイルがアップロードされていることを確認

### VS Codeで確認
- ソースコントロールパネルに変更がないことを確認
- ステータスバーに `main` ブランチが表示されていることを確認

## 🎯 VS Code Git機能の使い方

### 基本操作
- **ステージング**: ファイル名の横の `+` をクリック
- **コミット**: コミットメッセージ入力後 `✓` をクリック
- **プッシュ**: `...` → `Push` をクリック
- **プル**: `...` → `Pull` をクリック

### 変更の確認
- ソースコントロールパネルで変更されたファイルを確認
- ファイル名のクリックで差分を表示

### ブランチ管理
- ステータスバーで現在のブランチを確認
- `...` → `Branch` → `Create Branch...` で新規ブランチ作成

## 💡 Tips

1. **自動保存**: VS Codeの自動保存を有効にしておくと便利
2. **GitLens拡張**: より高度なGit機能を追加 (オプション)
3. **コミット頻度**: 小さな変更ごとにコミットする習慣をつける
4. **コミットメッセージ**: 何を変更したか明確に書く

## 🆘 トラブルシューティング

### "Git not found" エラー
- Gitをインストールし、VS Codeを再起動
- システム環境変数PATHにGitが含まれているか確認

### プッシュが失敗
- GitHub認証を確認
- リモートURLが正しいか確認
- インターネット接続を確認

### ファイルが大きい
- `.gitignore` で不要なファイルを除外
- 大きなファイルをGit LFSで管理 (オプション)

### 競合が発生
- `...` → `Pull` で最新の変更を取得
- 競合を解決してからコミット

## 🔄 今後のワークフロー

### 日常の使用
1. コードを編集
2. ソースコントロールパネルで変更を確認
3. ステージング (`+` ボタン)
4. コミットメッセージ入力
5. コミット (`✓` ボタン)
6. プッシュ (`...` → `Push`)

### チーム開発
- `...` → `Pull` で最新の変更を取得
- ブランチを作成して作業
- Pull Requestで変更を提案

---

**VS Code内で完結して、快適にGitHub管理ができます！**
