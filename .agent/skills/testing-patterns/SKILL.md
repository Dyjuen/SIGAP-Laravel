---
description: Testing patterns (PHPUnit, Browser MCP) for SIGAP-Laravel. Triggers: writing tests, TDD, failing tests.
---

# Testing Patterns

## PHPUnit (Backend)
-   **Feature Tests**: Test HTTP endpoints, controllers, and integration.
    -   Use `RefreshDatabase` trait to reset DB state.
    -   Use `actingAs($user)` for authenticated routes.
-   **Unit Tests**: Test models, services, and isolated logic.
-   **Factories**: Use Model Factories to generate test data.
    -   `$user = User::factory()->create();`
-   **Inertia Assertions**:
    -   `$response->assertInertia(fn (Assert $page) => ...)`
    -   Check component name: `$page->component('Dashboard')`
    -   Check props: `$page->has('users')`

## Browser MCP (UI Verification)
-   **When**: After implementing a feature (Green state).
-   **How**:
    1.  Navigate to the page URL.
    2.  Interact (click, type) to simulate user flow.
    3.  Assert successful state (redirect, success message).
    4.  **Take Screenshot**: Capture visual proof.

## Test Structure (AAA)
-   **Arrange**: Set up the world (create users, data).
-   **Act**: Perform the action (visit route, call method).
-   **Assert**: Verify the result (check DB, check response, check UI).

## Authentication Testing
-   Always test both authenticated and unauthenticated states for protected routes.
-   Test role-based access control (RBAC) if applicable.
