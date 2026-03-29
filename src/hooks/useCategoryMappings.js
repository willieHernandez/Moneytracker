import { useState, useCallback } from 'react';

const STORAGE_KEY = 'expense_category_mappings';

export function useCategoryMappings() {
  const [mappings, setMappings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  });

  const save = (updated) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setMappings(updated);
  };

  /** Add a single description → category mapping */
  const addMapping = useCallback((description, category) => {
    setMappings((prev) => {
      const updated = { ...prev, [description.toLowerCase().trim()]: category };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  /** Add multiple {description, category} pairs at once */
  const addMappings = useCallback((pairs) => {
    setMappings((prev) => {
      const updated = { ...prev };
      for (const { description, category } of pairs) {
        updated[description.toLowerCase().trim()] = category;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  /** Remove a single mapping */
  const removeMapping = useCallback((description) => {
    setMappings((prev) => {
      const updated = { ...prev };
      delete updated[description.toLowerCase().trim()];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  /** Rename all mapping values from oldCategory to newCategory */
  const renameMappingsCategory = useCallback((oldCategory, newCategory) => {
    setMappings((prev) => {
      const updated = {};
      for (const [desc, cat] of Object.entries(prev)) {
        updated[desc] = cat === oldCategory ? newCategory : cat;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  /** Wipe all saved mappings */
  const clearMappings = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setMappings({});
  }, []);

  return { mappings, addMapping, addMappings, removeMapping, renameMappingsCategory, clearMappings };
}
