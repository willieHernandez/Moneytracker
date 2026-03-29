import { useState } from 'react';
import { DEFAULT_CATEGORIES } from '../data/defaultCategories';

const ADD_NEW_VALUE = '__add_new__';

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(n));
}

export default function CategorizationPanel({ uncategorized, categories, onCategorize, onCategorizeAll, onAddCategory }) {
  const [selections, setSelections] = useState({});
  const [saveAsRule, setSaveAsRule] = useState({});
  // Per-row "add new" state: { [description]: inputValue | null }
  const [addingFor, setAddingFor] = useState({});

  const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...categories])].sort();

  const handleSelectChange = (description, value) => {
    if (value === ADD_NEW_VALUE) {
      // Show inline input for this row, clear the selection
      setAddingFor((s) => ({ ...s, [description]: '' }));
      setSelections((s) => { const c = { ...s }; delete c[description]; return c; });
    } else {
      setSelections((s) => ({ ...s, [description]: value }));
      setAddingFor((s) => { const c = { ...s }; delete c[description]; return c; });
    }
  };

  const handleConfirmNew = (description) => {
    const name = (addingFor[description] || '').trim();
    if (!name) return;
    onAddCategory(name);
    // Auto-select the new category for this row
    setSelections((s) => ({ ...s, [description]: name }));
    setAddingFor((s) => { const c = { ...s }; delete c[description]; return c; });
  };

  const handleCancelNew = (description) => {
    setAddingFor((s) => { const c = { ...s }; delete c[description]; return c; });
  };

  const handleApply = (description) => {
    const category = selections[description];
    if (!category) return;
    const shouldSave = saveAsRule[description] !== false;
    onCategorizeAll(description, category, shouldSave);
    setSelections((s) => { const c = { ...s }; delete c[description]; return c; });
  };

  const handleApplyAll = () => {
    const pairs = Object.entries(selections)
      .filter(([, cat]) => cat)
      .map(([desc, cat]) => ({
        description: desc,
        category: cat,
        saveRule: saveAsRule[desc] !== false,
      }));
    if (pairs.length === 0) return;
    for (const { description, category, saveRule } of pairs) {
      onCategorizeAll(description, category, saveRule);
    }
    setSelections({});
  };

  const pendingCount = Object.values(selections).filter(Boolean).length;

  // Group by description
  const grouped = uncategorized.reduce((acc, expense) => {
    const key = expense.description;
    if (!acc[key]) acc[key] = [];
    acc[key].push(expense);
    return acc;
  }, {});

  if (uncategorized.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-sm font-semibold text-amber-800">
            Needs Categorization
            <span className="ml-1.5 font-normal text-amber-600">({uncategorized.length})</span>
          </h3>
        </div>
        {pendingCount > 0 && (
          <button
            onClick={handleApplyAll}
            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Apply All ({pendingCount})
          </button>
        )}
      </div>

      {/* Grouped rows */}
      <div className="divide-y divide-gray-100">
        {Object.entries(grouped).map(([description, expenses]) => {
          const isAddingNew = description in addingFor;
          return (
            <div key={description} className="px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              {/* Description + meta */}
              <div className="flex-1 min-w-0 flex sm:block items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate" title={description}>{description}</p>
                  <p className="text-xs text-gray-400">
                    {expenses.length} transaction{expenses.length !== 1 ? 's' : ''} ·{' '}
                    {formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))} total
                  </p>
                </div>
                {/* Save rule on mobile */}
                <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer whitespace-nowrap flex-shrink-0 sm:hidden">
                  <input
                    type="checkbox"
                    checked={saveAsRule[description] !== false}
                    onChange={(e) => setSaveAsRule((s) => ({ ...s, [description]: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Save rule
                </label>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Save rule — desktop */}
                <label className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer whitespace-nowrap flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={saveAsRule[description] !== false}
                    onChange={(e) => setSaveAsRule((s) => ({ ...s, [description]: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Save rule
                </label>

                {isAddingNew ? (
                  /* Inline new category input */
                  <>
                    <input
                      type="text"
                      placeholder="Category name…"
                      value={addingFor[description]}
                      onChange={(e) => setAddingFor((s) => ({ ...s, [description]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirmNew(description);
                        if (e.key === 'Escape') handleCancelNew(description);
                      }}
                      className="flex-1 sm:w-44 sm:flex-none border border-blue-400 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleConfirmNew(description)}
                      disabled={!(addingFor[description] || '').trim()}
                      className="px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors font-medium flex-shrink-0"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => handleCancelNew(description)}
                      className="px-2 py-2 text-xs text-gray-500 hover:text-gray-700 flex-shrink-0"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  /* Normal dropdown */
                  <>
                    <select
                      value={selections[description] || ''}
                      onChange={(e) => handleSelectChange(description, e.target.value)}
                      className="flex-1 sm:flex-none sm:w-44 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select category…</option>
                      {allCategories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option disabled>──────────</option>
                      <option value={ADD_NEW_VALUE}>＋ Create new category…</option>
                    </select>

                    <button
                      onClick={() => handleApply(description)}
                      disabled={!selections[description]}
                      className="px-4 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium flex-shrink-0"
                    >
                      Apply
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
