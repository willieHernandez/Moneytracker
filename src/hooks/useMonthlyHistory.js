import { useState, useCallback } from 'react';

const STORAGE_KEY = 'expense_monthly_history';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useMonthlyHistory() {
  const [history, setHistory] = useState(load);

  const saveSnapshot = useCallback((snapshot) => {
    setHistory((prev) => {
      const entry = {
        ...snapshot,
        id: Date.now().toString(),
        savedAt: new Date().toISOString(),
      };
      const updated = [entry, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteSnapshot = useCallback((id) => {
    setHistory((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { history, saveSnapshot, deleteSnapshot };
}
