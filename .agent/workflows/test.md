---
description: Run tests (backend + UI) or write new tests.
---

// turbo-all
1.  **Run All Tests**: `composer test`
2.  **Run Specific Test**: `php artisan test --filter=<TestName>`
3.  **Run Suite**: `php artisan test --testsuite=Unit` or `Feature`
4.  **Writing Tests**:
    -   Use `RefreshDatabase` trait.
    -   Follow AAA pattern (Arrange, Act, Assert).
    -   Use Factories for test data.
5.  **UI Verification**:
    -   Navigate to the page using Browser MCP.
    -   Interact with elements (fill forms, click buttons).
    -   Assert visible content/redirects.
    -   Take screenshots for visual confirmation.
