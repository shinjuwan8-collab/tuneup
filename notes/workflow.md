# Workflow learnings

- (2026-07-02) This repo had no CLAUDE.md/skills/notes before today; the whole
  asset system was created in the fable5-workflow-audit branch. See
  docs/audit-2026-07-02.md for the founding audit.
- (2026-07-02) The Node stack (server.js + root src/) is canonical; the FastAPI
  variant (main.py + frontend/) is dead — frontend/src/App.jsx doesn't exist,
  so that build fails. Decision pending: delete the FastAPI variant.
- (2026-07-02) App prompts (3) live inline in src/App.jsx and all demand
  JSON-only output; parseJSON() there already tolerates fenced/dirty JSON.
  If prompts are extracted to src/prompts.js, keep the parser tolerant.
- (2026-07-02) There are no tests or linters; the only verification is
  `npm run build` + manually driving company → questions → results.
