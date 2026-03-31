import { useState, useCallback } from 'react';

const STORAGE_KEY = 'expense_budgets';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function useBudgets() {
  const [budgets, setBudgetsState] = useState(load);

  const setBudget = useCallback((category, amount) => {
    setBudgetsState((prev) => {
      const updated = { ...prev, [category]: amount };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeBudget = useCallback((category) => {
    setBudgetsState((prev) => {
      const updated = { ...prev };
      delete updated[category];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { budgets, setBudget, removeBudget };
}
