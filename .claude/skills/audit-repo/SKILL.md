---
name: audit-repo
description: Full-repo consistency audit — find contradictions, dead code, doc drift, redundant or stale instructions. Use when asked to audit, review health, or before a big refactor.
---

# audit-repo

Effort: hard. Read everything before concluding anything.

## Steps

1. **Inventory**: list every tracked file (exclude .git, node_modules, dist).
   Read each one completely. Do not sample.
2. **Hunt these defect classes**, in order:
   - **Contradictions**: docs vs code (commands, ports, model names, endpoints),
     config A vs config B, two implementations of the same thing.
   - **Dead assets**: files nothing imports, scripts nothing calls, deps nothing
     uses, broken imports.
   - **Drift**: README instructions that no longer work; stale version pins.
   - **Risk**: secrets in tree, unvalidated inputs at trust boundaries,
     unbounded external calls (cost or abuse).
   - **Redundancy**: duplicated logic/instructions that could be one source of
     truth.
3. **Evidence rule**: every finding must cite `file:line` and quote the
   conflicting lines. A finding without evidence gets deleted, not hedged.
4. **Severity-rank**: breaks-now → will-break → costs-money → confusing.
5. **Write the report** to `docs/audit-YYYY-MM-DD.md`:
   - TLDR paragraph (counts by severity, single most important finding).
   - One section per finding: evidence, impact, smallest viable fix.
   - "Not findings" section: things checked that were fine (prevents re-auditing).
6. **Do not fix anything** during an audit unless explicitly asked. The report
   is the deliverable.

## Constraints

- No speculative findings ("could be improved"). Only defects with evidence.
- Cap at the 15 most important findings; note if more exist.
