# Plan: Export & Import Profile

## Context
Users build up categorization rules (`mappings`) and custom categories (`customCategories`) over time. Currently there's no way to back these up or transfer them to another device/browser. This feature adds a JSON-based profile export (download) and import (merge) from the dashboard header.

---

## Profile JSON Format

```json
{
  "version": "1",
  "exported": "2026-03-29T21:00:00.000Z",
  "mappings": { "starbucks": "Food & Dining", "amazon": "Shopping" },
  "customCategories": ["Pet Care", "Subscriptions"]
}
```

---

## What Gets Exported / Imported

| Data | Source | How |
|------|--------|-----|
| `mappings` | `useCategoryMappings` → `mappings` state | Serialize as-is |
| `customCategories` | `useCustomCategories` → `customCategories` state | Serialize as-is |

**Import behavior: merge** — imported rules are added on top of existing ones (no data is lost). Custom categories are added if not already present (duplicates skipped by existing `addCustomCategory` logic).

---

## Implementation

### Changes to `src/App.jsx` only — no hook changes needed

All needed hook functions already exist:
- **Export**: reads `mappings` + `customCategories` from existing hook state
- **Import**: calls `addMappings(pairs)` (bulk add, already exists) + loops `addCustomCategory(name)` (already de-dupes)

#### 1. Add `useRef` for hidden file input

```jsx
import { useState, useCallback, useRef } from 'react';
// ...
const importInputRef = useRef(null);
```

#### 2. Add `handleExportProfile`

```jsx
const handleExportProfile = useCallback(() => {
  const profile = {
    version: '1',
    exported: new Date().toISOString(),
    mappings,
    customCategories,
  };
  const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `moneytracker-profile-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}, [mappings, customCategories]);
```

#### 3. Add `handleImportProfile`

```jsx
const handleImportProfile = useCallback((e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  e.target.value = '';  // reset so same file can be re-imported

  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const profile = JSON.parse(ev.target.result);
      if (!profile.mappings || typeof profile.mappings !== 'object') {
        alert('Invalid profile file.');
        return;
      }
      // Merge mappings
      const pairs = Object.entries(profile.mappings).map(([description, category]) => ({ description, category }));
      if (pairs.length) addMappings(pairs);
      // Merge custom categories
      (profile.customCategories || []).forEach(addCustomCategory);
    } catch {
      alert('Could not read profile file.');
    }
  };
  reader.readAsText(file);
}, [addMappings, addCustomCategory]);
```

#### 4. Add hidden file input + buttons in header

Place after "Clear Rules" button in the header `<div className="flex items-center gap-2">`:

```jsx
{/* Hidden file input for import */}
<input
  ref={importInputRef}
  type="file"
  accept=".json"
  className="hidden"
  onChange={handleImportProfile}
/>

{/* Export — only when there's something to export */}
{(Object.keys(mappings).length > 0 || customCategories.length > 0) && (
  <button
    onClick={handleExportProfile}
    className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
    title="Export profile as JSON"
  >
    Export Profile
  </button>
)}

{/* Import — always available */}
<button
  onClick={() => importInputRef.current?.click()}
  className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-colors"
  title="Import profile from JSON"
>
  Import Profile
</button>
```

---

## Critical Files

- `src/App.jsx` — only file that needs changes

---

## Verification

1. Run `npm run dev`
2. Upload a CSV, categorize a few transactions with "Save as rule"
3. Click **Export Profile** → verify JSON file downloads with `mappings` and `customCategories`
4. Open the JSON file and confirm the structure matches the format above
5. Clear rules, then click **Import Profile** and select the downloaded JSON
6. Verify the saved rules count badge updates and the rules are restored
7. Upload a CSV again and verify auto-categorization works with the imported rules
