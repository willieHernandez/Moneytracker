import { useState } from 'react';
import { getCategoryColor } from '../data/defaultCategories';

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(n));
}

export default function ExpenseList({ expenses, selectedCategory }) {
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [search, setSearch] = useState('');

  const filtered = expenses
    .filter((e) => {
      if (selectedCategory && e.category !== selectedCategory) return false;
      if (!e.category) return false; // uncategorized shown in separate panel
      if (search && !e.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (sortKey === 'amount') {
        av = Math.abs(a.amount);
        bv = Math.abs(b.amount);
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-blue-500 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-gray-700">
          Transactions
          {selectedCategory && (
            <span className="ml-2 text-xs font-normal text-gray-400">— {selectedCategory}</span>
          )}
          <span className="ml-2 text-xs font-normal text-gray-400">({filtered.length})</span>
        </h3>
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-40 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-sm">No transactions to display.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th
                  className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:text-gray-700"
                  onClick={() => toggleSort('date')}
                >
                  Date <SortIcon col="date" />
                </th>
                <th
                  className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:text-gray-700"
                  onClick={() => toggleSort('description')}
                >
                  Description <SortIcon col="description" />
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Category
                </th>
                <th
                  className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:text-gray-700"
                  onClick={() => toggleSort('amount')}
                >
                  Amount <SortIcon col="amount" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((expense) => (
                <tr key={expense.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap text-xs">{expense.date}</td>
                  <td className="px-5 py-3 text-gray-800 max-w-xs truncate" title={expense.description}>
                    {expense.description}
                  </td>
                  <td className="px-5 py-3">
                    {expense.category ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: getCategoryColor(expense.category) }}
                      >
                        {expense.category}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Uncategorized</span>
                    )}
                  </td>
                  <td className={`px-5 py-3 text-right font-medium tabular-nums ${expense.amount >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {expense.amount >= 0 ? '-' : '+'}{formatCurrency(expense.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
