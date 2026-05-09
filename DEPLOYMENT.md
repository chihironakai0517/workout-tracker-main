# デプロイメントガイド

このアプリをGitHubにアップロードしてスマホでも使えるようにするステップです。

## 1️⃣ GitHubにアップロード

### リポジトリ作成
1. GitHub.com にログイン
2. 右上の `+` → `New repository`
3. リポジトリ名: `workout-tracker`
4. 説明を入力
5. Public を選択
6. "Create repository" をクリック

### ローカルからプッシュ
```bash
# Windows PowerShell または Git Bash で実行
cd c:\Users\user\.vscode\workout-tracker-main

# GitHubが提供するコマンドを実行（GitHubのリポジトリページから確認）
# 例：
git remote add origin https://github.com/yourusername/workout-tracker.git
git branch -M main
git push -u origin main
```

**注意**: Gitがインストールされていない場合は、[GitHub Desktop](https://desktop.github.com/) をダウンロードしてください。

## 2️⃣ Vercelへのデプロイ（推奨）

Vercelは Next.js の公式推奨ホストです。無料プランあり。

### デプロイ手順
1. [vercel.com](https://vercel.com) にアクセス
2. GitHubアカウントでサインアップ/ログイン
3. "New Project" をクリック
4. GitHubリポジトリを検索して選択
5. Vercelが自動でNext.js設定を検出
6. "Deploy" をクリック

**完了後のURL**: `https://workout-tracker-<ランダム>.vercel.app`

### Vercelからの自動デプロイ
- GitHubに `git push` するたびに自動で更新
- 本番環境: main ブランチ
- プレビュー環境: Pull Request ごと

## 3️⃣ スマホでアクセス

### ブラウザでアクセス
1. スマホで `https://workout-tracker-<ランダム>.vercel.app` を開く
2. ブックマークに追加

### PWA アプリとしてインストール

#### iOS (iPhone/iPad)
1. Safari で アプリを開く
2. 共有ボタン（↑）をタップ
3. "ホーム画面に追加" をタップ
4. 名前をつけて "追加" をタップ

#### Android
1. Chrome/Edge で アプリを開く
2. メニュー（⋮）をタップ
3. "アプリをインストール" をタップ
4. "インストール" をタップ

**インストール後**:
- スマホのホーム画面から直接起動
- ネイティブアプリのように動作
- オフラインでも使用可能

## 4️⃣ データバックアップ

### ローカルデータのエクスポート

1. ホーム画面 → "Workout" → "Sync" をクリック
2. "Export Data" をクリック
3. JSON ファイルがダウンロードされます

### 複数デバイスでの同期

1. 別のデバイスで同じリンクを開く
2. "Sync" → "Import Data" をクリック
3. エクスポートしたJSONファイルを選択

## 5️⃣ カスタマイズ

### ドメイン設定（Vercel）
1. Vercelのプロジェクト設定
2. "Domains" セクション
3. カスタムドメインを追加

### アイコン変更
```bash
# SVGアイコンから自動生成
npm run generate-icons
```

### アプリ名変更
`public/manifest.json` を編集:
```json
{
  "name": "Your App Name",
  "short_name": "YourApp",
  ...
}
```

## 🔒 セキュリティチェックリスト

- [ ] `.env` ファイルが `.gitignore` に含まれている
- [ ] API キーは使用していない（ローカル保存のみ）
- [ ] HTTPS で配信（Vercel が自動で対応）
- [ ] Service Worker が正しく動作

## 📱 スマホ対応の確認

### チェック項目
- ✅ レスポンシブデザイン
- ✅ タッチフレンドリー (44px以上のボタン)
- ✅ viewport メタタグ設定済み
- ✅ PWA マニフェスト設定
- ✅ Service Worker 登録済み
- ✅ Safariでの動作確認

### ブラウザDevTools でテスト
1. F12 または 右クリック → 検証
2. Ctrl+Shift+M (またはプレビュー設定)
3. iPhone/Android で確認

## 🆘 トラブルシューティング

### Vercelでビルドエラー
```bash
# ローカルでビルド確認
npm run build
```

### PWAがインストール不可
- HTTPS配信であることを確認
- manifest.json が正しく設定されているか確認
- Service Worker が登録されているか確認
  → ブラウザの開発者ツール → Application → Service Workers

### データが表示されない
- Local Storage が有効か確認
- プライベート/シークレットモードを使用していないか確認
- キャッシュをクリアして再度アクセス

## 📊 推奨環境

| デバイス | ブラウザ | 対応状況 |
|---------|---------|--------|
| iPhone 12+ | Safari | ✅ 推奨 |
| Android 8+ | Chrome | ✅ 推奨 |
| iPad | Safari | ✅ 対応 |
| Desktop | Chrome/Firefox/Edge | ✅ 対応 |

## 💡 Tips

1. **コールドスタート時間**: Vercel Free は稍遅い場合があります → Pro プラン検討
2. **データ容量**: Local Storage は 5-10MB が目安
3. **通知**: PWA通知はサーバー経由（デフォルト無し）
4. **オフライン**: すべてローカルで動作

---

**質問や問題がある場合**: GitHub Issues で報告してください！
