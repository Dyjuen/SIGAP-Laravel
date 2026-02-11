---
description: Implement a new feature using TDD with `implementation_plan.md` specs.
---

1.  **PLANNING**:
    -   Switch to `PLANNING` mode.
    -   Write a spec in `implementation_plan.md` covering:
        -   User stories / Acceptance Criteria.
        -   API endpoints (Routes, Controllers).
        -   Database Schema (Migrations, Models).
        -   Edge cases & Error handling.
2.  **REVIEW**: Present the plan to the user via `notify_user` for approval.
3.  **TEST (Red)**: Write failing tests FIRST:
    -   Feature tests (`tests/Feature/`) for HTTP endpoints.
    -   Unit tests (`tests/Unit/`) for complex logic.
4.  **IMPLEMENT (Green)**: Build to pass tests:
    -   Migration → Model → Controller → Routes → React Page.
5.  **REFACTOR**: Clean up code while keeping tests green (check guidelines in `GEMINI.md`).
6.  **UI VERIFY**: Use Browser MCP to interact with the new feature (navigate, click, assert).
7.  **UPDATE RULES**: If new conventions emerge, propose updates to `GEMINI.md`.
