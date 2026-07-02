# 自殺しない宣言 — 署名・連鎖・検証可能な意思記録

「私は自ら命を絶たない」という宣言を、ブラウザ内で生成した ECDSA P-256 鍵で電子署名し、
再確認のたびに直前の記録のハッシュを含むハッシュチェーンとして記録するアプリ。
改ざん・削除・挿入は第三者が数学的に検出できます。

- **宣言**: 鍵ペア生成 → 宣言文に署名して第1記録を作成。以後ワンタップで署名付き再確認
- **公開・保全**: 公開鍵指紋と各記録ハッシュのSNS投稿文、全記録+公開鍵の検証バンドルを出力
- **検証**: 遺族・報道機関・第三者が検証バンドルを貼り付けて署名・ハッシュ・連鎖を完全検証
- **設計と限界**: 証明できること/できないこと、残存する脆弱性の開示

データはすべて端末内(localStorage)に保存され、サーバーには一切送信されません。

## ローカル開発

```bash
npm install
npm run dev
```

http://localhost:5173 でアクセス

※ 鍵生成・署名に Web Crypto (`crypto.subtle`) を使用するため、
localhost または HTTPS 環境でのみ動作します。

## 本番ビルド・配信

```bash
npm run build   # dist/ を生成
npm start       # Express で dist/ を静的配信
```

## Render デプロイ設定

| 項目 | 値 |
|------|-----|
| Environment | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `node server.js` |

環境変数は不要です。

## 技術構成

- **フロント**: React 18 + Vite
- **署名**: Web Crypto API (ECDSA P-256 / SHA-256)
- **配信**: Express (静的配信のみ)
- **デプロイ**: Render
