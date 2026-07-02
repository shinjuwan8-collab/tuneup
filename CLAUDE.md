# CLAUDE.md — TUNEUP

## What this project is

TUNEUP (就活チューニングアプリ) — a job-hunting prep app that "tunes" a candidate
toward a target company using a car metaphor (8 parts = 8 self-analysis axes).
React 18 + Vite frontend, Express proxy backend, Claude API, deployed on Render.

## Stack

Single stack: `server.js` (Express proxy) + root `src/` (React) + Vite.
(An abandoned FastAPI variant — `main.py`, `frontend/` — was deleted 2026-07-02.)

`/api/chat` contract: the client sends only `{ system?, messages }`. The server
validates/allowlists the body (`lib/chat.js`), pins `model` and `max_tokens`
(`server.js` — the only place a model ID lives), rate-limits per IP, and
times out upstream calls. Never let the client choose model or token budget.

## Commands

```bash
npm install
ANTHROPIC_API_KEY=sk-ant-... node server.js   # terminal 1 (port 3000)
npm run dev:client                             # terminal 2 (Vite, port 5173)
npm run build                                  # outputs root dist/ (served by server.js)
```

`npm test` runs unit tests (node:test, zero deps) for `lib/chat.js`.
Full verification = build + tests + drive the app (company input → 8
questions → results screen).

## Known issues (see docs/audit-2026-07-02.md for the founding audit)

- Claude prompts live inline in `src/App.jsx` (analyzeCompany, validateAndNext,
  analyzeAnswers). When touching them, consider extracting to `src/prompts.js`.
- Rate limiter is in-memory: correct for one Render instance; revisit if
  scaling to multiple instances (move to a shared store).

## Production quality bar (all code changes)

1. **Secrets**: only via environment variables; never in code, logs, or client
   bundles. `.env` stays gitignored; `.env.example` documents required vars.
2. **Trust boundaries**: validate and allowlist every client-supplied field at
   the server; the client never controls model, token budget, or cost levers.
3. **Errors**: every external call gets a timeout, a caught error path, and a
   user-safe message (no stack traces or internals to the client); log the
   detail server-side.
4. **Tests**: pure logic lives in dependency-free modules (`lib/`) with
   node:test coverage including hostile inputs (injection attempts, oversize,
   wrong types). New logic ships with tests.
5. **Docs**: README commands must actually work; model/config facts stated in
   exactly one place and referenced elsewhere.

---

## Operating principles (all models)

These rules are the core workflow contract. They are written as explicit steps so
they work on Fable, Opus, Sonnet, or Haiku — smaller models: follow them literally;
larger models: treat them as the floor, not the ceiling.

1. **Act autonomously.** When you have enough information, act. Don't re-litigate
   decisions already made in the conversation or recorded in `notes/`.
2. **Checkpoint policy.** Pause only for: destructive/irreversible actions, major
   scope changes, or input only the user can provide. Otherwise continue to
   completion.
3. **Evidence before claims.** Before reporting progress, audit every claim
   against a tool result, build output, or test run. "It should work" is not a
   report. Quote the command and its output.
4. **Report format.** Start every report with a TLDR outcome in complete
   sentences, then supporting detail. No jargon-chains or fragments.
5. **Scope.** Do the simplest thing that works well. No unrequested features,
   abstractions, or refactors. If you notice adjacent problems, list them at the
   end instead of fixing them.
6. **Memory.** Record durable learnings in `notes/` (one topic per file; update
   in place, never duplicate, delete what proved wrong). See `notes/README.md`.
7. **Effort dial.** Tasks are labeled `routine` / `hard` / `hardest`. Scope your
   effort at the top of the label's range, not beyond it. Unlabeled = routine.
8. **Skills first.** Before improvising a workflow, check `.claude/skills/` —
   if a skill matches the task, follow it.

## Model portability notes

- Skills and prompts in this repo must remain runnable by smaller models:
  numbered steps, explicit output formats, no "use your judgment" as a step.
- Never hardcode a model ID in workflow assets; say "the configured model".
  App code may pin model IDs, but keep them in one place.
- Sub-agent orchestration steps in skills are marked **(optional — capable
  models only)**; smaller models should execute those steps inline instead.
