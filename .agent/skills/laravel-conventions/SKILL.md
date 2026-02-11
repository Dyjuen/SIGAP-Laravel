---
description: Laravel 12 conventions, patterns, and anti-patterns for SIGAP-Laravel backend development. Triggers: creating controllers, models, migrations, routes.
---

# Laravel Conventions & Patterns

## Naming Standards
-   **Controllers**: `SingularController` (e.g., `UserController`, not `UsersController`).
-   **Models**: `Singular` (e.g., `User`, not `Users`).
-   **Tables**: `plural_snake_case` (e.g., `users`, `activity_logs`).
-   **Migrations**: `create_table_name_table` (e.g., `2024_01_01_000000_create_activity_logs_table.php`).
-   **Routes**: `kebab-case` URIs, `camelCase` names (e.g., `Route::get('/user-profile', ...)->name('userProfile.show')`).

## Controller Patterns
-   **Resource Controllers**: Prefer standard CRUD methods (`index`, `create`, `store`, `show`, `edit`, `update`, `destroy`).
-   **Single Action**: Use `__invoke` for single-purpose controllers (e.g., `DownloadReportController`).
-   **Fat Models, Skinny Controllers**: Move business logic to Models or Services. Controllers should only handle request/response.

## Eloquent Patterns
-   **Eager Loading**: Always use `with()` to prevent N+1 queries.
    -   *Bad*: `$users = User::all(); foreach ($users as $user) { echo $user->profile->name; }`
    -   *Good*: `$users = User::with('profile')->get();`
-   **Scopes**: Use local scopes for reusable query constraints (e.g., `scopeActive()`).

## Validation
-   **Form Requests**: Always use Form Request classes for validation, never validate directly in the controller.
    -   `php artisan make:request StoreUserRequest`

## API Resources
-   Use `JsonResource` to transform models into JSON responses. This ensures a consistent API structure and prevents exposing internal model attributes (like passwords).
    -   `php artisan make:resource UserResource`

## Anti-Patterns to Avoid
-   ❌ **N+1 Queries**: Detecting loop queries without eager loading.
-   ❌ **Mass Assignment**: Using `fill()` or `create()` with unvalidated data.
-   ❌ **Logic in Views**: Blade/React should only display data, not process it.
-   ❌ **God Objects**: Giant controllers or models that do everything. Break them down.
