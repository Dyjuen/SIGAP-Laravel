# Manual Code-Injection System (SIGAP Test Runner)

## Overview
A system allowing teammates to manually input and manage Playwright test scripts without requiring a Gemini API key. This shifts the responsibility of code creation to the user, providing a "Custom Code" field for each test case.

## Architecture
1.  **Frontend (index.html)**:
    -   Add a code editor modal or inline field for "Custom Code".
    -   Load existing implementation IDs from `server.js`.
2.  **Backend (server.js)**:
    -   New endpoint `/save-test`: Saves manual JavaScript code to `playwright/tests/kegiatan-manual.spec.js`.
    -   Endpoint `/run-tests`: Continues to execute and report results.
3.  **Storage**:
    -   `playwright/tests/kegiatan-manual.spec.js`: Stores all manually entered test blocks.

## Workflow
1.  Teammate selects a Test Case (e.g., LPJ-F-001).
2.  Teammate pastes their Playwright code into the "Custom Code" box.
3.  User clicks "Save & Sync".
4.  Server appends/updates the code in the manual spec file.
5.  User clicks "Run Test" to verify.
