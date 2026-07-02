import { useState, useEffect } from "react";

const INK = "#1B2333";
const PAPER = "#FAF8F3";
const SEAL = "#C73E3A";
const MIST = "#8A93A5";
const LINE = "#DDD6C8";
const OK = "#2E7D5B";

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif';

const DEFAULT_STATEMENT =
  "私はいかなる状況においても、自ら命を絶つことはありません。もし私の死が自殺と判断あるいは報道された場合、遺族および関係者は本記録を根拠として司法解剖を含む死因の徹底的な調査を要求してください。本宣言は私の明確な意思として、電子署名のうえ記録するものです。";

/* ---------- 暗号ユーティリティ ---------- */
const enc = new TextEncoder();

function buf2hex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function hex2buf(hex) {
  const a = new Uint8Array(hex.length / 2);
  for (let i = 0; i < a.length; i++) a[i] = parseInt(hex.substr(i * 2, 2), 16);
  return a.buffer;
}
async function sha256hex(str) {
  return buf2hex(await crypto.subtle.digest("SHA-256", enc.encode(str)));
}
// 記録の正規化文字列(署名・ハッシュ対象)
function canonical(r) {
  return JSON.stringify({
    seq: r.seq, type: r.type, name: r.name,
    statement: r.statement || "", timestamp: r.timestamp, prevHash: r.prevHash,
  });
}
async function genKeys() {
  const kp = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]
  );
  return {
    priv: await crypto.subtle.exportKey("jwk", kp.privateKey),
    pub: await crypto.subtle.exportKey("jwk", kp.publicKey),
  };
}
async function importPriv(jwk) {
  return crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
}
async function importPub(jwk) {
  return crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
}
async function signHex(privJwk, msg) {
  const key = await importPriv(privJwk);
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(msg));
  return buf2hex(sig);
}
async function verifySig(pubJwk, msg, sigHex) {
  try {
    const key = await importPub(pubJwk);
    return await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" }, key, hex2buf(sigHex), enc.encode(msg)
    );
  } catch { return false; }
}
async function pubFingerprint(pubJwk) {
  return (await sha256hex(JSON.stringify({ crv: pubJwk.crv, kty: pubJwk.kty, x: pubJwk.x, y: pubJwk.y }))).slice(0, 16);
}
function fmt(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function daysSince(iso) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}
function copyText(t) {
  const ta = document.createElement("textarea");
  ta.value = t; document.body.appendChild(ta); ta.select();
  document.execCommand("copy"); document.body.removeChild(ta);
}

