# 🧪 API Connection Test Guide

このガイドを使用して、API 接続の問題を診断してください。

## クイックスタート

1. **ブラウザで以下を開く**:
   ```
   http://localhost:5173/test.html
   ```

2. **各テストボタンをクリック**してから以下を確認：
   - Test 1: 「✅ Success: 60 records received」と表示されるか
   - Test 2: 「✅ Success: ¥4,022,640 sales」と表示されるか
   - Test 3: 4 つのエンドポイント全てが ✅ で表示されるか
   - Test 4: 「Dashboard Data Loaded」と表示されるか

## 期待される結果

すべてのテストが ✅ で表示された場合:
```
✅ Success: 60 records received
✅ Success: ¥4,022,640 sales
✅ Sales: 60 items
✅ Summary: data
✅ By Product: 8 items
✅ By Date: 30 items
Dashboard Data Loaded:
- Sales Records: 60
- Total Sales: ¥4,022,640
- Orders: 60
```

## 問題がある場合

### エラーが表示されている場合

#### A. 「❌ Error: Failed to fetch」
**原因**: ネットワークまたはサーバー接続エラー

**確認事項**:
```bash
# ターミナルで実行
curl http://localhost:8000/api/sales
```

**解決方法**:
1. バックエンドが起動しているか確認
   ```bash
   ps aux | grep "uvicorn main" | grep -v grep
   ```

2. バックエンドが起動していない場合:
   ```bash
   cd /workspaces/3414446/backend
   python -m uvicorn main:app --host 0.0.0.0 --port 8000
   ```

#### B. 「❌ HTTP Error: 5xx」
**原因**: サーバーエラー

**解決方法**:
1. バックエンドログを確認
   ```bash
   tail -50 /tmp/backend.log
   ```

2. バックエンドを再起動

#### C. 「❌ HTTP Error: 404」
**原因**: エンドポイントが見つからない

**確認事項**:
- API_BASE_URL が正しいか確認
- テストページで「System Information」セクションの「API Base URL」を確認

#### D. 「❌ Error: Failed to parse...」
**原因**: JSON パースエラー

**解決方法**:
1. API が正しい JSON を返しているか確認
   ```bash
   curl http://localhost:8000/api/sales | head -20
   ```

### ブラウザのコンソールにエラーが表示されている場合

1. F12 で DevTools を開く
2. **Console** タブを確認
3. エラーメッセージを全文コピー

### Network タブでリクエストが表示されていない場合

1. **Network** タブを開く
2. テストページをリロード（Ctrl+R）
3. テストボタンをクリック
4. `/api/` で始まるリクエストが表示されるか確認

## デバッグ情報の収集

問題を報告する場合、以下の情報を収集してください：

### 1. ブラウザ情報
- ブラウザタイプ: (Chrome, Firefox, Safari など)
- ブラウザバージョン
- アクセスしている URL: http://localhost:5173/test.html

### 2. テスト結果
テストページの全出力をコピーペースト

### 3. コンソールログ
DevTools → Console タブの全ログ

### 4. ターミナル出力
```bash
# 1. バックエンド確認
ps aux | grep "uvicorn main"

# 2. API テスト
curl -v http://localhost:8000/api/sales | head -30

# 3. CORS テスト
curl -i -H "Origin: http://localhost:5173" http://localhost:8000/api/sales | head -20
```

## トラブルシューティングチェックリスト

- [ ] ブラウザで http://localhost:5173/test.html にアクセスできる
- [ ] 「System Information」セクションに API URL が表示されている
- [ ] Test 1 で「✅ Success」が表示される
- [ ] Test 2 で「✅ Success」が表示される
- [ ] Test 3 で 4 つの ✅ が表示される
- [ ] Test 4 で「Dashboard Data Loaded」が表示される
- [ ] ブラウザのコンソールに赤いエラーが表示されていない
- [ ] ターミナルで `curl http://localhost:8000/api/sales` が成功する
- [ ] `ps aux | grep uvicorn` でバックエンドプロセスが表示される

## さらにサポートが必要な場合

以下を実行してシステム状態をエクスポート：

```bash
# システム診断スクリプト
cat > /tmp/system_diagnosis.sh << 'SCRIPT'
#!/bin/bash
echo "=== SYSTEM DIAGNOSIS ==="
echo ""
echo "1. Processes:"
ps aux | grep -E "uvicorn|vite" | grep -v grep
echo ""
echo "2. Ports:"
netstat -tlnp | grep -E "5173|8000"
echo ""
echo "3. API Test:"
curl -s http://localhost:8000/api/dashboard/summary | head -100
echo ""
echo "4. CORS Test:"
curl -s -i -H "Origin: http://localhost:5173" http://localhost:8000/api/sales | head -20
SCRIPT

chmod +x /tmp/system_diagnosis.sh
bash /tmp/system_diagnosis.sh
```

このスクリプトの出力をすべて報告してください。
