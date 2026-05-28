import { useState } from "react";

const PARTS = [
  { id: "engine", ja: "エンジン", en: "ENGINE", meaning: "原動力・志望理由", color: "#f59e0b" },
  { id: "navi",   ja: "ナビ",     en: "NAVI",   meaning: "将来像・就活軸",  color: "#0891b2" },
  { id: "tire",   ja: "タイヤ",   en: "TIRES",  meaning: "行動経験",        color: "#4b5563" },
  { id: "handle", ja: "ハンドル", en: "HANDLE", meaning: "判断軸",          color: "#7c3aed" },
  { id: "light",  ja: "ライト",   en: "LIGHTS", meaning: "伝達力",          color: "#f97316" },
  { id: "gas",    ja: "ガソリン", en: "FUEL",   meaning: "モチベーション",  color: "#16a34a" },
  { id: "body",   ja: "ボディ",   en: "BODY",   meaning: "一貫性",          color: "#2563eb" },
  { id: "brake",  ja: "ブレーキ", en: "BRAKE",  meaning: "リスク感覚",      color: "#dc2626" },
];

async function callClaude(messages, system) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, system, messages }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  if (!data.content?.[0]) throw new Error("Empty response");
  return data.content[0].text;
}

function parseJSON(text) {
  for (const fn of [
    () => { const c = text.replace(/```json\n?|```\n?/g,"").trim(); const s=c.indexOf("{"),e=c.lastIndexOf("}"); if(s>=0) return JSON.parse(c.slice(s,e+1)); throw 0; },
    () => { const m=text.match(/\{[\s\S]*\}/); if(m) return JSON.parse(m[0]); throw 0; },
    () => JSON.parse(text),
  ]) { try { return fn(); } catch {} }
  throw new Error("No JSON found: " + text.slice(0, 120));
}

