# SIGAP Test Runner Redesign & Bulk Script Maker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Test Runner dashboard to match SIGAP's professional aesthetic and add a "Bulk Script Maker" to detect and generate local test scripts.

**Architecture:** 
- **Frontend:** Single-file HTML update with Tailwind CSS and Lucide Icons.
- **Backend:** `server.js` enhancement to scan local files and interface with AI for script generation.

**Tech Stack:** HTML5, Tailwind CSS, Lucide Icons, Node.js (Companion Server), Playwright.

---

### Task 1: Setup & Typography
**Files:**
- Modify: `automation-testing/index.html`

- [ ] **Step 1: Add Figtree font and Tailwind CDN**
- [ ] **Step 2: Define Tailwind configuration with SIGAP colors (Cyan/Slate)**
- [ ] **Step 3: Commit setup**

### Task 2: Base Layout & Background
**Files:**
- Modify: `automation-testing/index.html`

- [ ] **Step 1: Apply `bg-slate-50` and professional typography to body**
- [ ] **Step 2: Replace neon gradients with a clean, professional aesthetic**
- [ ] **Step 3: Commit layout**

### Task 3: Header & KPI Statistics
**Files:**
- Modify: `automation-testing/index.html`

- [ ] **Step 1: Redesign Header with cyan gradient title and professional Lucide icons**
- [ ] **Step 2: Redesign KPI Cards as white, shadow-sm containers with color-coded status**
- [ ] **Step 3: Commit header & KPIs**

### Task 4: Script Detection Logic (Backend)
**Files:**
- Modify: `automation-testing/server.js`

- [ ] **Step 1: Add `/api/scripts/status` endpoint**
Scan `playwright/tests/` for files matching `<ID>.spec.js` and return a mapping.
- [ ] **Step 2: Add `/api/scripts/generate` endpoint**
Receive test case details and call AI to generate a Playwright script, saving it locally.
- [ ] **Step 3: Commit server changes**

### Task 5: Table Redesign & Script Status Column
**Files:**
- Modify: `automation-testing/index.html`

- [ ] **Step 1: Add "Script" column to the table**
- [ ] **Step 2: Implement "Script Status" badges**
  - `Tersedia` (Cyan badge): File exists.
  - `Kosong` (Amber badge): File missing.
- [ ] **Step 3: Update row rendering logic to fetch script status from the server**
- [ ] **Step 4: Commit table changes**

### Task 6: Toolbar & Bulk Actions Bar
**Files:**
- Modify: `automation-testing/index.html`

- [ ] **Step 1: Redesign Toolbar with professional grouped buttons and icons**
- [ ] **Step 2: Update Floating Bulk Bar with "Generate AI Scripts" button**
- [ ] **Step 3: Replace all emojis in toolbar/bulk bar with Lucide icons**
- [ ] **Step 4: Commit toolbar changes**

### Task 7: Bulk Script Generation UI/UX
**Files:**
- Modify: `automation-testing/index.html`

- [ ] **Step 1: Implement "Generate AI Scripts" flow**
Show a professional loading state (spinner/progress) while bulk generating.
- [ ] **Step 2: Implement success/error notifications using SIGAP-style toasts**
- [ ] **Step 3: Commit generation UI**

### Task 8: Modals & Final Polish
**Files:**
- Modify: `automation-testing/index.html`

- [ ] **Step 1: Redesign all modals (Import, Editor, Companion) with light theme and professional forms**
- [ ] **Step 2: Final pass to remove ALL emojis from the entire application**
- [ ] **Step 3: Commit final polish**
