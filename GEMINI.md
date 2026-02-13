# SIGAP-Laravel Project Rules & Context

## Project Context
**Goal**: Convert SIGAP-PNJ (native PHP) to Laravel 12 + Inertia.js (React) + Tailwind CSS.
**Domain**: Activity and budget management system for an Indonesian polytechnic.
**Source**: `../SIGAP-PNJ` (Sibling directory is the reference source).

## Tech Stack
- **Backend**: Laravel 12, PHP 8.2+
- **Frontend**: Inertia.js v2, React 18, Tailwind CSS v3
- **Database**: PostgreSQL via Supabase (all environments)
- **Testing**: PHPUnit 11 (Backend), Browser MCP (UI)
- **Tooling**: Laravel Pint (Linting), TypeScript (optional but preferred for props)

## Development Philosophy
1.  **TDD-First**: Write tests (Red) before implementation (Green).
2.  **Spec-in-Plan**: Feature specs live in `implementation_plan.md`, not separate files.
3.  **Unified Full-Stack**: Convert features deeply (Backend + Frontend) in one pass per feature.
4.  **Best Practices Mentor**: Agent acts as a senior mentor — always explain *why* and advocate for best practices.

## Rules

### 1. Testing is Mandatory
- **Backend**: Every feature must have Feature tests (`tests/Feature`).
- **Frontend**: Every UI flow must be verified via Browser MCP tools after implementation.
- **Commit Gate**: `composer test` must pass before any commit.

### 2. Living Documentation
- **Read First**: Agents **MUST** read `.agent/docs/` before starting tasks to understand architecture and known issues.
- **Self-Update**: Agents **MUST** propose updates to rules/docs via `notify_user` if new patterns/bugs emerge.

### 3. Skills Usage
- **Apply Skills**: Agents **MUST** read relevant `.agent/skills/` before coding:
    - `laravel-conventions` for backend logic
    - `inertia-react` for frontend logic
    - `testing-patterns` for writing tests

### 4. Language & Localization
- **Indonesian UI**: ALL user-facing text (buttons, labels, errors, toasts) **MUST** be in **Bahasa Indonesia**.
- **Code**: Variable/function names in English (e.g., `ActivityController`, not `KegiatanController` — unless mapping legacy DB requires it, but prefer mapping to English models).

### 5. Conversion Strategy
- **Reference**: Use `../SIGAP-PNJ` as the living spec.
- **Process**: Map Native → Laravel 1:1 for logic, but upgrade implementation to Laravel best practices (e.g., use Form Requests for validation).