// ─── CAR SVG ────────────────────────────────────────────────────────────────
function CarSVG({ completedParts = [] }) {
  const has = id => completedParts.includes(id);
  const gc  = (id, on, off="#d1d5db") => has(id) ? on : off;
  const go  = id => ({ opacity: has(id) ? 1 : 0.22, transition: "opacity 0.55s, fill 0.55s, stroke 0.55s" });
  const allDone = PARTS.every(p => has(p.id));

  return (
    <svg viewBox="0 0 520 215" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%" }}>
      {/* Ground */}
      <ellipse cx="258" cy="206" rx="228" ry="8" fill="#e2e8f0" />

      {/* ── BODY ─────────────────────────────────────────── */}
      <g style={go('body')}>
        {/* Main side profile */}
        <path d="M 78,163 L 62,148 L 60,126 C 62,100 80,83 102,73 L 178,54 L 193,41 L 320,39 L 368,41
                 C 400,59 428,97 440,134 L 447,153 L 451,163 Z"
          fill={gc('body','#1d4ed8')} />
        {/* Roof top-face (3-D depth) */}
        <path d="M 193,41 L 320,39 L 311,26 L 202,28 Z" fill={gc('body','#1e3a8a')} />
        {/* Hood top-face (3-D depth) */}
        <path d="M 368,41 C 400,59 428,97 440,134 L 452,124 C 440,86 412,49 378,31 Z"
          fill={gc('body','#1e3a8a')} />
        {/* Door divider */}
        {has('body') && <line x1="248" y1="56" x2="244" y2="155" stroke="#1e3a8a" strokeWidth="2.5"/>}
      </g>

      {/* ── WINDOWS ──────────────────────────────────────── */}
      {[
        { d:"M 193,41 L 230,39 L 228,61 L 189,62 Z" },
        { d:"M 230,39 L 300,39 L 298,61 L 228,61 Z" },
        { d:"M 300,39 L 362,41 L 358,63 L 298,61 Z" },
      ].map((w,i) => (
        <path key={i} d={w.d} fill={has('body') ? "#93c5fd" : "#e8eef8"}
          opacity={has('body') ? 0.92 : 0.45} style={{ transition:"fill 0.5s" }} />
      ))}
      {/* Windshield */}
      <path d="M 362,41 C 396,59 424,96 436,131 L 421,129 C 410,96 385,61 367,49 Z"
        fill={has('navi') ? "#bfdbfe" : "#e2e8f0"} opacity={0.88}
        style={{ transition:"fill 0.5s" }} />

      {/* ── NAVI (dashboard screen) ───────────────────────── */}
      <g style={go('navi')}>
        <rect x="316" y="84" width="64" height="40" rx="4" fill={gc('navi','#0e7490')} />
        <rect x="319" y="87" width="58" height="30" rx="3" fill={gc('navi','#22d3ee')} />
        {has('navi') && [95,101,107].map(y =>
          <line key={y} x1="323" y1={y} x2="372" y2={y} stroke="#075985" strokeWidth="1.5"/>
        )}
      </g>

      {/* ── HANDLE (steering wheel) ───────────────────────── */}
      <g style={go('handle')}>
        <circle cx="294" cy="100" r="18" fill="none" stroke={gc('handle','#7c3aed')} strokeWidth="5" />
        <line x1="294" y1="82"  x2="294" y2="118" stroke={gc('handle','#7c3aed')} strokeWidth="3"/>
        <line x1="276" y1="100" x2="312" y2="100" stroke={gc('handle','#7c3aed')} strokeWidth="3"/>
        <circle cx="294" cy="100" r="5" fill={gc('handle','#7c3aed')} />
      </g>

      {/* ── ENGINE ───────────────────────────────────────── */}
      <g style={go('engine')}>
        <rect x="400" y="92" width="32" height="22" rx="3" fill={gc('engine','#d97706')} />
        {[405,413,421].map(x => <rect key={x} x={x} y="87" width="5" height="7" rx="1" fill={gc('engine','#92400e')}/>)}
        <rect x="400" y="117" width="32" height="4" rx="1" fill={gc('engine','#b45309')} />
      </g>

      {/* ── LIGHTS ───────────────────────────────────────── */}
      <g style={go('light')}>
        <ellipse cx="449" cy="136" rx="6"  ry="17" fill={gc('light','#fde047')} />
        <ellipse cx="447" cy="136" rx="4"  ry="13" fill={gc('light','#fef9c3')} />
        <ellipse cx="63"  cy="137" rx="5"  ry="19" fill={gc('light','#f87171')} />
        <ellipse cx="65"  cy="137" rx="3.5" ry="15" fill={gc('light','#fecaca')} />
      </g>

      {/* ── GAS CAP ──────────────────────────────────────── */}
      <g style={go('gas')}>
        <circle cx="84" cy="108" r="12" fill={gc('gas','#15803d')} />
        <circle cx="84" cy="108" r="8"  fill={gc('gas','#22c55e')} />
        <circle cx="84" cy="108" r="3"  fill={gc('gas','#15803d')} />
      </g>

      {/* ── TIRES ─────────────────────────────────────────── */}
      <g style={go('tire')}>
        {[118, 392].map(cx => (
          <g key={cx}>
            <circle cx={cx} cy={166} r={39} fill={gc('tire','#111827')} />
            <circle cx={cx} cy={166} r={30} fill={gc('tire','#1f2937')} />
            <circle cx={cx} cy={166} r={13} fill={gc('tire','#4b5563')} />
            <circle cx={cx} cy={166} r={6}  fill={gc('tire','#9ca3af')} />
            {has('tire') && [0,60,120,180,240,300].map(a => {
              const r = a*Math.PI/180;
              return <line key={a}
                x1={cx+15*Math.cos(r)} y1={166+15*Math.sin(r)}
                x2={cx+28*Math.cos(r)} y2={166+28*Math.sin(r)}
                stroke="#6b7280" strokeWidth="3" strokeLinecap="round"/>;
            })}
          </g>
        ))}
      </g>

      {/* ── BRAKE ─────────────────────────────────────────── */}
      <g style={go('brake')}>
        {[118, 392].map(cx => (
          <circle key={cx} cx={cx} cy={166} r={21}
            fill="none" stroke={gc('brake','#dc2626')} strokeWidth="4.5" />
        ))}
      </g>

      {/* Complete badge */}
      {allDone && (
        <g>
          <rect x="172" y="7" width="176" height="22" rx="11" fill="#15803d" />
          <text x="260" y="22" textAnchor="middle" fill="white"
            style={{ fontSize:"11px", fontWeight:700, letterSpacing:"1.5px", fontFamily:"sans-serif" }}>
            TUNE COMPLETE ✓
          </text>
        </g>
      )}
    </svg>
  );
}

