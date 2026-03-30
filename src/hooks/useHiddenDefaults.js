import { useState } from 'react';

const STORAGE_KEY = 'expense_hidden_defaults';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

export function useHiddenDefaults() {
  const [hiddenDefaults, setHiddenDefaults] = useState(load);

  const hideDefault = (name) => {
    setHiddenDefaults((prev) => {
      if (prev.includes(name)) return prev;
      const next = [...prev, name];
      save(next);
      return next;
    });
  };

  return { hiddenDefaults, hideDefault };
}
