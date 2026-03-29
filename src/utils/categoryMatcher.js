/**
 * Attempt to find a category for a description using saved mappings.
 * Tries exact match first, then keyword/substring match.
 */
export function matchCategory(description, mappings) {
  if (!description || !mappings || Object.keys(mappings).length === 0) return null;
  const norm = description.toLowerCase().trim();

  // 1. Exact match
  if (mappings[norm]) return mappings[norm];

  // 2. Keyword match: check if a saved key appears in the description
  for (const [key, category] of Object.entries(mappings)) {
    if (norm.includes(key)) {
      return category;
    }
  }

  return null;
}

export function applyMappings(expenses, mappings) {
  return expenses.map((expense) => ({
    ...expense,
    category: matchCategory(expense.description, mappings),
  }));
}

export function groupByCategory(expenses) {
  const groups = {};
  for (const expense of expenses) {
    const cat = expense.category || 'Uncategorized';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(expense);
  }
  return groups;
}

export function getCategoryTotals(expenses) {
  const groups = groupByCategory(expenses);
  return Object.entries(groups)
    .map(([category, items]) => ({
      category,
      total: items.reduce((sum, e) => sum + Math.abs(e.amount), 0),
      count: items.length,
    }))
    .sort((a, b) => b.total - a.total);
}