// ─── GAUGE ──────────────────────────────────────────────────────────────────
function Gauge({ value=0, max=5, color="#2563eb", label, sublabel }) {
  const pct = Math.min(Math.max(value/max,0),1);
  const r=25, cx=32, cy=33;
  const rad = (-180 + pct*180)*Math.PI/180;
  const vx=cx+r*Math.cos(rad), vy=cy+r*Math.sin(rad);
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
      <svg width="64" height="46" viewBox="0 0 64 46">
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 0 ${cx+r} ${cy}`}
          fill="none" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round"/>
        {pct>0.01 && <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 0 ${vx} ${vy}`}
          fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"/>}
        <text x={cx} y={cy+8} textAnchor="middle"
          style={{ fill: pct>0?"#0f172a":"#94a3b8", fontSize:"13px", fontWeight:700, fontFamily:"monospace" }}>
          {value}
        </text>
      </svg>
      <div style={{ textAlign:"center" }}>
        <div style={{ color: pct>0?color:"#94a3b8", fontSize:"8px", fontWeight:700, letterSpacing:"1px" }}>{label}</div>
        <div style={{ color:"#94a3b8", fontSize:"8px" }}>{sublabel}</div>
      </div>
    </div>
  );
}

// ─── CSS ────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#f0f6ff;}
input::placeholder,textarea::placeholder{color:#94a3b8;}
input:focus,textarea:focus{border-color:#2563eb!important;box-shadow:0 0 0 3px #dbeafe!important;outline:none;}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.35;}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
.fade{animation:fadeUp 0.3s ease;}
.app{background:#f0f6ff;min-height:100vh;color:#0f172a;
  font-family:'Noto Sans JP','Helvetica Neue',sans-serif;padding:20px;}
.wrap{max-width:540px;margin:0 auto;}
.card{background:white;border:1.5px solid #e8edf8;border-radius:14px;padding:18px;
  box-shadow:0 1px 4px rgba(37,99,235,0.06);}
.label{font-size:10px;color:#64748b;letter-spacing:2px;font-weight:600;margin-bottom:6px;}
.btn-p{background:#2563eb;border:none;border-radius:10px;color:white;
  padding:14px 24px;font-size:15px;font-weight:700;cursor:pointer;width:100%;
  font-family:inherit;transition:background 0.15s,opacity 0.15s;}
.btn-p:hover:not(:disabled){background:#1d4ed8;}
.btn-p:disabled{opacity:0.38;cursor:not-allowed;}
.btn-s{background:white;border:1.5px solid #e2e8f0;border-radius:10px;color:#374151;
  padding:12px 24px;font-size:14px;font-weight:500;cursor:pointer;width:100%;
  font-family:inherit;transition:all 0.15s;}
.btn-s:hover{border-color:#2563eb;color:#2563eb;}
input,textarea{background:white;border:1.5px solid #e2e8f0;border-radius:10px;
  color:#0f172a;padding:12px 16px;width:100%;font-size:15px;
  font-family:inherit;display:block;transition:all 0.15s;}
textarea{resize:vertical;line-height:1.75;}
.chip{background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:8px;
  padding:6px 14px;font-size:13px;color:#1d4ed8;cursor:pointer;
  font-weight:500;transition:all 0.15s;white-space:nowrap;font-family:inherit;}
.chip:hover{background:#dbeafe;}
.err{background:#fef2f2;border:1.5px solid #fecaca;border-radius:10px;
  padding:12px 16px;color:#dc2626;font-size:13px;line-height:1.7;}
`;

// ─── APP ────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,    setScreen]    = useState("company");
  const [company,   setCompany]   = useState("");
  const [companyData, setCD]      = useState(null);
  const [qList,     setQList]     = useState([]);   // [{id, question}]
  const [idx,       setIdx]       = useState(0);
  const [answers,   setAnswers]   = useState({});
  const [curAns,    setCurAns]    = useState("");
  const [validating,setValidating]= useState(false);
  const [valErr,    setValErr]    = useState("");
  const [results,   setResults]   = useState(null);
  const [loadMsg,   setLoadMsg]   = useState("");
  const [error,     setError]     = useState("");
  const [dbg,       setDbg]       = useState("");
  const [tab,       setTab]       = useState(0);

  const done = Object.keys(answers);

  // ── 企業分析 ──────────────────────────────────────────────────────
  const analyzeCompany = async () => {
    if (!company.trim()) return;
    setError(""); setDbg(""); setScreen("loading"); setLoadMsg("企業を分析中...");
    try {
      const text = await callClaude([{ role:"user", content:
`企業名: ${company}

就活支援アプリ用に、「${company}」向けのチューニング質問を8つ作成してください。
各パーツについて、${company}の特徴・文化・求める人材像を踏まえた具体的な質問にしてください。

パーツ一覧:
- engine: 原動力・志望理由
- navi: 将来像・就活軸
- tire: 行動経験
- handle: 判断軸・意思決定
- light: 伝達力・コミュニケーション
- gas: モチベーション
- body: 一貫性
- brake: リスク感覚

JSONのみで返してください:
{
  "companyDescription": "${company}が求める人材像（2文以内）",
  "companyKeywords": ["キーワード1","キーワード2","キーワード3"],
  "questions": {
    "engine": "質問文",
    "navi":   "質問文",
    "tire":   "質問文",
    "handle": "質問文",
    "light":  "質問文",
    "gas":    "質問文",
    "body":   "質問文",
    "brake":  "質問文"
  }
}` }],
        "JSONのみ返す就活支援AI。前置き不要。"
      );
      const data = parseJSON(text);
      if (!data.questions) throw new Error("questionsがありません");
      const list = PARTS.map(p => ({
        id: p.id,
        question: data.questions[p.id] || `${p.ja}について具体的に教えてください。`
      }));
      setCD(data); setQList(list);
      setIdx(0); setAnswers({}); setCurAns(""); setValErr("");
      setScreen("preview");
    } catch(e) {
      console.error(e);
      setDbg(e.message);
      setError("企業の分析に失敗しました。企業名を確認してもう一度お試しください。");
      setScreen("company");
    }
  };

  // ── 回答バリデーション → 次へ ─────────────────────────────────────
  const validateAndNext = async () => {
    if (!curAns.trim() || validating) return;
    const part = PARTS[idx];
    const question = qList[idx]?.question;
    setValidating(true); setValErr("");
    try {
      const text = await callClaude([{ role:"user", content:
`質問: ${question}
回答: ${curAns}

回答が質問に具体的に答えているか判定してください。
・「頑張りたい」「成長したい」など抽象的すぎる → invalid
・50文字未満で中身が薄い → invalid
・具体的な経験・数字・考えが含まれる → valid

JSONのみ: {"valid":true,"feedback":"差し戻し理由（invalidの場合のみ）"}` }],
        "JSONのみ返す回答判定AI。"
      );
      const r = parseJSON(text);
      if (!r.valid) {
        setValErr(r.feedback || "もう少し具体的に記入してください。");
        setValidating(false);
        return;
      }
    } catch { /* validation error → proceed */ }

    const newAns = { ...answers, [part.id]: curAns };
    setAnswers(newAns); setCurAns(""); setValErr(""); setValidating(false);
    if (idx < PARTS.length - 1) { setIdx(i => i+1); }
    else { analyzeAnswers(newAns); }
  };

  // ── 回答分析 ──────────────────────────────────────────────────────
  const analyzeAnswers = async (allAns) => {
    setScreen("loading"); setLoadMsg("回答を総合分析中...");
    try {
      const aText = PARTS.map(p => `【${p.ja}】\n${allAns[p.id]||"（未回答）"}`).join("\n\n");
      const text = await callClaude([{ role:"user", content:
`企業: ${company}
企業特徴: ${companyData?.companyDescription||""}

8パーツの回答:
${aText}

JSONのみで返してください:
{
  "scores":{"engine":0,"navi":0,"tire":0,"handle":0,"light":0,"gas":0,"body":0,"brake":0},
  "overallScore": 3,
  "specificity": "具体性の評価（2〜3文）",
  "consistency": "一貫性の評価（2〜3文）",
  "companyFit": "${company}との適合性評価（2〜3文）",
  "strongPoints": ["強み1","強み2"],
  "improvements": [
    {"partId":"engine","issue":"問題点（短く）","suggestion":"改善例文（40文字以内）"}
  ]
}
スコア・overallScoreは1〜5の整数。` }],
        "JSONのみ返す就活分析AI。"
      );
      const data = parseJSON(text);
      const scores = {};
      PARTS.forEach(p => { scores[p.id] = Math.min(5, Math.max(1, Number(data.scores?.[p.id])||1)); });
      data.scores = scores;
      data.overallScore = Math.min(5, Math.max(1, Number(data.overallScore)||3));
      setResults({ ...data, answers: allAns });
      setScreen("results");
    } catch(e) {
      console.error(e); setDbg(e.message);
      setError("分析に失敗しました。もう一度お試しください。");
      setScreen("company");
    }
  };

  const reset = () => {
    setScreen("company"); setCompany(""); setResults(null);
    setError(""); setDbg(""); setAnswers({}); setIdx(0);
    setCD(null); setQList([]);
  };

  // ═════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════

  if (screen === "loading") return (
    <div className="app" style={{ display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16 }}>
      <style>{css}</style>
      <div style={{ width:36,height:36,border:"3px solid #dbeafe",borderTopColor:"#2563eb",borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
      <div style={{ color:"#2563eb",fontSize:13,fontWeight:600,letterSpacing:1,animation:"pulse 1.5s ease-in-out infinite" }}>{loadMsg}</div>
    </div>
  );

  // ── COMPANY INPUT ─────────────────────────────────────────────────
  if (screen === "company") return (
    <div className="app" style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh" }}>
      <style>{css}</style>
      <div className="wrap fade" style={{ width:"100%" }}>
        <div style={{ textAlign:"center",marginBottom:32 }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"#eff6ff",border:"1.5px solid #bfdbfe",borderRadius:100,padding:"5px 16px",marginBottom:14 }}>
            <span style={{ fontSize:12,color:"#1d4ed8",fontWeight:600 }}>⚙ JOB TUNING SYSTEM</span>
          </div>
          <div style={{ fontSize:46,fontWeight:900,color:"#0f172a",letterSpacing:"-2px",lineHeight:1.1 }}>
            TUNE<span style={{ color:"#2563eb" }}>UP</span>
          </div>
          <div style={{ color:"#64748b",fontSize:14,marginTop:10 }}>ターゲット企業への照準を合わせる就活</div>
        </div>

        <div className="card" style={{ marginBottom:14 }}>
          <div className="label">志望企業を入力</div>
          <input placeholder="企業名を入力..." value={company}
            onChange={e=>setCompany(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&analyzeCompany()}
            style={{ marginBottom:10,fontSize:17 }} />
          <div style={{ fontSize:12,color:"#64748b",marginBottom:8 }}>例：</div>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:14 }}>
            {["トヨタ自動車","NTT","伊藤忠商事"].map(ex => (
              <button key={ex} className="chip" onClick={()=>setCompany(ex)}>{ex}</button>
            ))}
          </div>
          {error && (
            <div className="err" style={{ marginBottom:12 }}>
              ⚠ {error}
              {dbg && <div style={{ marginTop:4,fontSize:11,color:"#ef4444",fontFamily:"monospace" }}>詳細: {dbg}</div>}
            </div>
          )}
          <button className="btn-p" onClick={analyzeCompany}>企業を分析する →</button>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          {[["⚙","8パーツ質問","車の部品で自分を可視化"],["🔍","具体性分析","抽象→具体に変換"],["🔗","一貫性チェック","回答間の整合性"],["🚗","企業別チューニング","ターゲット最適化"]].map(([ic,ti,su])=>(
            <div key={ti} className="card" style={{ padding:14 }}>
              <div style={{ fontSize:20,marginBottom:4 }}>{ic}</div>
              <div style={{ fontSize:13,fontWeight:700,marginBottom:2 }}>{ti}</div>
              <div style={{ fontSize:11,color:"#64748b" }}>{su}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── PREVIEW ───────────────────────────────────────────────────────
  if (screen === "preview") return (
    <div className="app">
      <style>{css}</style>
      <div className="wrap fade">
        <div className="card" style={{ marginBottom:14,background:"#eff6ff",borderColor:"#bfdbfe" }}>
          <div className="label" style={{ color:"#1d4ed8" }}>企業分析 COMPLETE</div>
          <div style={{ fontSize:24,fontWeight:900,marginBottom:6 }}>{company}</div>
          <div style={{ fontSize:13,color:"#374151",lineHeight:1.75 }}>{companyData?.companyDescription}</div>
          {companyData?.companyKeywords && (
            <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginTop:10 }}>
              {companyData.companyKeywords.map(kw=>(
                <span key={kw} style={{ background:"#dbeafe",color:"#1d4ed8",fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:500 }}>{kw}</span>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ marginBottom:14 }}>
          <div className="label" style={{ marginBottom:12 }}>8パーツ（全問回答）</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
            {PARTS.map(p=>(
              <div key={p.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:"#f8faff",borderRadius:8,border:"1.5px solid #e8edf8" }}>
                <div style={{ width:9,height:9,borderRadius:"50%",background:p.color,flexShrink:0 }}/>
                <div>
                  <div style={{ fontSize:12,fontWeight:700 }}>{p.ja}</div>
                  <div style={{ fontSize:10,color:"#64748b" }}>{p.meaning}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom:14 }}>
          <div className="label" style={{ marginBottom:10 }}>現在の車体（パーツ未完成）</div>
          <CarSVG completedParts={[]} />
        </div>

        <button className="btn-p" style={{ marginBottom:10 }} onClick={()=>setScreen("questions")}>
          質問に答える（全8問）→
        </button>
        <button className="btn-s" onClick={()=>setScreen("company")}>← 企業を変更する</button>
      </div>
    </div>
  );

  // ── QUESTIONS ─────────────────────────────────────────────────────
  if (screen === "questions") {
    const part = PARTS[idx];
    const question = qList[idx]?.question || `${part.ja}について教えてください。`;
    const pct = (idx / PARTS.length) * 100;

    return (
      <div className="app">
        <style>{css}</style>
        <div className="wrap fade">
          <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,color:"#64748b",marginBottom:8 }}>
            <span style={{ fontWeight:600 }}>{idx+1} / {PARTS.length}</span>
            <span style={{ color:"#2563eb",fontWeight:500 }}>{company}</span>
          </div>
          <div style={{ height:4,background:"#e2e8f0",borderRadius:4,marginBottom:18 }}>
            <div style={{ height:"100%",width:`${pct}%`,background:part.color,borderRadius:4,transition:"width 0.4s ease" }}/>
          </div>

          {/* Live car progress */}
          <div className="card" style={{ marginBottom:14,padding:14 }}>
            <CarSVG completedParts={done} />
            <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginTop:10,justifyContent:"center" }}>
              {PARTS.map((p,i)=>{
                const isDone = done.includes(p.id);
                const isCurrent = p.id === part.id;
                return (
                  <div key={p.id} style={{
                    width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",
                    justifyContent:"center",fontSize:10,fontWeight:700,transition:"all 0.3s",
                    background: isDone?p.color:isCurrent?"white":"#f1f5f9",
                    border: `2px solid ${isDone?p.color:isCurrent?p.color:"#e2e8f0"}`,
                    color: isDone?"white":isCurrent?p.color:"#94a3b8",
                    boxShadow: isCurrent?`0 0 0 3px ${p.color}30`:"none",
                  }}>{isDone?"✓":i+1}</div>
                );
              })}
            </div>
          </div>

          {/* Question card */}
          <div className="card" style={{ marginBottom:14,borderColor:part.color+"80",borderWidth:2 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
              <div style={{ width:8,height:8,borderRadius:"50%",background:part.color }}/>
              <span style={{ fontSize:10,fontWeight:700,color:part.color,letterSpacing:"1.5px" }}>{part.en} ── {part.ja}</span>
            </div>
            <div style={{ fontSize:15,lineHeight:1.8,color:"#0f172a" }}>{question}</div>
          </div>

          <textarea style={{ minHeight:120,marginBottom:10 }}
            placeholder="具体的なエピソードや経験を記入してください（50文字以上）..."
            value={curAns}
            onChange={e=>{ setCurAns(e.target.value); setValErr(""); }}
          />

          {valErr && (
            <div className="err" style={{ marginBottom:10 }}>
              ⚠ {valErr}　もう少し具体的に記入してください。
            </div>
          )}

          <button className="btn-p" onClick={validateAndNext}
            disabled={!curAns.trim()||validating}>
            {validating?"確認中...":idx<PARTS.length-1?`次のパーツへ（${idx+2}/${PARTS.length}）→`:"分析する →"}
          </button>
        </div>
      </div>
    );
  }

  // ── RESULTS ───────────────────────────────────────────────────────
  if (screen === "results" && results) {
    const allIds = PARTS.map(p=>p.id);
    const tabs = [
      { label:"総評", content:(
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {results.strongPoints?.length>0 && (
            <div className="card" style={{ borderColor:"#bbf7d0",background:"#f0fdf4",padding:14 }}>
              <div className="label" style={{ color:"#15803d" }}>強み</div>
              {results.strongPoints.map(s=><div key={s} style={{ fontSize:13,color:"#166534",marginBottom:4 }}>✓ {s}</div>)}
            </div>
          )}
          {[["具体性",results.specificity,"#1d4ed8"],["一貫性",results.consistency,"#7c3aed"],[`${company}適合性`,results.companyFit,"#0891b2"]].map(([l,v,c])=>(
            <div key={l} className="card" style={{ padding:14 }}>
              <div className="label" style={{ color:c }}>{l}</div>
              <div style={{ fontSize:13,lineHeight:1.8,color:"#374151" }}>{v}</div>
            </div>
          ))}
        </div>
      )},
      { label:"改善案", content:(
        <div className="card">
          {!(results.improvements?.length)
            ? <div style={{ color:"#64748b" }}>改善点は見つかりませんでした。</div>
            : results.improvements.map((imp,i,arr)=>{
              const p=PARTS.find(x=>x.id===imp.partId);
              return (
                <div key={i} style={{ paddingBottom:i<arr.length-1?16:0,marginBottom:i<arr.length-1?16:0,borderBottom:i<arr.length-1?"1.5px solid #e8edf8":"none" }}>
                  <div style={{ color:p?.color,fontSize:10,fontWeight:700,letterSpacing:"1.5px",marginBottom:6 }}>{p?.en} ── {p?.ja}</div>
                  <div style={{ color:"#dc2626",fontSize:12,marginBottom:8 }}>⚠ {imp.issue}</div>
                  <div style={{ background:"#f0fdf4",border:"1.5px solid #bbf7d0",borderRadius:8,padding:10,fontSize:13,color:"#166534",lineHeight:1.75 }}>✓ {imp.suggestion}</div>
                </div>
              );
            })}
        </div>
      )},
    ];

    return (
      <div className="app">
        <style>{css}</style>
        <div className="wrap fade">
          {/* Header */}
          <div className="card" style={{ marginBottom:14,background:"#eff6ff",borderColor:"#bfdbfe" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div>
                <div className="label" style={{ color:"#1d4ed8" }}>TUNE UP REPORT</div>
                <div style={{ fontSize:22,fontWeight:900 }}>{company}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:46,fontWeight:900,color:"#2563eb",lineHeight:1,fontFamily:"monospace" }}>{results.overallScore}</div>
                <div style={{ fontSize:11,color:"#64748b" }}>/ 5</div>
              </div>
            </div>
          </div>

          {/* Complete car */}
          <div className="card" style={{ marginBottom:14 }}>
            <div className="label" style={{ marginBottom:10 }}>完成車体</div>
            <CarSVG completedParts={allIds} />
          </div>

          {/* Dashboard gauges */}
          <div className="card" style={{ marginBottom:14 }}>
            <div className="label" style={{ marginBottom:12 }}>DASHBOARD</div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6 }}>
              {PARTS.map(p=><Gauge key={p.id} value={results.scores?.[p.id]||0} color={p.color} label={p.en} sublabel={p.ja}/>)}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:"flex",gap:6,marginBottom:12 }}>
            {tabs.map((t,i)=>(
              <button key={t.label} onClick={()=>setTab(i)}
                style={{ flex:1,padding:10,borderRadius:10,cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:"inherit",transition:"all 0.15s",border:"1.5px solid",borderColor:tab===i?"#2563eb":"#e2e8f0",background:tab===i?"#2563eb":"white",color:tab===i?"white":"#374151" }}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ marginBottom:16 }}>{tabs[tab].content}</div>

          <button className="btn-s" onClick={reset}>← 最初から</button>
        </div>
      </div>
    );
  }

  return null;
}
