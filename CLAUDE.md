# Moneytracker

## Project Overview

A client-side expense tracking application that helps users categorize and analyze their spending from bank CSV exports. Users upload a CSV on first run, manually categorize transactions, and the app saves those mappings to localStorage so subsequent uploads are categorized automatically.

## What We're Building

- **CSV Upload** — drag & drop or file picker; auto-detects Date, Description, and Amount columns; falls back to a manual column mapper if detection fails
- **Auto-Categorization** — saved description → category mappings are applied on every upload (exact match first, then keyword/substring match)
- **Dashboard** — summary stat cards, horizontal bar chart by category, filterable category pills, and a sortable/searchable transactions table
- **Categorization Panel** — groups uncategorized transactions by description; user picks a category, optionally saves it as a rule, and applies it to all matching transactions at once
- **Persistence** — category mappings stored in `localStorage`; survives page reloads and future CSV uploads

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| CSV parsing | PapaParse 5 |
| Charts | Recharts 2 |
| Deployment | GitHub Pages (`gh-pages` branch) |

## Project Structure

```
src/
  App.jsx                        # Main state, view routing (upload → columnMapping → dashboard)
  main.jsx
  index.css
  components/
    CSVUpload.jsx                # Drag & drop upload screen
    ColumnMapper.jsx             # Manual column mapping when auto-detect fails
    CategorySummary.jsx          # Stat cards + bar chart + category filter pills
    ExpenseList.jsx              # Sortable, searchable transactions table
    CategorizationPanel.jsx      # Uncategorized transaction review & rule creation
  data/
    defaultCategories.js        # 13 default categories + color map
  hooks/
    useCategoryMappings.js      # localStorage-backed category mapping state
  utils/
    csvParser.js                # CSV parsing, column detection, amount normalization
    categoryMatcher.js          # Mapping lookup, bulk apply, category totals
```

## Plans

All approved plans must be saved to `docs/plans/` before implementation begins. Use a short kebab-case filename that describes the feature (e.g. `docs/plans/add-dark-mode.md`).

## After Completing Work

Rebuild the app and redeploy to the `gh-pages` branch so the live site at `https://williehernandez.github.io/Moneytracker/` stays up to date.

```bash
VITE_BASE_URL=/Moneytracker/ npm run build
npx gh-pages -d dist
```

This builds with the correct base path for GitHub Pages and publishes the `dist/` folder to the `gh-pages` branch automatically.
