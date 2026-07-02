import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import { validateChatBody, createRateLimiter } from "./lib/chat.js";

const app = express();
app.use(express.json({ limit: "256kb" }));

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The only place a model ID is pinned (CLAUDE.md: model IDs live in one place).
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-5";
const MAX_TOKENS = 1500;
const UPSTREAM_TIMEOUT_MS = 60000;

const allowRequest = createRateLimiter({ windowMs: 60000, max: 30 });

// ── API proxy: key stays server-side; client controls only messages/system ──
app.post("/api/chat", (req, res, next) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: { message: "ANTHROPIC_API_KEY が設定されていません" } });
  }

  // Render sits behind a trusted proxy, so the first x-forwarded-for hop is the client.
  const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress;
  if (!allowRequest(ip)) {
    return res.status(429).json({ error: { message: "リクエストが多すぎます。しばらく待ってからお試しください。" } });
  }

  const checked = validateChatBody(req.body);
  if (!checked.ok) {
    return res.status(400).json({ error: { message: checked.error } });
  }

  proxyToClaude(apiKey, checked.value, res).catch(next);
});

async function proxyToClaude(apiKey, value, res) {
  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, ...value }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    const timedOut = err.name === "TimeoutError";
    console.error("upstream error:", err.message);
    res.status(timedOut ? 504 : 502).json({
      error: { message: timedOut ? "AI応答がタイムアウトしました。もう一度お試しください。" : "AIサービスへの接続に失敗しました。" },
    });
  }
}

// ── Serve React build ─────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TuneUp server running on port ${PORT}`));
