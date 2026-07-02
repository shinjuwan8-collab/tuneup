# CLAUDE.md — TUNEUP

## What this project is

TUNEUP (就活チューニングアプリ) — a job-hunting prep app that "tunes" a candidate
toward a target company using a car metaphor (8 parts = 8 self-analysis axes).
React 18 + Vite frontend, Express proxy backend, Claude API, deployed on Render.

## Canonical stack (important — there are two in the tree)

The **Node stack is canonical**: `server.js` + root `src/` + root `vite.config.js`.
- `main.py` / `requirements.txt` / `frontend/` are an abandoned FastAPI variant.
  `frontend/src/main.jsx` imports a nonexistent `App.jsx`, so it does not build.
  Do not extend the FastAPI variant; if asked to clean up, propose deleting it.
- The app calls `POST /api/chat` (`src/App.jsx`); only `server.js` serves that route.

## Commands

```bash
npm install
ANTHROPIC_API_KEY=sk-ant-... node server.js   # terminal 1 (port 3000)
npm run dev:client                             # terminal 2 (Vite, port 5173)
npm run build                                  # outputs root dist/ (served by server.js)
```

There are no tests or linters yet. Verification = build succeeds + drive the app
(company input → 8 questions → results screen).

## Known issues (see docs/audit-2026-07-02.md for evidence)

- README model name is stale (`claude-sonnet-4`; code uses `claude-sonnet-4-5`).
- Root `dist/` is not gitignored (only `frontend/dist/` is).
- `/api/chat` forwards the client body verbatim — no model/max_tokens allowlist.
- Claude prompts live inline in `src/App.jsx` (analyzeCompany, validateAndNext,
  analyzeAnswers). When touching them, consider extracting to `src/prompts.js`.

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