/* ---------- 本体 ---------- */
export default function App() {
  const [tab, setTab] = useState("declare");
  const [store, setStore] = useState(null); // {keys:{priv,pub}, fp, records:[]}
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [statement, setStatement] = useState(DEFAULT_STATEMENT);
  const [copied, setCopied] = useState("");
  const [busy, setBusy] = useState(false);
  // 検証タブ
  const [bundleInput, setBundleInput] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);

  useEffect(() => {
    try {
      const r = localStorage.getItem("decl_v2");
      if (r) setStore(JSON.parse(r));
    } catch {}
    setLoading(false);
  }, []);

  const persist = async (s) => {
    try { localStorage.setItem("decl_v2", JSON.stringify(s)); } catch (e) { console.error(e); }
    setStore(s);
  };

  const flash = (k) => { setCopied(k); setTimeout(() => setCopied(""), 1600); };

  /* 記録の追加(宣言 or 再確認) */
  const addRecord = async (type, nm, stmt) => {
    setBusy(true);
    try {
      let s = store;
      if (!s) {
        const keys = await genKeys();
        s = { keys, fp: await pubFingerprint(keys.pub), records: [] };
      }
      const prev = s.records[s.records.length - 1];
      const rec = {
        seq: s.records.length + 1,
        type,
        name: nm,
        statement: type === "declaration" ? stmt : "",
        timestamp: new Date().toISOString(),
        prevHash: prev ? prev.hash : "GENESIS",
      };
      const c = canonical(rec);
      rec.hash = await sha256hex(c);
      rec.signature = await signHex(s.keys.priv, c);
      await persist({ ...s, records: [...s.records, rec] });
    } finally { setBusy(false); }
  };

  const createDeclaration = () => {
    if (!name.trim()) return;
    addRecord("declaration", name.trim(), statement.trim() || DEFAULT_STATEMENT);
  };

  const decl = store && store.records.find((r) => r.type === "declaration");
  const last = store && store.records[store.records.length - 1];
  const elapsed = last ? daysSince(last.timestamp) : 0;

  /* 各種公開テキスト */
  const keyAnnounceText = () =>
    `【本人性の紐付け】私の「自殺しない宣言」記録の検証用公開鍵指紋は ${store.fp} です。以後、この指紋に対応する鍵で署名された記録のみが私の宣言です。`;
  const hashPostText = () => {
    const r = last;
    return `【自殺しない宣言・第${r.seq}記録】${r.type === "declaration" ? "宣言を記録" : "宣言を再確認"}しました(${fmt(r.timestamp)})。記録ハッシュ: ${r.hash} / 鍵指紋: ${store.fp}`;
  };
  const bundleText = () =>
    JSON.stringify({ publicKey: store.keys.pub, fingerprint: store.fp, records: store.records }, null, 2);

  /* 検証 */
  const runVerify = async () => {
    setVerifyResult(null);
    let b;
    try { b = JSON.parse(bundleInput); } catch {
      setVerifyResult({ ok: false, lines: ["JSONとして読み取れません。バンドル全体を貼り付けてください。"] });
      return;
    }
    const lines = [];
    let ok = true;
    if (!b.publicKey || !Array.isArray(b.records) || b.records.length === 0) {
      setVerifyResult({ ok: false, lines: ["公開鍵または記録が含まれていません。"] });
      return;
    }
    const fp = await pubFingerprint(b.publicKey);
    lines.push(`公開鍵指紋: ${fp}${b.fingerprint === fp ? "(バンドル記載と一致)" : "(⚠ バンドル記載と不一致)"}`);
    lines.push("→ この指紋が本人のSNS投稿の指紋と一致するか照合してください。");
    let prevHash = "GENESIS";
    for (const r of b.records) {
      const c = canonical(r);
      const h = await sha256hex(c);
      const chainOk = r.prevHash === prevHash;
      const hashOk = h === r.hash;
      const sigOk = await verifySig(b.publicKey, c, r.signature);
      const pass = chainOk && hashOk && sigOk;
      if (!pass) ok = false;
      lines.push(
        `第${r.seq}記録(${r.type === "declaration" ? "宣言" : "再確認"} / ${fmt(r.timestamp)}): ` +
        (pass ? "✓ 署名・ハッシュ・連鎖すべて有効" :
          `✗ ${!sigOk ? "署名無効 " : ""}${!hashOk ? "内容改ざんの疑い " : ""}${!chainOk ? "連鎖の断絶(記録の削除・挿入の疑い)" : ""}`)
      );
      prevHash = r.hash;
    }
    lines.push(ok
      ? "総合判定: ✓ 全記録が同一の鍵で署名され、改ざん・削除・挿入の痕跡はありません。各記録ハッシュがSNS投稿のハッシュと一致すれば、投稿時刻がその記録の存在時刻の独立した証明になります。"
      : "総合判定: ✗ このバンドルは改ざんされているか、破損しています。");
    setVerifyResult({ ok, lines });
  };

  /* ---------- スタイル ---------- */
  const btn = (bg, fg, border) => ({
    width: "100%", padding: "14px", fontSize: 14, fontFamily: sans,
    letterSpacing: "0.12em", background: bg, color: fg,
    border: border || "none", borderRadius: 2, cursor: "pointer", marginTop: 10,
  });
  const mono = { fontFamily: "monospace", fontSize: 11, wordBreak: "break-all", background: "#F1EDE3", padding: "8px 10px", borderRadius: 2 };

  if (loading)
    return <div style={{ minHeight: "100vh", background: PAPER, display: "flex", alignItems: "center", justifyContent: "center", color: MIST, fontFamily: sans }}>読み込み中…</div>;

  return (
    <div style={{ minHeight: "100vh", background: PAPER, color: INK, fontFamily: sans, paddingBottom: 48 }}>
      <header style={{ padding: "24px 20px 0", borderBottom: `1px solid ${LINE}` }}>
        <div style={{ fontSize: 10, letterSpacing: "0.3em", color: MIST }}>SIGNED · CHAINED · VERIFIABLE</div>
        <h1 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, margin: "6px 0 14px", letterSpacing: "0.08em" }}>自殺しない宣言</h1>
        <nav style={{ display: "flex", gap: 4 }}>
          {[["declare", "宣言"], ["publish", "公開・保全"], ["verify", "検証"], ["design", "設計と限界"]].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{
                flex: 1, padding: "10px 4px", fontSize: 12, letterSpacing: "0.08em",
                background: "none", border: "none", cursor: "pointer",
                color: tab === k ? INK : MIST,
                borderBottom: tab === k ? `2px solid ${SEAL}` : "2px solid transparent",
              }}>{label}</button>
          ))}
        </nav>
      </header>

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "22px 20px" }}>

        {/* ========== 宣言タブ ========== */}
        {tab === "declare" && (!store ? (
          <section>
            <p style={{ fontSize: 13, lineHeight: 1.9, color: "#3A4254" }}>
              宣言を作成すると、この端末内で暗号鍵ペア(ECDSA P-256)を生成し、宣言に電子署名します。以後のすべての再確認は直前の記録のハッシュを含む連鎖構造で記録され、一件でも改ざん・削除・挿入すれば検証で検出されます。
            </p>
            <label style={{ display: "block", fontSize: 12, letterSpacing: "0.15em", color: MIST, margin: "20px 0 6px" }}>宣言者の氏名</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="氏名を入力"
              style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", fontSize: 16, fontFamily: serif, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 2, outline: "none", color: INK }} />
            <label style={{ display: "block", fontSize: 12, letterSpacing: "0.15em", color: MIST, margin: "18px 0 6px" }}>宣言文</label>
            <textarea value={statement} onChange={(e) => setStatement(e.target.value)} rows={8}
              style={{ width: "100%", boxSizing: "border-box", padding: 14, fontSize: 14, lineHeight: 2, fontFamily: serif, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 2, outline: "none", color: INK, resize: "vertical" }} />
            <button onClick={createDeclaration} disabled={!name.trim() || busy}
              style={btn(name.trim() ? INK : "#C9CDD6", PAPER)}>
              {busy ? "署名中…" : "鍵を生成し、署名して宣言を記録する"}
            </button>
          </section>
        ) : (
          <section>
            <div style={{ position: "relative", background: "#fff", border: `1px solid ${LINE}`, borderTop: `3px solid ${INK}`, padding: "28px 22px 24px", boxShadow: "0 1px 4px rgba(27,35,51,0.06)" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.3em", color: MIST, textAlign: "center", marginBottom: 16 }}>宣　言　書</div>
              <p style={{ fontFamily: serif, fontSize: 14, lineHeight: 2.2, margin: 0, textAlign: "justify" }}>{decl.statement}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 24 }}>
                <div style={{ fontSize: 12, color: "#3A4254", lineHeight: 1.9 }}>
                  <div>宣言日　{fmt(decl.timestamp)}</div>
                  <div>最終確認　{fmt(last.timestamp)}</div>
                  <div style={{ color: MIST }}>記録数　{store.records.length} 件(連鎖済)</div>
                  <div style={{ color: MIST, fontFamily: "monospace", fontSize: 10 }}>鍵指紋 {store.fp}</div>
                </div>
                <div style={{
                  width: 68, height: 68, borderRadius: "50%", border: `3px solid ${SEAL}`, color: SEAL,
                  display: "flex", alignItems: "center", justifyContent: "center", fontFamily: serif, fontWeight: 600,
                  fontSize: decl.name.length > 4 ? 12 : 16, writingMode: "vertical-rl", letterSpacing: "0.1em",
                  transform: "rotate(-6deg)", opacity: 0.92, padding: 4, boxSizing: "border-box",
                }}>{decl.name.slice(0, 6)}</div>
              </div>
            </div>

            <div style={{ marginTop: 16, fontSize: 13, textAlign: "center", color: elapsed >= 30 ? SEAL : MIST }}>
              {elapsed === 0 ? "本日、署名済みの確認記録があります" : `最終確認から ${elapsed} 日${elapsed >= 30 ? "。連鎖が途切れる前に再確認してください" : ""}`}
            </div>

            <button onClick={() => addRecord("confirmation", decl.name)} disabled={busy} style={btn(SEAL, "#fff")}>
              {busy ? "署名中…" : "いま、署名付きで再確認する"}
            </button>

            <div style={{ marginTop: 26 }}>
              <div style={{ fontSize: 12, letterSpacing: "0.15em", color: MIST, borderBottom: `1px solid ${LINE}`, paddingBottom: 8 }}>記録の連鎖(新しい順)</div>
              {[...store.records].reverse().slice(0, 8).map((r) => (
                <div key={r.seq} style={{ padding: "10px 2px", borderBottom: `1px solid ${LINE}` }}>
                  <div style={{ fontSize: 13, fontFamily: serif }}>第{r.seq}記録　{r.type === "declaration" ? "宣言" : "再確認"}　{fmt(r.timestamp)}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 10, color: MIST, wordBreak: "break-all" }}>hash {r.hash.slice(0, 32)}… ← prev {r.prevHash === "GENESIS" ? "GENESIS" : r.prevHash.slice(0, 12) + "…"}</div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* ========== 公開・保全タブ ========== */}
        {tab === "publish" && (
          <section>
            {!store ? <p style={{ fontSize: 13, color: MIST }}>まず「宣言」タブで宣言を作成してください。</p> : (
              <>
                <p style={{ fontSize: 13, lineHeight: 1.9, color: "#3A4254" }}>
                  記録は端末内にあるだけでは隠滅・改ざんの疑いに耐えられません。以下の3手順で、記録を「誰にも書き換えられない事実」に変えます。
                </p>

                <h3 style={{ fontFamily: serif, fontSize: 15, margin: "22px 0 6px" }}>① 本人性の紐付け(初回のみ)</h3>
                <p style={{ fontSize: 12, lineHeight: 1.8, color: "#3A4254", margin: "0 0 8px" }}>
                  あなた本人のSNSアカウントから公開鍵指紋を投稿します。以後、この指紋の鍵による署名だけが「あなたの宣言」であることが公に固定されます。
                </p>
                <div style={mono}>{keyAnnounceText()}</div>
                <button onClick={() => { copyText(keyAnnounceText()); flash("key"); }} style={btn("transparent", INK, `1px solid ${INK}`)}>
                  {copied === "key" ? "コピーしました" : "紐付け投稿文をコピー"}
                </button>

                <h3 style={{ fontFamily: serif, fontSize: 15, margin: "26px 0 6px" }}>② 記録ハッシュの公開(毎回)</h3>
                <p style={{ fontSize: 12, lineHeight: 1.8, color: "#3A4254", margin: "0 0 8px" }}>
                  宣言・再確認のたびにハッシュを投稿します。SNS側の投稿時刻が独立したタイムスタンプとなり、後からの記録の捏造・書き換え・遡及作成が不可能になります。
                </p>
                <div style={mono}>{hashPostText()}</div>
                <button onClick={() => { copyText(hashPostText()); flash("hash"); }} style={btn("transparent", INK, `1px solid ${INK}`)}>
                  {copied === "hash" ? "コピーしました" : "最新記録の公開文をコピー"}
                </button>

                <h3 style={{ fontFamily: serif, fontSize: 15, margin: "26px 0 6px" }}>③ 検証バンドルの第三者保全(定期)</h3>
                <p style={{ fontSize: 12, lineHeight: 1.8, color: "#3A4254", margin: "0 0 8px" }}>
                  全記録+公開鍵の検証バンドルをコピーし、家族・弁護士など複数の信頼できる相手にメール等で送付してください。端末が失われても、バンドルと公開投稿の照合だけで第三者が完全検証できます。基礎となる宣言自体は公正証書化することを強く推奨します(アプリは法的効力を付与できません。証拠力の核は公正証書、継続性の証明が本アプリの役割です)。
                </p>
                <button onClick={() => { copyText(bundleText()); flash("bundle"); }} style={btn(INK, PAPER)}>
                  {copied === "bundle" ? "コピーしました" : "検証バンドル(全記録+公開鍵)をコピー"}
                </button>
              </>
            )}
          </section>
        )}

        {/* ========== 検証タブ ========== */}
        {tab === "verify" && (
          <section>
            <p style={{ fontSize: 13, lineHeight: 1.9, color: "#3A4254" }}>
              遺族・報道機関・第三者用。受け取った検証バンドルを貼り付けると、全記録の署名・改ざん・連鎖の完全性を数学的に検証します。本人のSNS投稿(鍵指紋・記録ハッシュ)との照合で、時刻と本人性が確定します。
            </p>
            <textarea value={bundleInput} onChange={(e) => setBundleInput(e.target.value)} rows={8}
              placeholder='{"publicKey": …, "records": […]} を貼り付け'
              style={{ width: "100%", boxSizing: "border-box", padding: 12, fontFamily: "monospace", fontSize: 11, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 2, outline: "none", color: INK, resize: "vertical", marginTop: 12 }} />
            <button onClick={runVerify} style={btn(INK, PAPER)}>検証を実行</button>
            {verifyResult && (
              <div style={{ marginTop: 16, background: "#fff", border: `1px solid ${verifyResult.ok ? OK : SEAL}`, borderRadius: 2, padding: "14px 16px" }}>
                {verifyResult.lines.map((l, i) => (
                  <div key={i} style={{ fontSize: 12, lineHeight: 1.8, color: l.startsWith("✗") || l.includes("✗") ? SEAL : "#3A4254", marginBottom: 4 }}>{l}</div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ========== 設計と限界タブ ========== */}
        {tab === "design" && (
          <section style={{ fontSize: 13, lineHeight: 2, color: "#3A4254" }}>
            <h3 style={{ fontFamily: serif, fontSize: 15, color: INK, margin: "4px 0 6px" }}>このアプリが証明できること</h3>
            <p style={{ margin: 0 }}>
              「本人が、特定の時点から死の直前まで、一貫して宣言を維持していた」という事実。電子署名(本人性)、ハッシュチェーン(改ざん・削除の検出)、SNS投稿(独立した時刻証明と隠滅への耐性)の三層で、この事実は本人以外の誰にも捏造・消去できません。
            </p>
            <h3 style={{ fontFamily: serif, fontSize: 15, color: INK, margin: "20px 0 6px" }}>証明できないこと</h3>
            <p style={{ margin: 0 }}>
              死因そのものです。死因の確定は検視・司法解剖の領域であり、生前の意思表示は死因の直接証拠にはなりません。したがって本記録の実務上の効力は、①遺族が司法解剖・再調査を要求する根拠、②「自殺」との報道・発表への公的な反証材料、③偽装を検討する者への抑止、の三点に集約されます。この限界を偽らないことが、記録の信頼性の前提です。
            </p>
            <h3 style={{ fontFamily: serif, fontSize: 15, color: INK, margin: "20px 0 6px" }}>残存する脆弱性</h3>
            <p style={{ margin: 0 }}>
              秘密鍵は端末内保存のため、端末の完全な掌握者は偽の「再確認」を追加できます(ただし過去の改ざんは不可能)。また鍵とSNSアカウントの両方を奪取された場合は本人性が崩れます。運用上は、再確認の頻度を一定に保つこと(パターンの断絶自体が異常のシグナルになります)と、バンドルの複数箇所保全で緩和してください。
            </p>
            <p style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${LINE}`, fontSize: 12, color: MIST }}>
              人の気持ちは変化するものです。もし将来つらさを感じることがあれば、この宣言はあなたを縛るものではありません。いのちの電話などの相談窓口や信頼できる人を頼ることを、記録より優先してください。
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
