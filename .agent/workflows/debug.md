---
description: Debug complex or critical bugs using a systematic hypothesis-driven approach.
---

1.  **Reproduce**:
    -   Check `storage/logs/laravel.log`.
    -   Understand the error context and user report.
2.  **Hypothesize**: Form 2-3 specific hypotheses about the root cause.
3.  **Investigate**:
    -   Read stack traces.
    -   Check related code files.
    -   Find similar patterns in the codebase.
4.  **Isolate**: Write a **minimal failing test** case (Unit or Feature) that reproduces the bug.
5.  **Fix**: Apply the smallest change necessary to make the test pass.
6.  **Verify**:
    -   Run the new test: `php artisan test --filter=<TestName>`
    -   Run full suite: `composer test`
    -   **UI Verify**: Navigate to the page via Browser MCP to confirm visual fix.
7.  **Document**: If this reveals a new class of bug, propose a rule update to `GEMINI.md`.
