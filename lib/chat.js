// Request validation and rate limiting for the /api/chat proxy.
// Dependency-free and separate from server.js so it can be unit-tested.

export const LIMITS = {
  maxMessages: 40,
  maxContentChars: 30000, // total across all message contents
  maxSystemChars: 4000,
};

// Returns { ok: true, value: { system?, messages } } with only the allowlisted
// fields, or { ok: false, error }. The client must never control model or
// max_tokens — those are pinned in server.js.
export function validateChatBody(body) {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "body must be a JSON object" };
  }
  const { system, messages } = body;

  if (system !== undefined) {
    if (typeof system !== "string") return { ok: false, error: "system must be a string" };
    if (system.length > LIMITS.maxSystemChars) {
      return { ok: false, error: `system exceeds ${LIMITS.maxSystemChars} chars` };
    }
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false, error: "messages must be a non-empty array" };
  }
  if (messages.length > LIMITS.maxMessages) {
    return { ok: false, error: `messages exceeds ${LIMITS.maxMessages} items` };
  }

  let totalChars = 0;
  const clean = [];
  for (const m of messages) {
    if (typeof m !== "object" || m === null) return { ok: false, error: "each message must be an object" };
    if (m.role !== "user" && m.role !== "assistant") {
      return { ok: false, error: "message role must be 'user' or 'assistant'" };
    }
    if (typeof m.content !== "string" || m.content.trim() === "") {
      return { ok: false, error: "message content must be a non-empty string" };
    }
    totalChars += m.content.length;
    clean.push({ role: m.role, content: m.content });
  }
  if (totalChars > LIMITS.maxContentChars) {
    return { ok: false, error: `total content exceeds ${LIMITS.maxContentChars} chars` };
  }

  const value = { messages: clean };
  if (system !== undefined) value.system = system;
  return { ok: true, value };
}

// Fixed-window in-memory limiter: fine for a single Render instance.
// Entries are pruned when the map grows, so memory stays bounded.
export function createRateLimiter({ windowMs = 60000, max = 30 } = {}) {
  const hits = new Map(); // key -> { count, windowStart }
  return function allow(key, now = Date.now()) {
    if (hits.size > 10000) {
      for (const [k, v] of hits) {
        if (now - v.windowStart >= windowMs) hits.delete(k);
      }
    }
    const entry = hits.get(key);
    if (!entry || now - entry.windowStart >= windowMs) {
      hits.set(key, { count: 1, windowStart: now });
      return true;
    }
    entry.count += 1;
    return entry.count <= max;
  };
}
