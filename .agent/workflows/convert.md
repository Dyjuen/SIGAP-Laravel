---
description: Convert a feature from SIGAP-PNJ (native PHP) to Laravel Inertia (React).
---

1.  **ANALYZE**:
    -   Locate source files in **`../SIGAP-PNJ`** (relative sibling path).
    -   Controller: `app/Controllers/<Name>Controller.php`
    -   Model: `app/Models/<Name>.php`
    -   Migration: `database/migrations/`
    -   Routes: `routes/api.php`
    -   Views: `app/Views/` & `public/`
2.  **PLAN (Spec)**: In `implementation_plan.md`:
    -   Map existing endpoints to Laravel routes.
    -   Map raw SQL to Eloquent.
    -   Map native views to React/Inertia pages.
    -   Identify modern improvements (Validation, Auth).
3.  **REVIEW**: Present plan to user via `notify_user`.
4.  **TEST (Red)**: Write failing tests replicating native behavior.
5.  **IMPLEMENT (Green)**: Build full stack in one pass:
    -   Migration → Model → FormRequest → Controller → Route → React Page.
6.  **UI VERIFY**: Use Browser MCP to interact with the converted frontend.
7.  **VERIFY**: Ensure full test suite passes.
8.  **TRACK**: Update `.agent/docs/conversion-tracker.md`.
