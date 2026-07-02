# notes/ — agent memory

Durable, cross-session memory for AI agents working in this repo. CLAUDE.md
holds the stable contract; `notes/` holds evolving learnings.

## Rules

1. **One topic per file**, kebab-case (`deploy.md`, `claude-api.md`,
   `workflow.md`). No dated journal files — dates go on entries, not files.
2. **Update in place.** Before adding a learning, search the file for an
   existing entry on the same fact and edit it instead of appending a duplicate.
3. **Delete what proved wrong.** A note contradicted by evidence gets removed
   (or corrected), not annotated. Stale memory is worse than no memory.
4. **Entries are falsifiable facts**, one bullet each, with a date and — where
   possible — evidence: `- (2026-07-02) Build outputs to root dist/, not
   frontend/dist/ (see server.js:34).`
5. **Keep it small.** A file over ~60 lines is a signal to promote stable facts
   into CLAUDE.md and delete transient ones. Memory that nobody re-reads is
   dead weight.
6. **Written by retros.** The `/retro` skill is the main writer; ad-hoc
   additions are fine but follow the same rules.
