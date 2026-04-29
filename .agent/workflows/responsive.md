---
description: Make a page or component responsive across all devices and browsers without changing the design theme.
---

1.  **Read Skill**: Read `.agent/skills/responsive-design/SKILL.md` in full before touching any file.
2.  **Identify Target**: Confirm with the user which page(s) or component(s) to fix (e.g., `Pages/Kegiatan/Index.jsx`).
3.  **Audit Layout**: Open the target file(s). Identify every structural problem:
    -   Fixed `px` widths on containers.
    -   Missing `overflow-x-auto` wrappers on tables.
    -   Non-responsive grid/flex layouts.
    -   Hardcoded heights or margins that conflict with the sidebar offset.
    -   Font sizes without breakpoint prefixes.
4.  **Plan Fixes**: List every change as a bullet — what class is replaced and why. Present to the user before modifying any file.
5.  **Implement**: Apply only structural Tailwind changes (breakpoint prefixes, grid/flex adjustments, overflow wrappers). **Do not change**: colors, font families, spacing tokens, shadows, or any intentional design value.
6.  **Verify via Browser MCP**:
    -   375px (mobile) — no horizontal scroll, all content visible.
    -   768px (tablet) — sidebar toggle works, grid adapts.
    -   1280px (desktop) — full layout with correct sidebar offset.
7.  **Cross-Browser Check**: Flag any properties from the skill's "avoid" list (e.g., `gap` on flex for Safari, `aspect-ratio`). Suggest the safer alternative.
8.  **Report**: Summarize all changes made, breakpoints verified, and any remaining caveats.
