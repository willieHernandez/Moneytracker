# Plan: Full CRUD for Category Management

## Context
Category management initially only supported Create, Read, and Delete for custom categories. This plan added **rename (Update)** for custom categories, and was later extended to give **full CRUD to default categories** as well — so users can rename or delete any category, not just ones they created.

> **Note:** The UI described here originally lived in `CategoryManager.jsx` (a collapsible panel). That component was replaced by the dedicated `CategoriesPage`. See `dedicated-categories-page.md` for the current UI implementation.

---

## What Was Built

### `src/hooks/useCustomCategories.js`
Added `renameCustomCategory(oldName, newName)`:
- Replaces `oldName` with `newName` in the stored array
- No-ops if `newName` already exists or is blank

### `src/hooks/useCategoryMappings.js`
Added `renameMappingsCategory(oldCat, newCat)`:
- Iterates all mapping entries and replaces any value `=== oldCat` with `newCat`
- Persists the updated object to localStorage

### `src/hooks/useHiddenDefaults.js` (new file)
Tracks which default categories have been hidden/deleted by the user.
- Key: `'expense_hidden_defaults'`
- Returns: `{ hiddenDefaults, hideDefault }`
- Deletions persist across sessions; removed defaults stay gone until a profile import restores them

### `src/App.jsx`
- Wires up `handleRenameCategory(oldName, newName)`:
  1. If it's a **default** category: calls `hideDefault(oldName)` + `addCustomCategory(newName)`
  2. If it's a **custom** category: calls `renameCustomCategory(oldName, newName)`
  3. Calls `renameMappingsCategory(oldName, newName)` in both cases
  4. Updates all loaded expenses: maps `e.category === oldName` → `newName`
- Wires up `handleRemoveCategory(name)`:
  1. If it's a **default**: calls `hideDefault(name)`
  2. If it's a **custom**: calls `removeCustomCategory(name)`
  3. Uncategorizes any loaded expenses that used the deleted category
- `allCategories` derived by filtering `DEFAULT_CATEGORIES` against `hiddenDefaults`, then merging with `customCategories`

---

## Behavior Summary

| Operation | Custom Category | Default Category |
|-----------|----------------|-----------------|
| **Add** | Added to `customCategories` in localStorage | N/A (use Add form) |
| **Rename** | Updated in `customCategories` array | Hidden original + added as custom; rules/expenses cascade |
| **Delete** | Removed from `customCategories` array | Added to `hiddenDefaults` in localStorage |

---

## Files Changed
- `src/App.jsx`
- `src/hooks/useCustomCategories.js`
- `src/hooks/useCategoryMappings.js`
- `src/hooks/useHiddenDefaults.js` *(created)*
- `src/components/CategoriesPage.jsx` *(UI — see dedicated-categories-page.md)*
