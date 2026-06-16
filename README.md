# 販売データ分析ダッシュボード

## プロジェクト概要

販売データの可視化ダッシュボードです。バックエンドは Python + FastAPI、フロントエンドは React + Vite で構成されています。基本的な売上集計、グラフ表示、フィルタ機能の実装例として利用できます。

## 目的

- 基本的な売上集計の実装例を確認する
- FastAPI と React + Vite の連携例を学ぶ
- グラフ表示とフィルタ機能の最小構成を試す

## 構成

```text
/
├── backend/
│   ├── main.py (FastAPI)
│   ├── models.py (Pydantic models)
│   ├── sample_data.json (サンプルデータ)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── lib/
│   │   └── ...
│   ├── package.json
│   └── ...
├── SPEC.md (仕様書)
└── README.md (本ファイル)
```

## 前提条件

- Python 3.8+
- Node.js 16+ / npm 7+
- ローカル開発環境

## バックエンドセットアップ

```bash
cd backend
pip install -r requirements.txt
```

## バックエンド起動

```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

- API: http://localhost:8000/api/sales
- CORS 対応済み

## フロントエンドセットアップ

```bash
cd frontend
npm install
```

## フロントエンド起動（開発モード）

```bash
cd frontend
npm run dev
```

- アプリ: http://localhost:5173

## フロントエンド本番ビルド

```bash
cd frontend
npm run build
npm run preview
```

## 機能

- 売上合計 / 注文件数の KPI 表示
- 商品別売上を棒グラフで表示
- 日別売上を折れ線グラフで表示
- 販売明細をテーブルで表示
- 日付範囲フィルタ
- 商品名フィルタ

## API エンドポイント

- `GET /api/sales`
- `GET /api/dashboard/summary`
- `GET /api/dashboard/by-product`
- `GET /api/dashboard/by-date`

## トラブルシューティング

- バックエンド接続エラー: バックエンドが `http://localhost:8000` で起動しているか確認してください
- CORS エラー: backend に CORS 設定済みです
- ポート競合: 起動コマンドのポート番号を変更してください

## ライセンス・著者

- License: MIT など任意のライセンスを設定してください
- Author: Project Maintainer
