import { useState } from 'react';
import { getCategoryColor } from '../data/defaultCategories';

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export default function BudgetManager({ budgets, allCategories, onSetBudget, onRemoveBudget }) {
  const [open, setOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState('');
  const [inputAmount, setInputAmount] = useState('');
  const [editingCat, setEditingCat] = useState(null); // category name being edited
  const [editAmount, setEditAmount] = useState('');

  const budgetEntries = Object.entries(budgets).sort(([a], [b]) => a.localeCompare(b));
  const unbudgetedCategories = allCategories.filter((c) => !(c in budgets));

  const handleAdd = () => {
    const amount = parseFloat(inputAmount);
    if (!selectedCat || isNaN(amount) || amount <= 0) return;
    onSetBudget(selectedCat, amount);
    setSelectedCat('');
    setInputAmount('');
  };

  const startEdit = (cat) => {
    setEditingCat(cat);
    setEditAmount(String(budgets[cat]));
  };

  const confirmEdit = (cat) => {
    const amount = parseFloat(editAmount);
    if (!isNaN(amount) && amount > 0) {
      onSetBudget(cat, amount);
    }
    setEditingCat(null);
    setEditAmount('');
  };

  const cancelEdit = () => {
    setEditingCat(null);
    setEditAmount('');
  };

  const count = budgetEntries.length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header / toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">Monthly Budgets</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {count > 0 ? `${count} budget${count !== 1 ? 's' : ''}` : 'Set budgets'}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4">
          {/* Existing budgets */}
          {budgetEntries.length > 0 && (
            <div className="space-y-2">
              {budgetEntries.map(([cat, amount]) => {
                const color = getCategoryColor(cat);
                const isEditing = editingCat === cat;

                return (
                  <div key={cat} className="flex items-center gap-2 group">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="flex-1 text-sm text-gray-700 truncate">{cat}</span>

                    {isEditing ? (
                      <>
                        <span className="text-xs text-gray-400">$</span>
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') confirmEdit(cat);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          className="w-20 border border-blue-400 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          autoFocus
                          min="1"
                        />
                        <button
                          onClick={() => confirmEdit(cat)}
                          className="w-5 h-5 flex items-center justify-center rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Save"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
                          title="Cancel"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-gray-600">{formatCurrency(amount)}</span>
                        <button
                          onClick={() => startEdit(cat)}
                          className="w-5 h-5 flex items-center justify-center rounded-full text-gray-300 hover:bg-blue-100 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100"
                          title={`Edit budget for ${cat}`}
                        >
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onRemoveBudget(cat)}
                          className="w-5 h-5 flex items-center justify-center rounded-full text-gray-300 hover:bg-red-100 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          title={`Remove budget for ${cat}`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add new budget */}
          {unbudgetedCategories.length > 0 && (
            <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              >
                <option value="">Select category…</option>
                {unbudgetedCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <span className="text-xs text-gray-400">$</span>
              <input
                type="number"
                placeholder="Amount"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
              <button
                onClick={handleAdd}
                disabled={!selectedCat || !inputAmount || parseFloat(inputAmount) <= 0}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Add
              </button>
            </div>
          )}

          {budgetEntries.length === 0 && unbudgetedCategories.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">All categories have budgets set.</p>
          )}
        </div>
      )}
    </div>
  );
}
