---
name: research
description: Research a question and produce a decision-ready brief with sourced, triangulated claims. Use for market/technical/competitive research, "should we use X", or "what's the state of Y".
---

# research

Effort: hard. The failure mode is a plausible-sounding brief built on one source.

## Steps

1. **Frame**: write the decision this research serves ("choosing between A and B
   for C") and 3–5 sub-questions that would settle it. Confirm framing only if
   the request was ambiguous; otherwise proceed.
2. **Gather**: for each sub-question, collect evidence from at least 2
   independent sources (web search, docs, code, data). Record source + date for
   every claim as you go — not at the end.
   - **(optional — capable models only)** Fan sub-questions out to parallel
     sub-agents, one per sub-question, each returning claims-with-sources.
     Smaller models: work through sub-questions sequentially.
3. **Triangulate**: mark each claim `confirmed` (2+ independent sources),
   `single-source`, or `conflicting`. Conflicts get investigated, not averaged.
4. **Answer**: write the brief:
   - **TLDR**: the answer to the top-level question in 2–4 sentences,
     including confidence level and the main caveat.
   - **Findings**: one section per sub-question — answer, evidence, sources.
   - **What would change this conclusion**: 2–3 falsifiers.
   - **Recommended next step**: one concrete action.
5. **Self-check** before delivering: reread every sentence containing a number,
   a name, or a date and verify it appears in your gathered evidence. Delete or
   flag anything you can't trace.

## Constraints

- Never present a single-source claim as settled.
- Recency matters: for fast-moving topics prefer sources <12 months old and say
  when you couldn't find any.
- Max 2 pages unless asked for more.
