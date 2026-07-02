import test from "node:test";
import assert from "node:assert/strict";
import { validateChatBody, createRateLimiter, LIMITS } from "../lib/chat.js";

const msg = (content = "十分に具体的な回答テキスト", role = "user") => ({ role, content });

test("valid body passes and strips non-allowlisted fields", () => {
  const r = validateChatBody({
    system: "sys",
    messages: [msg()],
    model: "claude-opus-4-8",   // injection attempt
    max_tokens: 999999,          // injection attempt
  });
  assert.equal(r.ok, true);
  assert.deepEqual(Object.keys(r.value).sort(), ["messages", "system"]);
  assert.equal("model" in r.value, false);
});

test("system is optional", () => {
  assert.equal(validateChatBody({ messages: [msg()] }).ok, true);
});

test("rejects non-object bodies", () => {
  for (const bad of [null, [], "str", 42, undefined]) {
    assert.equal(validateChatBody(bad).ok, false);
  }
});

test("rejects missing/empty/oversized messages array", () => {
  assert.equal(validateChatBody({}).ok, false);
  assert.equal(validateChatBody({ messages: [] }).ok, false);
  const many = Array.from({ length: LIMITS.maxMessages + 1 }, () => msg());
  assert.equal(validateChatBody({ messages: many }).ok, false);
});

test("rejects bad roles and non-string/empty content", () => {
  assert.equal(validateChatBody({ messages: [msg("hi", "system")] }).ok, false);
  assert.equal(validateChatBody({ messages: [{ role: "user", content: 42 }] }).ok, false);
  assert.equal(validateChatBody({ messages: [msg("   ")] }).ok, false);
  assert.equal(validateChatBody({ messages: [null] }).ok, false);
});

test("rejects oversized system and total content", () => {
  const bigSys = "a".repeat(LIMITS.maxSystemChars + 1);
  assert.equal(validateChatBody({ system: bigSys, messages: [msg()] }).ok, false);
  const bigContent = "a".repeat(LIMITS.maxContentChars + 1);
  assert.equal(validateChatBody({ messages: [msg(bigContent)] }).ok, false);
});

test("rate limiter allows max per window, then blocks, then resets", () => {
  const allow = createRateLimiter({ windowMs: 1000, max: 3 });
  const t0 = 1000000;
  assert.equal(allow("ip1", t0), true);
  assert.equal(allow("ip1", t0 + 1), true);
  assert.equal(allow("ip1", t0 + 2), true);
  assert.equal(allow("ip1", t0 + 3), false);       // over limit
  assert.equal(allow("ip2", t0 + 3), true);        // other key unaffected
  assert.equal(allow("ip1", t0 + 1001), true);     // window reset
});
