# 🔍 デバッグ手順 - "Failed to fetch" エラーが発生している場合

## ステップ 1: ブラウザのデベロッパーツールを開く

1. ページを開いた状態で **F12** キーを押す
2. **Console** タブを開く

## ステップ 2: ブラウザのコンソールログを確認

ページをリロード（Ctrl+R または Cmd+R）して、以下のログを探してください：

```
[API] Using API_BASE_URL: http://localhost:8000/api
[API] Requesting: http://localhost:8000/api/sales
[API] Response status: 200
[API] Success: got response of 10101 bytes
```

### ログが表示されていない場合
→ ブラウザのキャッシュをクリアしてください
- **キャッシュクリア**: F12 → Application タブ → キャッシュを削除

### エラーログが表示されている場合
→ 以下のセクションで原因を特定してください

## ステップ 3: Network タブで API リクエストを確認

1. **Network** タブを開く
2. ページをリロード
3. `sales` というリクエストを探してクリック
4. **Response** タブを確認

### 期待される応答
```json
{
  "items": [
    { "id": "S001", "date": "2026-06-01", ... },
    ...
  ],
  "count": 60
}
```

### 赤いエラーが表示されている場合
→ リクエストをクリックして **Headers** タブを確認：
- Status code が 200 か？
  - Yes: CORS またはネットワークの問題
  - No: サーバーエラー

## ステップ 4: よくある問題と解決方法

### A. 「Failed to fetch」でサーバーに接続できない
**確認事項**:
1. ターミナルで以下を実行：
   ```bash
   curl -v http://localhost:8000/api/sales
   ```
   → Response: `200 OK` が返ってくるはず

2. ブラウザで http://localhost:5173 にアクセスできるか確認
   → Dashboard が表示されるはず

3. localhost と 127.0.0.1 の区別を確認
   - 現在のブラウザアドレス: `http://localhost:5173` か `http://127.0.0.1:5173` か？
   - コンソールで `[API] Using API_BASE_URL:` の値を確認

**解決方法**:
```bash
# ターミナル 1: バックエンドを再起動
cd /workspaces/3414446/backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000

# ターミナル 2: フロントエンドを再起動
cd /workspaces/3414446/frontend
npm run dev

# ブラウザで アクセス
http://localhost:5173
```

### B. CORS エラーが表示されている
**確認事項**:
```bash
curl -i -H "Origin: http://localhost:5173" http://localhost:8000/api/sales | grep access-control
```

**期待される出力**:
```
access-control-allow-origin: http://localhost:5173
```

**解決方法**:
1. バックエンドプロセスを確認
   ```bash
   ps aux | grep uvicorn
   ```

2. 古いプロセスを削除
   ```bash
   kill <PID>
   ```

3. バックエンドを再起動（上記参照）

### C. Network タブに API リクエストが表示されない
**原因**: ページの読み込み時にリクエストが起動しない

**解決方法**:
1. 絶対リロード: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
2. ブラウザのキャッシュをクリア
3. 次のコマンドでブラウザのストレージをクリア：
   ```javascript
   // Console タブで実行
   localStorage.clear()
   sessionStorage.clear()
   ```

## ステップ 5: システム状態確認

ターミナルで以下を実行して、全システムが起動しているか確認：

```bash
# バックエンドが起動しているか
ps aux | grep "uvicorn main" | grep -v grep

# フロントエンドが起動しているか
ps aux | grep "vite\|npm run dev" | grep -v grep

# ポートがリッスンしているか
netstat -tlnp | grep -E "5173|8000"  # Linux
lsof -i :5173 -i :8000               # Mac
```

## ステップ 6: API 直接テスト

ターミナルで以下を実行：

```bash
# サマリーデータ取得
curl http://localhost:8000/api/dashboard/summary?start_date=2026-06-01&end_date=2026-06-30

# 期待される応答
{"total_sales":4022640.0,"order_count":60}
```

## 最終確認チェックリスト

- [ ] ブラウザで http://localhost:5173 にアクセスできる
- [ ] Console タブに `[API]` で始まるログが表示される
- [ ] Network タブに `/api/sales` リクエストが表示される
- [ ] `curl http://localhost:8000/api/sales` が 200 OK を返す
- [ ] バックエンドプロセスが実行中（`ps aux | grep uvicorn`）
- [ ] ポート 8000 がリッスン中（`netstat -tlnp | grep 8000`）

## それでも解決しない場合

以下の情報をキャプチャして報告してください：

1. **Console タブの全ログ** (スクリーンショットではなくテキスト)
2. **Network タブでの API リクエスト詳細**
   - Request Headers
   - Response Status
   - Response Body (最初の数行)
3. **ブラウザで現在アクセスしている URL**
4. **ターミナルでの出力**
   - `curl -v http://localhost:8000/api/sales`
   - `ps aux | grep -E "uvicorn|vite"`

## サーバー再起動スクリプト

すべてをリセットしたい場合：

```bash
# 全プロセスを終了
pkill -f "uvicorn|vite|npm" 2>/dev/null

# バックエンドを起動
cd /workspaces/3414446/backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 &

# フロントエンドを起動
cd /workspaces/3414446/frontend
npm run dev &

# 待機
sleep 5

# テスト
curl http://localhost:8000/api/dashboard/summary?start_date=2026-06-01&end_date=2026-06-30
```

その後、ブラウザで http://localhost:5173 を開いてください。
