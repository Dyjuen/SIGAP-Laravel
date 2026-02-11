---
description: Run tests, lint, review changes, and generate a conventional commit.
---

// turbo-all
1.  **Run Tests**: `composer test` (skip with `--skip-tests`)
2.  **Lint Check**: `./vendor/bin/pint --test` (skip with `--skip-lint`)
3.  **Review Changes**: Check `git diff --staged` (or `git diff` if unstaged)
4.  **Code Review Check**:
    -   Anti-patterns (N+1 queries)?
    -   Missing tests?
    -   Security issues (XSS, auth bypass)?
    -   Follows `GEMINI.md` rules?
5.  **Stage Changes**: `git add -A`
6.  **Generate Commit Message**: Create a Conventional Commit message (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`).
7.  **Commit**: `git commit -m "<type>(<scope>): <subject>"`
