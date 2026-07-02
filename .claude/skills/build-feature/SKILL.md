---
name: build-feature
description: Agentic coding loop — plan, implement, verify end-to-end, report with evidence. Use for any nontrivial code change (new feature, bug fix touching >1 file, refactor).
---

# build-feature

Effort: hard (default). If the user labels the task routine, compress steps 1–2 to one paragraph.

## Steps

1. **Restate the goal** in one sentence: what changes, for whom, and how you'll
   know it works. If that sentence can't be written, ask one clarifying question
   and stop.
2. **Read before writing.** Read every file you will modify and every file that
   calls into them. List the files with one line each on their role.
3. **Plan** as a short numbered list (max 7 steps). Prefer editing existing files
   over new files. No new dependencies unless requested.
4. **Implement** step by step. Match surrounding style (comment density, naming,
   idiom). After each file edit, note what changed in one line.
5. **Verify end-to-end**, not just "it compiles":
   - Run the build (`npm run build` here) and paste the result.
   - Drive the affected flow (start the server, hit the route, or exercise the
     UI path). If the project has tests, run them.
   - **(optional — capable models only)** Spawn a fresh-context agent to review
     the diff for bugs you're blind to. Smaller models: re-read your own diff
     top-to-bottom instead, hunting for one specific class of bug at a time
     (nulls, off-by-one, unhandled errors).
6. **Report**: TLDR of what changed and proof it works (commands + output),
   then files touched, then anything adjacent you noticed but didn't fix.

## Constraints

- Never claim success without step 5 output.
- If verification fails, fix and re-verify; report the failure honestly if stuck
  after 3 attempts, with the exact error output.
- Commit only when asked; when committing, one logical change per commit.
