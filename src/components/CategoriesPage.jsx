import { useState } from 'react';
import { DEFAULT_CATEGORIES, getCategoryColor } from '../data/defaultCategories';

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

function CategoryRow({ cat, isEditing, editingVal, stats, ruleCount, onStartEdit, onCancelEdit, onConfirmEdit, onSetEditing, onRemove, allCategories, confirmLabel }) {
  const color = getCategoryColor(cat);

  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="px-4 py-3.5">
        <span className="w-3 h-3 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: color }} />
      </td>

      <td className="px-4 py-3.5 font-medium text-gray-800">
        {isEditing ? (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={editingVal}
              onChange={(e) => onSetEditing(cat, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onConfirmEdit(cat);
                if (e.key === 'Escape') onCancelEdit(cat);
              }}
              className="border border-blue-400 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
              autoFocus
            />
            <button
              onClick={() => onConfirmEdit(cat)}
              disabled={!editingVal.trim() || editingVal.trim() === cat || (allCategories.includes(editingVal.trim()) && editingVal.trim() !== cat)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-30 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => onCancelEdit(cat)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          cat
        )}
      </td>

      <td className="px-4 py-3.5 text-right text-gray-600 text-sm">
        {stats.count > 0 ? stats.count.toLocaleString() : <span className="text-gray-300">—</span>}
      </td>

      <td className="px-4 py-3.5 text-right text-gray-600 text-sm">
        {stats.total > 0 ? fmt(stats.total) : <span className="text-gray-300">—</span>}
      </td>

      <td className="px-4 py-3.5 text-right text-gray-600 text-sm">
        {ruleCount > 0 ? ruleCount : <span className="text-gray-300">—</span>}
      </td>

      <td className="px-4 py-3.5">
        {!isEditing && (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => onStartEdit(cat)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Rename
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Remove "${cat}"? Transactions using it will become uncategorized.`)) {
                  onRemove(cat);
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

function CategoryTable({ categories, editing, onStartEdit, onCancelEdit, onConfirmEdit, onSetEditing, onRemove, expenseStats, mappingCounts, allCategories }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm min-w-[600px]">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 w-8"></th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Transactions</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Spent</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Rules</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <CategoryRow
              key={cat}
              cat={cat}
              isEditing={cat in editing}
              editingVal={editing[cat] || ''}
              stats={expenseStats[cat] || { count: 0, total: 0 }}
              ruleCount={mappingCounts[cat] || 0}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
              onConfirmEdit={onConfirmEdit}
              onSetEditing={onSetEditing}
              onRemove={onRemove}
              allCategories={allCategories}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CategoriesPage({
  customCategories,
  activeDefaults,
  expenses,
  mappings,
  onAddCategory,
  onRemoveCategory,
  onRenameCategory,
}) {
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState({});

  const sortedCustom = [...customCategories].sort();
  const sortedDefaults = [...activeDefaults].sort();
  const allCategories = [...new Set([...activeDefaults, ...customCategories])].sort();

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
  const setEditingValue = (cat, val) => setEditing((s) => ({ ...s, [cat]: val }));
  const confirmEdit = (oldName) => {
    const newVal = (editing[oldName] || '').trim();
    if (!newVal || newVal === oldName) { cancelEdit(oldName); return; }
    onRenameCategory(oldName, newVal);
    setEditing((s) => { const c = { ...s }; delete c[oldName]; return c; });
  };

  const tableProps = { editing, onStartEdit: startEdit, onCancelEdit: cancelEdit, onConfirmEdit: confirmEdit, onSetEditing: setEditingValue, onRemove: onRemoveCategory, expenseStats, mappingCounts, allCategories };

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Categories</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {allCategories.length} active &mdash; {sortedDefaults.length} default, {sortedCustom.length} custom
        </p>
      </div>

      {/* ── Custom Categories ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Custom Categories</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{sortedCustom.length}</span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 px-4 py-4 mb-4">
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

        {sortedCustom.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-8 text-center text-sm text-gray-400">
            No custom categories yet. Add one above.
          </div>
        ) : (
          <CategoryTable categories={sortedCustom} {...tableProps} />
        )}
      </section>

      {/* ── Default Categories ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Default Categories</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {sortedDefaults.length} of {DEFAULT_CATEGORIES.length}
          </span>
        </div>
        {sortedDefaults.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-8 text-center text-sm text-gray-400">
            All default categories have been removed.
          </div>
        ) : (
          <CategoryTable categories={sortedDefaults} {...tableProps} />
        )}
      </section>
    </div>
  );
}
