# Plan: Full CRUD for Manage Categories

## Context
The Manage Categories section already has Create, Read, and Delete for custom categories. The missing operation is **Update (rename)** — users need to be able to rename custom categories in-place. Renaming must propagate to: the persisted category list, any expenses currently tagged with the old name, and any saved mapping rules pointing to the old category name.

## Changes

### 1. `src/hooks/useCustomCategories.js`
Add `renameCustomCategory(oldName, newName)`:
- Replace `oldName` with `newName` in the stored array
- No-op if `newName` already exists or is blank

### 2. `src/hooks/useCategoryMappings.js`
Add `renameMappingsCategory(oldCat, newCat)`:
- Iterate all mapping entries; replace any value `=== oldCat` with `newCat`
- Persist the updated object to localStorage

### 3. `src/components/CategoryManager.jsx`
Add inline rename UX to custom category pills:
- Add a pencil (edit) icon button next to each custom category pill (between the name and the × delete button)
- Clicking it enters edit mode for that pill: replace the pill with a compact text input pre-filled with the current name + a checkmark "Save" button + an "×" Cancel button
- On Save: call `onRenameCategory(oldName, newName)`, then exit edit mode
- Validation: trim whitespace; disable Save if empty or unchanged
- `onRenameCategory(oldName, newName)` added as a new prop

### 4. `src/App.jsx`
- Destructure `renameMappingsCategory` from `useCategoryMappings` (once added)
- Add `handleRenameCategory(oldName, newName)`:
  1. `renameCustomCategory(oldName, newName)`
  2. `renameMappingsCategory(oldName, newName)`
  3. Update expenses: map any `e.category === oldName` → `newName`
- Pass `onRenameCategory={handleRenameCategory}` to `<CategoryManager>`

## Critical Files
- `src/components/CategoryManager.jsx` — edit-mode pill UI
- `src/hooks/useCustomCategories.js` — rename in persisted array
- `src/hooks/useCategoryMappings.js` — rename across saved rules
- `src/App.jsx` — wire up handler, propagate to expenses

## Verification
1. Upload a CSV, assign a custom category to a transaction, save the rule
2. Open Manage Categories, click the pencil on that custom category
3. Rename it → transaction category updates, saved rule updates, pill shows new name
4. Reload page → renamed category still present
5. Default categories have no pencil icon (read-only)
6. Saving an empty or duplicate name is blocked (Save button disabled)
