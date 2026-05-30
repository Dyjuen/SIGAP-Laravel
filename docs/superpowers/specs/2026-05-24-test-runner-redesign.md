# Design Spec: SIGAP Test Runner Redesign

## Goal
Redesign the SIGAP Test Runner dashboard to align with the SIGAP Master Design (Laravel + Inertia/React aesthetic). Replace the current "gamer/dark" look with a professional, clean, light-themed interface. Remove all unnecessary emojis and use professional SVG icons.

## Visual Identity (SIGAP Master Design)
- **Primary Font:** `Figtree` (Google Fonts).
- **Secondary Font:** `JetBrains Mono` (for code snippets).
- **Primary Color:** Cyan Gradient (`#33C8DA` to `#2BA9B8`).
- **Background Color:** `bg-[#F8FAFC]` (Slate-50).
- **Border Color:** `border-[#E2E8F0]` (Slate-200).
- **Cards:** White background, `rounded-[20px]`, `shadow-sm`.
- **Icons:** Lucide SVG icons (no emojis).

## Layout Structure

### 1. Hero Header
- **Background:** Clean white with subtle cyan accent or gradient text.
- **Title:** "SIGAP Test Runner" in cyan gradient text.
- **Description:** Professional summary text in `slate-500`.
- **Actions:** "Bulk Import" and "Jalankan Auto Test" buttons.

### 2. KPI Statistics
- **Grid:** 4-5 cards showing:
  - Total Skenario
  - Lulus (Pass)
  - Gagal (Fail)
  - Dilewati (Skip)
  - Belum Diuji (Pending)
- **Style:** Minimalist white cards with color-coded left borders or subtle backgrounds.

### 3. Toolbar
- **Search:** Clean input with icon.
- **Filters:** Professional dropdowns.
- **Action Buttons:** Grouped buttons for "Reset", "Ekspor CSV", "Copy", "Clear".

### 4. Main Table
- **Header:** Sticky header with `bg-slate-50`.
- **Rows:** Zebra striping or clean border separators.
- **Status Badges:** Rounded badges with soft colors (e.g., `bg-green-50 text-green-600` for Pass).
- **Action Icons:** Edit/Delete icons without emojis.

### 5. Modals
- **Backdrop:** `backdrop-blur-md` with `bg-slate-900/40`.
- **Content:** White background, large padding, clean form elements.

## Technical Changes
- Replace embedded CSS with a more structured approach or a mini-Tailwind configuration.
- Update `automation-testing/index.html` to use the new styles.
- Replace all emojis (`📝`, `💾`, `⚡`, etc.) with Lucide `data-lucide` equivalents.
- Ensure all Indonesian text is preserved.

## Success Criteria
- Dashboard looks like a native part of the SIGAP system.
- No emojis present in the UI.
- All functional features (Import, Run, Export) remain working.
- Responsive across standard screen sizes.
