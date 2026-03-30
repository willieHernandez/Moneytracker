# Plan: User Profile, Auth, Budget Limits & Monthly History

## Context
The app has no identity or persistence beyond category rules. This plan adds a password-gated profile, per-category budget limits with visual progress bars, and the ability to save & compare spending snapshots over time. All storage stays in localStorage/sessionStorage; no backend required.

## New Files

| File | Purpose |
|---|---|
| `src/hooks/useAuth.js` | Auth state — localStorage for credentials, sessionStorage for session |
| `src/components/AuthScreen.jsx` | Full-page login / create-password screen |
| `src/hooks/useBudgets.js` | localStorage key `expense_budgets` → `{ [category]: number }` |
| `src/hooks/useMonthlyHistory.js` | localStorage key `expense_monthly_history` → `SnapshotObject[]` |
| `src/utils/snapshotUtils.js` | Pure fn `generateSnapshotLabel(expenses)` → `{ label, dateRange }` |
| `src/components/BudgetManager.jsx` | Collapsible panel — set/edit/remove budget per category |
| `src/components/MonthlyHistory.jsx` | Collapsible panel — list saved snapshots with delete |

## Modified Files
- `src/App.jsx` — wire all new hooks, add auth gate, snapshot button, new layout order
- `src/components/CategorySummary.jsx` — add `budgets` prop + progress bars after chart

## Auth Design
- localStorage: `expense_auth` → `{ username, passwordHash }` (SHA-256 via Web Crypto API)
- sessionStorage: `expense_session` → `'1'` (persists for tab lifetime)
- Username doubles as the profile name shown in the header
- "Forgot password / Delete account" wipes all localStorage keys

## Dashboard Layout
```
CategorySummary (+ budget progress bars)
CategoryManager
BudgetManager        ← new
MonthlyHistory       ← new
CategorizationPanel  (conditional)
ExpenseList
```
