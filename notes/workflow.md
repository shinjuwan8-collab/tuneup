# Workflow learnings

- (2026-07-02) This repo had no CLAUDE.md/skills/notes before today; the whole
  asset system was created in the fable5-workflow-audit branch. See
  docs/audit-2026-07-02.md for the founding audit.
- (2026-07-02) The dead FastAPI variant (main.py + frontend/) was deleted the
  same day it was found; the Node stack is the only stack.
- (2026-07-02) App prompts (3) live inline in src/App.jsx and all demand
  JSON-only output; parseJSON() there already tolerates fenced/dirty JSON.
  If prompts are extracted to src/prompts.js, keep the parser tolerant.
- (2026-07-02) Verification = `npm run build` + `npm test` (node:test on
  lib/chat.js) + manually driving company → questions → results.
- (2026-07-02) `node --test test/` fails (resolves the dir as a module on
  Node 22); plain `node --test` auto-discovers *.test.js and works.
