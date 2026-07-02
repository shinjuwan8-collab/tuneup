---
name: discover
description: Discovery workflow — survey the project/goals and surface the highest-leverage tasks worth delegating to an AI agent, ranked by impact vs. effort. Use when asking "what should I work on next" or "what can you take off my plate".
---

# discover

Effort: hard. The output is a ranked backlog, not a brainstorm.

(A copy-paste standalone version of this workflow lives in
`prompts/discovery-workflow.md` for use outside this repo.)

## Steps

1. **Survey reality**: read CLAUDE.md, `notes/`, recent git log (last 20
   commits), open TODOs/FIXMEs in code, and any stated goals in the request.
   List the 3 active goals you infer, so the user can correct them cheaply.
2. **Generate candidates** across four lanes (aim for 3–4 per lane):
   - **Unblock**: broken/stale things silently taxing every session
     (failing builds, doc drift, dead code).
   - **Leverage**: assets that pay compounding returns (a test harness, a
     skill, an extracted prompt library, CI).
   - **Advance**: the next milestone-moving feature or research question.
   - **De-risk**: the assumption that, if wrong, wastes the most future work.
3. **Score each candidate** 1–5 on: impact toward stated goals, agent-fit
   (can an AI complete it autonomously with verifiable output?), and cost
   (inverse). Leverage = impact × agent-fit ÷ cost.
4. **Rank and prune** to the top 5–7. For each, write:
   - One-sentence task statement (executable as-is by an agent).
   - Why now (evidence from step 1 — cite files/commits).
   - Verification: how the user will know it's done and correct.
   - Effort label: routine / hard / hardest.
5. **Deliver**: TLDR naming the single best next task and why, then the ranked
   table, then the lane candidates that didn't make the cut (one line each).

## Constraints

- Every recommendation must trace to evidence from step 1 — no generic advice
  ("add tests") without pointing at what it would have caught here.
- Prefer tasks with objective verification; flag any that need human taste.
- Do not start executing any task; the ranked list is the deliverable.
