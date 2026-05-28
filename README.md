# TUNEUP — 就活チューニングアプリ

ターゲット企業への照準を合わせる就活支援アプリ。

## ローカル開発

```bash
# 依存インストール
npm install

# ターミナル1: サーバー起動
ANTHROPIC_API_KEY=sk-ant-xxxx node server.js

# ターミナル2: Vite開発サーバー起動
npm run dev:client
```

http://localhost:5173 でアクセス

## Render デプロイ設定

| 項目 | 値 |
|------|-----|
| Environment | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `node server.js` |
| Environment Variable | `ANTHROPIC_API_KEY` = `sk-ant-...` |

## 技術構成

- **フロント**: React 18 + Vite
- **バックエンド**: Express (APIプロキシ)
- **AI**: Claude API (claude-sonnet-4)
- **デプロイ**: Render
