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

## iOSアプリ (App Store公開)

Capacitor で iOS アプリ化済み(`ios/` ディレクトリ)。記録は iOS では
UserDefaults(Capacitor Preferences)に保存され、WebViewストレージのOSによる
自動削除の影響を受けません。

### 必要なもの

- Mac + Xcode 15以降
- Apple Developer Program 登録(年間 $99 / 約15,000円)

### ビルド・提出手順(Mac上で)

```bash
npm install
npm run build
npx cap sync ios
npx cap open ios   # Xcodeが開く
```

Xcode で:

1. **Signing & Capabilities** で自分の Team を選択
2. Bundle Identifier を自分のものに変更(現在は `com.shinjuwan.declaration`。
   変更する場合は `capacitor.config.json` の `appId` も合わせる)
3. `App/Assets.xcassets/AppIcon` に 1024×1024 のアプリアイコンを設定
4. 実機またはシミュレータで動作確認
5. **Product → Archive → Distribute App** で App Store Connect にアップロード

App Store Connect で:

- アプリ情報・スクリーンショット・説明文を登録
- **プライバシー**: データ収集なし(全データ端末内保存・サーバー送信なし)と申告
- 審査に提出

### 審査に関する注意

- アプリ名・内容が自殺に関連するため、審査で追加確認が入る可能性があります。
  審査メモ(App Review Information)に「本アプリは自殺予防・意思記録のための
  ツールであり、自傷を促す内容は一切含まない。相談窓口への案内を含む」旨を
  明記することを推奨します。
- 単純なWebサイトのラッパーはガイドライン4.2(最小限の機能)で却下されること
  がありますが、本アプリは端末内での鍵生成・署名・ネイティブ保存を行うため
  スタンドアロンのツールとして説明できます。

## 技術構成

- **フロント**: React 18 + Vite
- **署名**: Web Crypto API (ECDSA P-256 / SHA-256)
- **iOS**: Capacitor 8 (Preferences / Clipboard プラグイン)
- **配信(Web版)**: Express (静的配信のみ) / Render
