# System Architecture

## Overview
SIGAP-Laravel is a web-based activity and budget management system for an Indonesian polytechnic. It is being converted from a native PHP application (SIGAP-PNJ) to a modern Laravel stack.

## Tech Stack
-   **Framework**: Laravel 12
-   **Frontend**: Inertia.js v2 + React 18
-   **Styling**: Tailwind CSS v3
-   **Database**:
    -   **Local/Test**: PostgreSQL
    -   **Production**: PostgreSQL
-   **Testing**: PHPUnit 11 (Backend), Browser MCP (Frontend)

## Key Components
-   **Authentication**: Laravel Breeze (scaffolded).
-   **Roles & Permissions**: (To be implemented - likely Spatie Permission or custom Policy based).
-   **PDF Generation**: (To be determined - likely dompdf or snappy).
-   **Excel**: (To be determined - likely Laravel Excel).

## Directory Structure
-   `app/Models`: Eloquent models.
-   `app/Http/Controllers`: Backend logic handling requests and returning Inertia responses.
-   `app/Http/Requests`: Form validation logic.
-   `resources/js/Pages`: React page components (Inertia views).
-   `resources/js/Components`: Reusable React components.
-   `tests/Feature`: Feature tests for full HTTP flow.
-   `tests/Unit`: Unit tests for isolated logic.

## Design Decisions
-   **Full-Stack Inertia**: No separate API layer for the web app. Controllers return `Inertia::render()`.
-   **English Code, Indonesian UI**: Codebase uses English naming; Interface uses Bahasa Indonesia.
