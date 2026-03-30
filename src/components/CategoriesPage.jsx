import { useState } from 'react';
import { DEFAULT_CATEGORIES, getCategoryColor } from '../data/defaultCategories';

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function CategoriesPage({
  customCategories,
  expenses,
  mappings,
  onAddCategory,
  onRemoveCategory,
  onRenameCategory,
}) {
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState({});

  const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...customCategories])].sort();

  const expenseStats = expenses.reduce((acc, e) => {
    if (!e.category) return acc;
    if (!acc[e.category]) acc[e.category] = { count: 0, total: 0 };
    acc[e.category].count += 1;
    acc[e.category].total += Math.abs(e.amount);
    return acc;
  }, {});

  const mappingCounts = Object.values(mappings).reduce((acc, cat) => {
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAddCategory(trimmed);
    setNewName('');
  };

  const startEdit = (cat) => setEditing((s) => ({ ...s, [cat]: cat }));
  const cancelEdit = (cat) => setEditing((s) => { const c = { ...s }; delete c[cat]; return c; });
  const confirmEdit = (oldName) => {
    const newVal = (editing[oldName] || '').trim();
    if (!newVal || newVal === oldName) { cancelEdit(oldName); return; }
    onRenameCategory(oldName, newVal);
    setEditing((s) => { const c = { ...s }; delete c[oldName]; return c; });
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Categories</h2>
          <p className="text-sm text-gray-500 mt-0.5">{allCategories.length} total &mdash; {DEFAULT_CATEGORIES.length} default, {customCategories.length} custom</p>
        </div>
      </div>

      {/* Add category */}
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Custom Category</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="New category name…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim() || allCategories.includes(newName.trim())}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Category table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-8"></th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Transactions</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Spent</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Rules</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {allCategories.map((cat) => {
              const isCustom = !DEFAULT_CATEGORIES.includes(cat);
              const color = getCategoryColor(cat);
              const isEditing = cat in editing;
              const stats = expenseStats[cat] || { count: 0, total: 0 };
              const ruleCount = mappingCounts[cat] || 0;

              return (
                <tr key={cat} className="hover:bg-gray-50 transition-colors group">
                  {/* Color dot */}
                  <td className="px-5 py-3.5">
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{ backgroundColor: color }}
                    />
                  </td>

                  {/* Name (or inline edit) */}
                  <td className="px-4 py-3.5 font-medium text-gray-800">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editing[cat]}
                          onChange={(e) => setEditing((s) => ({ ...s, [cat]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') confirmEdit(cat);
                            if (e.key === 'Escape') cancelEdit(cat);
                          }}
                          className="border border-blue-400 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
                          autoFocus
                        />
                        {/* Save */}
                        <button
                          onClick={() => confirmEdit(cat)}
                          disabled={
                            !(editing[cat] || '').trim() ||
                            editing[cat].trim() === cat ||
                            (allCategories.includes(editing[cat].trim()) && editing[cat].trim() !== cat)
                          }
                          className="w-6 h-6 flex items-center justify-center rounded text-blue-600 hover:bg-blue-100 disabled:opacity-30 transition-colors"
                          title="Save"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        {/* Cancel */}
                        <button
                          onClick={() => cancelEdit(cat)}
                          className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 transition-colors"
                          title="Cancel"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      cat
                    )}
                  </td>

                  {/* Type badge */}
                  <td className="px-4 py-3.5">
                    {isCustom ? (
                      <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-blue-50 text-blue-600">Custom</span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-gray-100 text-gray-500">Default</span>
                    )}
                  </td>

                  {/* Transactions */}
                  <td className="px-4 py-3.5 text-right text-gray-600">
                    {stats.count > 0 ? stats.count.toLocaleString() : <span className="text-gray-300">—</span>}
                  </td>

                  {/* Total Spent */}
                  <td className="px-4 py-3.5 text-right text-gray-600">
                    {stats.total > 0 ? fmt(stats.total) : <span className="text-gray-300">—</span>}
                  </td>

                  {/* Rules */}
                  <td className="px-4 py-3.5 text-right text-gray-600">
                    {ruleCount > 0 ? ruleCount : <span className="text-gray-300">—</span>}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right">
                    {isCustom && !isEditing && (
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(cat)}
                          className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                          title={`Rename "${cat}"`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Remove "${cat}"? Any transactions using it will become uncategorized.`)) {
                              onRemoveCategory(cat);
                            }
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title={`Remove "${cat}"`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
