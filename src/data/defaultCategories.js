export const DEFAULT_CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Shopping',
  'Transportation',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Travel',
  'Personal Care',
  'Education',
  'Income',
  'Transfer',
  'Other',
];

export const CATEGORY_COLORS = {
  'Food & Dining': '#f97316',
  'Groceries': '#84cc16',
  'Shopping': '#ec4899',
  'Transportation': '#3b82f6',
  'Entertainment': '#a855f7',
  'Bills & Utilities': '#14b8a6',
  'Healthcare': '#ef4444',
  'Travel': '#06b6d4',
  'Personal Care': '#f59e0b',
  'Education': '#6366f1',
  'Income': '#22c55e',
  'Transfer': '#94a3b8',
  'Other': '#78716c',
};

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || '#94a3b8';
}
