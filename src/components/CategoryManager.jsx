import { useState } from 'react';
import { DEFAULT_CATEGORIES, getCategoryColor } from '../data/defaultCategories';

export default function CategoryManager({ customCategories, onAddCategory, onRemoveCategory, onRenameCategory }) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  // editing: { [originalName]: currentInputValue }
  const [editing, setEditing] = useState({});

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories].sort();

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAddCategory(trimmed);
    setNewName('');
  };

  const startEdit = (cat) => {
    setEditing((s) => ({ ...s, [cat]: cat }));
  };

  const cancelEdit = (cat) => {
    setEditing((s) => { const c = { ...s }; delete c[cat]; return c; });
  };

  const confirmEdit = (oldName) => {
    const newVal = (editing[oldName] || '').trim();
    if (!newVal || newVal === oldName) { cancelEdit(oldName); return; }
    onRenameCategory(oldName, newVal);
    setEditing((s) => { const c = { ...s }; delete c[oldName]; return c; });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header / toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">Manage Categories</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {allCategories.length}
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
          {/* Category grid */}
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => {
              const isCustom = !DEFAULT_CATEGORIES.includes(cat);
              const color = getCategoryColor(cat);
              const isEditing = cat in editing;

              if (isEditing) {
                return (
                  <div key={cat} className="flex items-center gap-1 pl-2 pr-1.5 py-1 rounded-full border border-blue-400 bg-blue-50">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <input
                      type="text"
                      value={editing[cat]}
                      onChange={(e) => setEditing((s) => ({ ...s, [cat]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') confirmEdit(cat);
                        if (e.key === 'Escape') cancelEdit(cat);
                      }}
                      className="w-28 text-sm bg-transparent border-none outline-none text-gray-800 px-1"
                      autoFocus
                    />
                    {/* Save */}
                    <button
                      onClick={() => confirmEdit(cat)}
                      disabled={!(editing[cat] || '').trim() || editing[cat].trim() === cat}
                      className="w-5 h-5 flex items-center justify-center rounded-full text-blue-600 hover:bg-blue-200 disabled:opacity-30 transition-colors"
                      title="Save"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    {/* Cancel */}
                    <button
                      onClick={() => cancelEdit(cat)}
                      className="w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 transition-colors"
                      title="Cancel"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={cat}
                  className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-sm group"
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-gray-700">{cat}</span>
                  {isCustom && (
                    <>
                      {/* Edit */}
                      <button
                        onClick={() => startEdit(cat)}
                        className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full text-gray-300 hover:bg-blue-100 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100"
                        title={`Rename "${cat}"`}
                      >
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => onRemoveCategory(cat)}
                        className="w-4 h-4 flex items-center justify-center rounded-full text-gray-300 hover:bg-red-100 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title={`Remove "${cat}"`}
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

          {/* Add new category */}
          <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
            <input
              type="text"
              placeholder="New category name…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
