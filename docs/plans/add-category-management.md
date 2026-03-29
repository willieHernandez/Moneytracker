# Plan: Category Creation & Management

## Context
Users can currently only pick from a fixed list of categories when categorizing transactions. They need the ability to create new categories inline (from the dropdown) and manage all categories (add/delete custom ones) in a dedicated section below the overview.

## Changes

### 1. `src/hooks/useCustomCategories.js` (new file)
Persist custom categories in localStorage so they survive page reloads (currently `extraCategories` is in-memory only).
- Key: `'expense_custom_categories'`
- Returns: `{ customCategories, addCustomCategory, removeCustomCategory }`

### 2. `src/components/CategorizationPanel.jsx`
Add a special `"__add_new__"` option at the bottom of each category `<select>`:
```
<option value="__add_new__">＋ Create new category…</option>
```
- When selected: replace the dropdown with an inline text input + confirm/cancel buttons for that row
- On confirm: call a new `onAddCategory(name)` prop, then auto-select the new category for that row
- Remove the existing "+ New Category" header button and the `showNewCat` / `newCategory` state (replaced by inline flow)
- Props change: add `onAddCategory(categoryName)` prop

### 3. `src/components/CategoryManager.jsx` (new file)
A collapsible section showing all categories with management controls.
- Header: "Manage Categories" with a chevron toggle
- Body: grid of category pills, each showing a color swatch + name
  - Default categories: no delete button (read-only)
  - Custom categories: show a × delete button
- Footer: "+ Add Category" inline input row (text input + Add button)
- Props: `categories` (all), `customCategories`, `onAddCategory`, `onRemoveCategory`

### 4. `src/App.jsx`
- Replace `extraCategories` state + its setter with `useCustomCategories` hook
- Add `handleRemoveCategory(name)` — calls `removeCustomCategory(name)`, also strips that category from any expense currently assigned to it (sets to `undefined`)
- Import and render `<CategoryManager>` between `<CategorySummary>` and the `CategorizationPanel` block
- Pass `onAddCategory` to `CategorizationPanel`

## Critical Files
- `src/App.jsx` — state management, layout
- `src/components/CategorizationPanel.jsx` — inline + dropdown creation
- `src/components/CategoryManager.jsx` — new component
- `src/hooks/useCustomCategories.js` — new hook for persistence

## Reuse
- `getCategoryColor()` from `src/data/defaultCategories.js` — use for color swatches in CategoryManager
- `DEFAULT_CATEGORIES` from same file — to distinguish default vs custom

## Verification
1. `npm run dev` — open the app, upload a CSV
2. In the categorization panel dropdown, select "＋ Create new category…" → an input should appear inline → type a name → confirm → the dropdown selects that new category
3. The new category should appear in the Manage Categories section below the overview
4. In Manage Categories: add another category via the input → appears in the list and in all dropdowns
5. Delete a custom category → disappears from list and dropdowns; any transactions assigned to it become uncategorized again
6. Default categories have no delete button
7. Reload the page → custom categories persist
