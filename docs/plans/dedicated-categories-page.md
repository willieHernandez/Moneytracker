# Plan: Dedicated Categories Page

## Context
Category management originally lived inside a collapsible `CategoryManager` panel embedded in the dashboard. This was replaced with a dedicated full-page UI accessible via a tab in the header, making CRUD operations easier to find — especially on mobile where hover-based reveal patterns don't work.

---

## What Was Built

### Routing
Added `'categories'` as a 4th view to the existing state machine in `App.jsx`:
```
view: 'upload' | 'columnMapping' | 'dashboard' | 'categories'
```

### Tab Navigation
The sticky header now renders a second row with **Dashboard** and **Categories** tabs (underline indicator style). The tab row appears whenever `view` is `'dashboard'` or `'categories'`. The header JSX was extracted into an `appHeader` variable shared by both view branches.

### `src/components/CategoriesPage.jsx` (new file)
Full-page category management with two sections:

**Custom Categories section (top)**
- "Add Custom Category" input + Add button always visible
- Table: color dot | Name | Transactions | Total Spent | Rules | Actions
- **Rename** and **Delete** buttons always visible (not hover-only) — required for mobile
- Inline rename: input replaces the name cell with Save / Cancel text buttons
- Empty state when no custom categories exist

**Default Categories section (below)**
- Same table columns and action buttons as Custom
- Badge shows `X of 13` to indicate how many defaults are still active
- Empty state when all defaults have been removed

**Usage stats** — Transactions and Total Spent columns are derived from the `expenses` prop. Show `—` when no CSV is loaded.

**Mapping rule count** — derived from `Object.values(mappings)`, showing how many saved auto-categorization rules point to each category.

### `src/App.jsx`
- Replaced `import CategoryManager` with `import CategoriesPage`
- Passes `activeDefaults` (pre-filtered `DEFAULT_CATEGORIES`) as a prop so the page doesn't need to re-derive hidden defaults itself
- Removed `<CategoryManager>` from the dashboard `<main>` block

### `src/components/CategoryManager.jsx`
Deleted — all functionality moved to `CategoriesPage`.

---

## Mobile-First Design Decisions
- Action buttons (Rename, Delete) are always visible with text labels — never hidden behind hover
- Table uses `overflow-x-auto` with `min-w-[600px]` so it scrolls horizontally on small screens rather than clipping
- Inline edit controls use text buttons ("Save" / "Cancel") instead of small icon buttons for easier tapping

---

## Files Changed
- `src/App.jsx` — routing, header extraction, tab nav, prop wiring
- `src/components/CategoriesPage.jsx` *(created)*
- `src/components/CategoryManager.jsx` *(deleted)*
