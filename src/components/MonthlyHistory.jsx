import { useState } from 'react';
import { getCategoryColor } from '../data/defaultCategories';

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function formatSavedAt(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MonthlyHistory({ history, onDelete }) {
  const [open, setOpen] = useState(false);

  const count = history.length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header / toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">Spending History</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {count > 0 ? `${count} snapshot${count !== 1 ? 's' : ''}` : 'No snapshots'}
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
        <div className="border-t border-gray-100 px-5 py-4">
          {count === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No snapshots saved yet. Load a CSV and click <strong className="text-gray-500">Save Snapshot</strong> to record a period.
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((snapshot) => {
                const topCategories = [...snapshot.totals]
                  .sort((a, b) => b.total - a.total)
                  .slice(0, 3);

                return (
                  <div key={snapshot.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-gray-800 text-sm">{snapshot.label}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        Saved {formatSavedAt(snapshot.savedAt)}
                      </span>
                    </div>

                    {/* Totals */}
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(snapshot.totalSpent)}</span>
                      <span className="text-xs text-gray-400">{snapshot.transactionCount} transaction{snapshot.transactionCount !== 1 ? 's' : ''}</span>
                    </div>

                    {/* Top 3 categories */}
                    {topCategories.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {topCategories.map(({ category, total }) => (
                          <span
                            key={category}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: getCategoryColor(category) }}
                          >
                            {category}
                            <span className="opacity-80">{formatCurrency(total)}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Delete */}
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => onDelete(snapshot.id)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        Delete snapshot
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
