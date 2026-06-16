# トラブルシューティングガイド

## "Network error while requesting" エラーが表示される場合

### 問題の原因

ブラウザからバックエンドへの API リクエストが失敗しています。

### デバッグ方法

1. **ブラウザの開発者ツール (DevTools) を開く**
   - F12 キーを押すか、右クリック → 検査を選択

2. **Console タブを確認**
   - `[API]` で始まるログメッセージを探してください
   - 例：
     - `[API] Requesting: http://localhost:8000/api/sales`
     - `[API] Response status: 200`
     - `[API] Success: got response of 10101 bytes`

3. **Network タブを確認**
   - ページをリロード（F5 または Ctrl+R）
   - API リクエスト（例：`sales`, `summary`, `by-product`, `by-date`）を探す
   - エラー状態のリクエストをクリックして詳細を確認

### よくある問題と解決方法

#### 1. リクエストが送信されていない
**症状**: Network タブに API リクエストが表示されない
**解決方法**:
- ブラウザをハードリロード: Ctrl+Shift+R （Windows）/ Cmd+Shift+R （Mac）
- ブラウザのキャッシュをクリア

#### 2. リクエストが失敗している（赤い表示）
**症状**: Network タブに赤いリクエストが表示される
**確認事項**:
- ブラウザのコンソールに `[API] Response status:` のログはありますか？
  - 200 → 成功（エラーメッセージは別の原因）
  - その他 → サーバーエラー
  
#### 3. CORS エラーが表示される
**症状**: Console に「Access to XMLHttpRequest... CORS policy」というエラー
**原因**: バックエンドとフロントエンドが異なるオリジンで実行されている
**解決方法**:
- バックエンドが正しくすべてのネットワークインターフェイス（0.0.0.0）にバインドされているか確認
- 起動コマンド: `python -m uvicorn main:app --host 0.0.0.0 --port 8000`

#### 4. "Failed to fetch" エラーが表示される
**症状**: `Network error while requesting http://localhost:8000/api/sales: Failed to fetch`
**原因**: ブラウザが localhost:8000 に接続できない
**解決方法**:

a) **127.0.0.1 vs localhost の問題**
   - 現在のコード (v2.1) は自動的に判定します
   - ブラウザで `localhost` でアクセスしているか、`127.0.0.1` でアクセスしているかを確認
   - Console に `[API] Using API_BASE_URL:` というログを確認

b) **ファイアウォール問題**
   - ローカルマシン: ファイアウォールが localhost:8000 をブロックしていないか確認
   - リモート環境: ポート 8000 が開いているか確認

c) **DNS 解決の問題**
   - Hosts ファイルに `127.0.0.1 localhost` が含まれているか確認
   - Linux/Mac: `/etc/hosts`
   - Windows: `C:\Windows\System32\drivers\etc\hosts`

### バックエンド確認コマンド

```bash
# バックエンドが起動しているか確認
curl http://localhost:8000/api/sales

# CORS が正しく設定されているか確認（Origin ヘッダ付きで）
curl -v -H "Origin: http://localhost:5173" http://localhost:8000/api/sales

# ポートがリッスンしているか確認
netstat -tlnp | grep 8000  # Linux
lsof -i :8000              # Mac
netstat -ano | findstr :8000  # Windows
```

### フロントエンド再起動

```bash
cd /workspaces/3414446/frontend
npm run dev
# ブラウザで http://localhost:5173 を開く
```

### バックエンド再起動

```bash
cd /workspaces/3414446/backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

## 最新の修正（v2.1）

- **API_BASE_URL が動的に決定** されるようになりました
- ブラウザのホスト名に基づいて自動的に正しいバックエンド URL を使用します
- Console ログが詳細になり、デバッグが容易になりました

## さらにサポートが必要な場合

以下の情報を記録して報告してください：

1. ブラウザのコンソール全体のテキスト（スクリーンショットではなく）
2. Network タブでのエラーリクエストの詳細
3. ブラウザでアクセスしている URL（例：`http://localhost:5173` など）
4. バックエンドの起動コマンド
