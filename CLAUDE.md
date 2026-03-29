# Moneytracker

## After completing work

When you finish a task, rebuild the app and redeploy to the `gh-pages` branch so the live site at `https://williehernandez.github.io/Moneytracker/` stays up to date.

```bash
VITE_BASE_URL=/Moneytracker/ npm run build
npx gh-pages -d dist
```

This builds with the correct base path for GitHub Pages and publishes the `dist/` folder to the `gh-pages` branch automatically.
