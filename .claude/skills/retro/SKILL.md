---
name: retro
description: End-of-session retrospective — extract durable learnings into notes/, and upgrade skills/CLAUDE.md when a lesson generalizes. Use at the end of significant work sessions or after something went wrong.
---

# retro

Effort: routine. Ten focused minutes, not a ceremony.

## Steps

1. **Reconstruct**: list what was attempted this session, what shipped, what
   failed or surprised. Pull from the actual conversation/diff, not memory of it.
2. **Classify each surprise or failure**:
   - **Project fact** (e.g. "the FastAPI variant is dead") → belongs in
     `CLAUDE.md` or a `notes/` topic file.
   - **Process lesson** (e.g. "verification caught a bug review missed") →
     belongs in the relevant skill as a step or constraint.
   - **One-off** (bad luck, typo) → record nowhere; noise kills memory systems.
3. **Update memory** per `notes/README.md` rules: one topic per file, edit in
   place, no duplicates, delete anything this session proved wrong. Deleting
   stale notes is as valuable as adding new ones.
4. **Upgrade at most one skill or CLAUDE.md section** if a process lesson
   generalizes. One per retro — bulk rewrites churn the system. State the
   change as: "when X happened, the skill said Y, it should have said Z."
5. **Report**: TLDR of learnings recorded (with file paths), notes deleted,
   and the one skill change made (or "none warranted").

## Constraints

- Never append-only: every retro must consider deletions.
- Learnings must be falsifiable statements, not vibes ("builds take ~40s" not
  "builds are slow").
- If the session went cleanly with no surprises, say so and change nothing.
