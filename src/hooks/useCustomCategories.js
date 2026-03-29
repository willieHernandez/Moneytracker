import { useState } from 'react';

const STORAGE_KEY = 'expense_custom_categories';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(categories) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

export function useCustomCategories() {
  const [customCategories, setCustomCategories] = useState(load);

  const addCustomCategory = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCustomCategories((prev) => {
      if (prev.includes(trimmed)) return prev;
      const next = [...prev, trimmed];
      save(next);
      return next;
    });
  };

  const removeCustomCategory = (name) => {
    setCustomCategories((prev) => {
      const next = prev.filter((c) => c !== name);
      save(next);
      return next;
    });
  };

  const renameCustomCategory = (oldName, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setCustomCategories((prev) => {
      if (prev.includes(trimmed)) return prev;
      const next = prev.map((c) => (c === oldName ? trimmed : c));
      save(next);
      return next;
    });
  };

  return { customCategories, addCustomCategory, removeCustomCategory, renameCustomCategory };
}
