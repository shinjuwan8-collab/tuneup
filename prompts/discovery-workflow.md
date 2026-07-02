# Discovery Workflow — reusable prompt

Copy-paste this into any Claude session (any project, any capable model) to get
a ranked list of high-leverage tasks worth delegating. Fill the [brackets];
delete lines that don't apply. Inside this repo, prefer running the `/discover`
skill instead — it's the same workflow wired to this project's files.

---

Context: I'm working on [project/goal] for [who it's for]. My current
priorities are [1–3 priorities, or "infer them from the repo"].

Request: Survey the project and surface the highest-leverage tasks I should
delegate to you, ranked by impact vs. effort.

Process:
1. Read the project's CLAUDE.md, memory notes, recent git history (~20
   commits), and TODOs/FIXMEs in code. State the 3 active goals you infer so
   I can correct them cheaply.
2. Generate 3–4 candidate tasks in each lane:
   - Unblock: broken or stale things silently taxing every work session.
   - Leverage: assets with compounding returns (tests, CI, skills, extracted
     prompt libraries).
   - Advance: the next milestone-moving feature or research question.
   - De-risk: the assumption that, if wrong, wastes the most future work.
3. Score each 1–5 on impact, agent-fit (can you complete it autonomously with
   verifiable output?), and cost (inverse). Leverage = impact × agent-fit ÷ cost.
4. Rank and prune to the top 5–7.

Output format: TLDR naming the single best next task and why (complete
sentences). Then a table: task (one executable sentence) | why now (cite
files/commits) | how I'll verify it's done | effort (routine/hard/hardest).
Then one line each on the candidates that didn't make the cut.

Constraints: Every recommendation must trace to evidence you actually read —
no generic advice. Prefer tasks with objective verification. Do NOT start
executing anything; the ranked list is the deliverable.

Effort: This is a hard problem — scope it at the top of your range. Act
autonomously; pause only if the repo is missing something only I can provide.
