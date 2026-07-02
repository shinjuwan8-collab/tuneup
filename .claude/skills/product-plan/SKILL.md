---
name: product-plan
description: Turn a fuzzy product idea into a one-page plan — problem, user, smallest lovable scope, risks, milestones. Use for "plan feature X", "should we build Y", or roadmap work.
---

# product-plan

Effort: hard for new products, routine for single features.

## Steps

1. **Extract the core**: who is the user, what job are they hiring this for,
   what happens today without it. If any of the three is unknown, state your
   assumption explicitly rather than asking — the plan can be corrected.
2. **Define the smallest lovable version**: the minimum scope where a real user
   gets real value in one session. Everything else goes to "later".
3. **Write the plan** (one page, exactly these sections):
   - **Problem** (2–3 sentences, from the user's point of view)
   - **User & context** (who, when, on what device)
   - **Solution sketch** (the flow in ≤6 numbered steps)
   - **Out of scope** (explicit — this section prevents scope creep)
   - **Risks & unknowns** (ranked; mark which one to test first)
   - **Milestones** (3 max: prove-it, usable, polished — each with a
     verifiable "done" condition)
   - **Success signal** (one measurable thing that says it worked)
4. **Stress-test**: for each risk, write the cheapest experiment that would
   surface it before building (a prompt test, a landing page, a manual run).
5. **Deliver** with a TLDR recommendation: build / test-first / don't build,
   and why in one sentence.

## Constraints

- One page. If it doesn't fit, the scope is too big — cut, don't compress.
- No solution detail (tech stack, schema) unless the risk analysis demands it.
- Ground claims about users in evidence when available; label guesses as guesses.
