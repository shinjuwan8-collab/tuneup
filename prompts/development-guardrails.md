# Development Guardrails — reusable prompt for every feature

Copy-paste this when asking any AI model to implement a feature in any app.
Fill the [brackets]; keep the numbered rules verbatim — they are the review
checklist a strict senior engineer applies to AI-generated solo-dev code.

---

Context: I'm building [app] for [users]. This feature: [one sentence].
The app runs in production with real users and real data.

Request: Implement [feature] end-to-end, then verify it and report with
evidence.

Non-negotiable guardrails:
1. **Secrets & config**: no credentials/API keys in code, client bundles, or
   logs — environment variables only, with `.env.example` updated. Separate
   dev/prod config; never weaken prod settings to make dev easier.
2. **Trust boundaries**: treat every client-supplied value as hostile.
   Validate types/sizes/enums server-side with an allowlist (not a denylist).
   The client must never control cost levers (model, token budgets, quotas),
   other users' data, or authorization decisions.
3. **Injection & common vulns**: parameterized queries only (no string-built
   SQL), escape/encode all user content rendered in HTML (XSS), CSRF
   protection on state-changing routes, no `eval`/dynamic deserialization of
   user input.
4. **Errors & logging**: every external call has a timeout and a caught
   failure path; users get a safe, actionable message; internals (stack
   traces, keys, queries) are logged server-side only.
5. **Maintainability**: pure logic goes in small dependency-free modules;
   side effects (HTTP, DB) at the edges. No duplication of an existing
   helper; match the codebase's style. If the diff exceeds ~300 lines,
   stop and propose a split.
6. **Tests**: ship unit tests for the pure logic including hostile inputs
   (oversize, wrong types, injection strings) and at least one integration
   check of the happy path. New code without tests is an incomplete task.
7. **Dependencies**: no new dependency without stating why the stdlib or an
   existing dep can't do it, and checking maintenance status.
8. **Scalability honesty**: state which parts are single-instance assumptions
   (in-memory caches/limiters, local files) in a code comment and in the
   report, so future scaling work knows where to look.

Verification (required before reporting):
- Run the build and the test suite; paste results.
- Drive the real flow (curl the route / click the UI) including one failure
  case; paste evidence.
- Re-read the diff hunting one bug class at a time: unhandled rejections,
  missing awaits, unvalidated fields, leaked secrets.

Report format: TLDR outcome in complete sentences → evidence (commands +
output) → files touched → known limitations / adjacent issues noticed but
not fixed (do NOT fix them silently).

Checkpoint: pause only for destructive actions (data migrations, deletions),
scope changes, or credentials only I can provide. Otherwise complete the task.
