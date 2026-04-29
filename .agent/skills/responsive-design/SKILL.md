---
description: Responsive design & cross-browser compatibility patterns for SIGAP-Laravel. Triggers: making a page responsive, fixing layout on mobile/tablet, cross-browser fixes, scaling issues.
---

# Responsive Design & Cross-Browser Compatibility

> **Prime Directive**: Make layouts adapt to any screen size and browser without altering colors, typography, spacing tokens, or any intentional design decision. This skill is purely structural — not cosmetic.

---

## 1. Breakpoint Reference (Tailwind v3 Defaults)

The project uses the standard Tailwind CSS v3 breakpoints. Always design **mobile-first** (smallest screen first, then scale up with prefixes).

| Prefix | Min-width | Typical Target           |
|--------|-----------|--------------------------|
| *(none)* | 0px     | Mobile (≤ 639px)         |
| `sm:`  | 640px     | Large phones / landscape |
| `md:`  | 768px     | Tablets (portrait)       |
| `lg:`  | 1024px    | Tablets (landscape) / Desktop |
| `xl:`  | 1280px    | Large desktop            |
| `2xl:` | 1536px    | Extra-large screens      |

**Rule**: Never use fixed `px` widths on containers. Prefer `w-full`, `max-w-*`, and responsive fractions (`w-1/2`, `md:w-1/3`).

---

## 2. Layout Patterns

### 2.1 The Standard Page Wrapper
Every page content area must use this wrapper to ensure consistent max-width and horizontal padding on all screen sizes:
```jsx
// ✅ Correct — contained, padded, centered
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {children}
</div>
```

### 2.2 Responsive Grid (Data Cards / Stats Panels)
Use a single-column grid on mobile that expands on larger screens:
```jsx
// 1 col → 2 col → 3 col
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
    ...
</div>
```

### 2.3 Responsive Tables
Tables break on small screens. Wrap ALL `<table>` elements in an overflow container:
```jsx
<div className="overflow-x-auto rounded-xl">
    <table className="min-w-full divide-y divide-slate-200">
        ...
    </table>
</div>
```
- Use `whitespace-nowrap` on cells that must not wrap.
- Consider hiding non-critical columns on mobile: `hidden md:table-cell`.

### 2.4 Sidebar-Aware Main Content
The `AuthenticatedLayout` already shifts content via `lg:ml-[80px]` / `lg:ml-[280px]`. Pages inside it **must not** set their own left margin or offset — the layout handles it. Only add horizontal padding via the standard wrapper above.

### 2.5 Stacked Form Layouts
Forms should stack vertically on mobile and go side-by-side on larger screens:
```jsx
// Side-by-side on md+, stacked on mobile
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>...</div>
    <div>...</div>
</div>
```

---

## 3. Typography Scaling

Never use absolute font sizes. Use responsive Tailwind text utilities:
```jsx
// ✅ Correct — scales across breakpoints
<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">
    Page Title
</h1>

<p className="text-sm sm:text-base text-slate-500">
    Supporting text
</p>
```

---

## 4. Image & Asset Scaling

- Always set `w-full h-auto` on images that should scale with their container.
- For background images (like the project's `BG.png`), `bg-cover bg-center bg-fixed` is already applied in `AuthenticatedLayout`. **Do not override these**.
- For icons (Lucide), use responsive sizes: `size={20}` on mobile, or use `className="w-4 h-4 sm:w-5 sm:h-5"`.

---

## 5. Touch & Interactive Targets

All interactive elements (buttons, links, nav items) must have a minimum touch target of **44×44px** on mobile per WCAG guidelines:
```jsx
// ✅ Ensure padding makes the target large enough
<button className="p-2 sm:p-3 ...">
    <Icon size={20} />
</button>
```

---

## 6. Cross-Browser Compatibility Rules

### 6.1 CSS Properties to Avoid (or Use with Caution)
| Property | Issue | Safer Alternative |
|---|---|---|
| `gap` on flex (Safari < 14.1) | Not supported | Use `space-x-*` / `space-y-*` or update gap polyfill |
| `aspect-ratio` (Safari < 15) | Partial support | Use `pb-[56.25%] relative` padding trick if needed |
| `position: sticky` in Safari | Needs `-webkit-sticky` | Use `sticky` — Tailwind adds the prefix automatically |
| CSS Grid subgrid | Limited support | Avoid until broadly supported |
| `dvh` / `svh` / `lvh` units | Modern only | Use `min-h-screen` (Tailwind) which maps to `min-height: 100vh` |

### 6.2 Autoprefixer
The project uses Vite + PostCSS. **Autoprefixer is active** — you do not need to manually write vendor prefixes like `-webkit-`. Always write standard CSS/Tailwind and let the toolchain handle it.

### 6.3 Safe Font Stack
The project font is `Figtree` (Google Fonts). It is declared in `tailwind.config.js` with a fallback sans-serif stack. Never override `font-family` inline on components — the global `font-sans` class inherits the full safe stack automatically.

### 6.4 Form Element Normalization
The project uses `@tailwindcss/forms` plugin which normalizes form elements across browsers. Always use the `TextInput`, `Checkbox`, and `CustomSelect` shared components — they inherit these normalized styles.

---

## 7. Verification Checklist (Before Marking a Page as Done)

After making any layout change, verify responsiveness visually via the Browser MCP tool at each key breakpoint. Use browser DevTools device emulation to test:

- [ ] **Mobile** (375px – e.g., iPhone SE): No horizontal scroll, all content visible, touch targets reachable.
- [ ] **Tablet** (768px – e.g., iPad): Sidebar toggles correctly, grid adapts.
- [ ] **Desktop** (1280px): Full layout with expanded sidebar, no overflow.
- [ ] **Check in**: Chrome, Firefox, Safari (if available) — especially for flex/grid behaviors.

---

## 8. Anti-Patterns to Avoid

- ❌ **Fixed pixel widths on containers**: `w-[600px]` — this breaks on smaller screens.
- ❌ **Overriding layout margins**: Adding `ml-[280px]` inside a page — the layout already handles this.
- ❌ **Changing theme colors for "mobile fixes"**: Responsiveness is structural; never swap color tokens.
- ❌ **`overflow: hidden` on the root layout**: Breaks sticky positioning.
- ❌ **Viewport-specific CSS files**: All responsive logic must use Tailwind breakpoint prefixes, not media query overrides in separate `.css` files.
- ❌ **Hardcoded `height`**: Use `min-h-*` and let content drive height naturally.
- ❌ **`!important` overrides**: Almost always a sign of a structural problem upstream; fix the root cause.
