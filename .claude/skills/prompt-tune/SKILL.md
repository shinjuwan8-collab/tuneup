---
name: prompt-tune
description: Audit and optimize a prompt, skill, or CLAUDE.md for clarity, token cost, and cross-model portability (Fable/Opus/Sonnet/Haiku). Use when editing any workflow asset or app prompt.
---

# prompt-tune

Effort: routine per asset. The goal is assets that survive model changes.

## Steps

1. **Read the asset and its call site.** For app prompts, read the code that
   sends them and parses the response (format contracts live there).
2. **Audit against this checklist**, citing line numbers:
   - **Contradictions**: two instructions that can't both be followed.
   - **Stale guardrails**: workarounds for old model weaknesses (excessive
     "do not hallucinate" repetition, chain-of-thought scaffolding a capable
     model doesn't need). Keep guardrails that protect correctness on *small*
     models; cut ones that only add tokens.
   - **Implicit judgment**: steps like "use your judgment" or "be smart about
     it" — rewrite as concrete criteria so small models can execute them.
   - **Missing output contract**: if code parses the response, the prompt must
     pin the exact format (and the parser should tolerate drift anyway).
   - **Hardcoded model IDs** in workflow assets (app config may pin them, in
     one place only).
   - **Redundancy**: the same rule stated twice; instructions restating
     platform defaults.
3. **Rewrite** applying the portable template shape:
   Context → Request (one sentence) → Output format → Constraints → Effort
   label → Evidence/verification requirement. Omit sections that don't apply;
   never pad.
4. **Portability check**: read the rewrite as if you were a small fast model —
   is every step executable without cleverness? If a step needs judgment,
   either add criteria or mark it "(optional — capable models only)".
5. **Deliver**: the rewritten asset, plus a table: change / reason / token
   delta (rough). If behavior might change, say which outputs to spot-check.

## Constraints

- Shorter is better only when nothing load-bearing is lost; never compress the
  output contract or safety constraints.
- One asset per pass; don't drive-by edit neighbors.
