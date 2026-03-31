# Plan: Category Creation & Management

## Context
Users could only pick from a fixed list of categories when categorizing transactions. This plan added the ability to create custom categories inline and manage them persistently.

> **Note:** The `CategoryManager.jsx` component described here was later replaced by a dedicated Categories page. See `dedicated-categories-page.md` for the current implementation.

---

## What Was Built

### `src/hooks/useCustomCategories.js` (new file)
Persists custom categories in localStorage so they survive page reloads.
- Key: `'expense_custom_categories'`
- Returns: `{ customCategories, addCustomCategory, removeCustomCategory, renameCustomCategory }`

### `src/components/CategorizationPanel.jsx`
- Added inline "＋ Create new category…" option at the bottom of each category dropdown
- When selected: replaces the dropdown with a text input + confirm/cancel for that row
- On confirm: calls `onAddCategory(name)` prop, then auto-selects the new category

### `src/components/CategoryManager.jsx` *(later deleted — see dedicated-categories-page.md)*
A collapsible panel below the dashboard overview showing all categories.
- Custom categories: color dot + name + pencil (rename) + × (delete)
- Default categories: read-only
- Footer: inline "Add Category" input

### `src/App.jsx`
- Replaced in-memory `extraCategories` with `useCustomCategories` hook
- Added `handleAddCategory`, `handleRemoveCategory`, `handleRenameCategory`
- Rendered `<CategoryManager>` between `<CategorySummary>` and `<CategorizationPanel>`

---

## Files Changed
- `src/App.jsx`
- `src/components/CategorizationPanel.jsx`
- `src/components/CategoryManager.jsx` *(created, later deleted)*
- `src/hooks/useCustomCategories.js` *(created, still in use)*
