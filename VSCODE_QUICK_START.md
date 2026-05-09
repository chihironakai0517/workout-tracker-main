# ⚡ VS Code 5分クイックスタート - GitHubアップロード

## 🎯 目標: VS Code内でGitHubにアップロード完了

---

## ステップ1: VS Codeでプロジェクトを開く (30秒)

1. **VS Code起動**
2. `File` → `Open Folder...` をクリック
3. フォルダ選択: `C:\Users\user\.vscode\workout-tracker-main`
4. `Select Folder` をクリック

---

## ステップ2: Git初期化 (1分)

1. **ソースコントロールを開く**
   - 左側のバーでソースコントロールアイコンをクリック (`Ctrl+Shift+G`)
   - または: `View` → `Source Control`

2. **Git初期化**
   - "Initialize Repository" をクリック
   - すべてのファイルが表示されるまで待つ

3. **コミット作成**
   - すべてのファイルにチェックを入れる (`+` ボタン)
   - メッセージ: `Initial commit - Mobile fitness tracker app`
   - `✓` コミットボタンをクリック

---

## ステップ3: GitHubリポジトリ作成 (2分)

### 方法A: VS Codeから直接作成 (簡単)
1. ソースコントロールパネルの `...` → `Remote` → `Add Remote...` をクリック
2. リモート名: `origin`
3. URL: 空欄のまま `OK` をクリック
4. `Publish to GitHub` が表示されたらクリック
5. GitHub認証を完了
6. リポジトリ名: `workout-tracker`
7. `Publish` をクリック

### 方法B: ブラウザで作成
1. [github.com](https://github.com) を開く
2. `+` → `New repository`
3. 名前: `workout-tracker`
4. Publicを選択
5. `Create repository` をクリック
6. URLをコピー: `https://github.com/yourusername/workout-tracker.git`

---

## ステップ4: GitHubにプッシュ (1分)

1. **リモート設定** (方法Bの場合)
   - `...` → `Remote` → `Add Remote...`
   - 名前: `origin`
   - URL: コピーしたGitHub URL
   - `OK` をクリック

2. **プッシュ実行**
   - `...` → `Push` をクリック
   - または: `Push` ボタンをクリック

3. **認証**
   - GitHubで認証を求められたら完了

---

## ✅ 完了確認 (30秒)

1. **GitHub.comで確認**
   - リポジトリページを開く
   - ファイルが表示されているか確認

2. **VS Codeで確認**
   - ソースコントロールパネルが空になっているか確認
   - ステータスバーに `main` と表示されているか確認

---

## 🚀 次: Vercelデプロイ (3分)

1. **Vercelを開く**
   ```
   https://vercel.com
   ```

2. **GitHub連携**
   - GitHubアカウントでログイン
   - "Import Project" をクリック
   - `workout-tracker` リポジトリを選択

3. **デプロイ**
   - 自動検出されるので `Deploy` をクリック
   - 数分待つ

4. **URL取得**
   - `https://workout-tracker-xxx.vercel.app` のようなURLが発行

---

## 📱 スマホテスト (2分)

1. **ブラウザで開く**
   - VercelのURLにアクセス

2. **PWAインストール**
   - iPhone: 共有ボタン → "ホーム画面に追加"
   - Android: メニュー → "アプリをインストール"

3. **テスト**
   - オフラインでも動作するか確認
   - タイマーが動作するか確認

---

## 🎉 完了！

**あなたのワークアウトアプリが世界中で使えるようになりました！**

### 📊 何ができた？
- ✅ GitHubにコードがアップロード
- ✅ Vercelで自動デプロイ
- ✅ スマホでPWAとしてインストール可能
- ✅ オフライン動作確認

### 🆘 問題が発生したら
- **[VSCODE_GIT_GUIDE.md](VSCODE_GIT_GUIDE.md)** で詳細確認
- **[DEPLOYMENT.md](DEPLOYMENT.md)** でデプロイ詳細
- **[MOBILE_GUIDE.md](MOBILE_GUIDE.md)** でスマホ使用方法

---

**VS Code内で完結して、快適に開発を続けましょう！💪**
