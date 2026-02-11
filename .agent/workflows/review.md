---
description: Perform a structured code review of changed files.
---

1.  **Identify Changes**: `git diff --name-only` (or `git status`).
2.  **Analyze Each File**:
    -   **Correctness**: Does it meet requirements? Handle edge cases?
    -   **Tests**: are new paths covered by tests?
    -   **Security**: Check for SQL injection, XSS, mass assignment, auth bypass.
    -   **Performance**: Check for N+1 queries, missing indexes.
    -   **Conventions**: Does it follow `GEMINI.md` rules (naming, structure)?
3.  **Report**: provide a structured report with severity levels (Critical, Warning, Info).
4.  **Action**: Propose fixes for critical issues or flag for user decision.
