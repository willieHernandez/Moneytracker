import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { getCategoryColor } from '../data/defaultCategories';

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function StatCard({ label, value, sub, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    red: 'bg-red-50 text-red-700 border-red-100',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {sub && <p className="mt-0.5 text-xs opacity-60">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-gray-800">{d.category}</p>
      <p className="text-gray-600">{formatCurrency(d.total)}</p>
      <p className="text-gray-400 text-xs">{d.count} transaction{d.count !== 1 ? 's' : ''}</p>
    </div>
  );
};

export default function CategorySummary({ expenses, totals, selectedCategory, onSelectCategory }) {
  const totalSpent = expenses.reduce((s, e) => s + Math.abs(e.amount), 0);
  const totalTransactions = expenses.length;
  const categorizedCount = expenses.filter((e) => e.category).length;
  const uncategorizedCount = totalTransactions - categorizedCount;

  // Exclude uncategorized from chart
  const chartData = totals.filter((t) => t.category !== 'Uncategorized');

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Spent" value={formatCurrency(totalSpent)} sub={`${totalTransactions} transactions`} color="blue" />
        <StatCard label="Categories" value={chartData.length} sub="distinct categories" color="green" />
        <StatCard label="Categorized" value={categorizedCount} sub={`${Math.round((categorizedCount / totalTransactions) * 100)}% of transactions`} color="amber" />
        {uncategorizedCount > 0 && (
          <StatCard label="Needs Review" value={uncategorizedCount} sub="uncategorized" color="red" />
        )}
      </div>

      {/* Bar chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 36)}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
            >
              <XAxis
                type="number"
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="category"
                width={130}
                tick={{ fontSize: 12, fill: '#374151' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="total" radius={[0, 6, 6, 0]} onClick={(d) => onSelectCategory(d.category === selectedCategory ? null : d.category)}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.category}
                    fill={getCategoryColor(entry.category)}
                    opacity={selectedCategory && selectedCategory !== entry.category ? 0.3 : 1}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {selectedCategory && (
            <p className="mt-2 text-xs text-center text-gray-400">
              Showing <strong className="text-gray-700">{selectedCategory}</strong> —{' '}
              <button className="text-blue-500 hover:underline" onClick={() => onSelectCategory(null)}>
                Clear filter
              </button>
            </p>
          )}
        </div>
      )}

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
            !selectedCategory
              ? 'bg-gray-800 text-white border-gray-800'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
          }`}
        >
          All
        </button>
        {totals.map(({ category, total, count }) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category === selectedCategory ? null : category)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border flex items-center gap-1.5 ${
              selectedCategory === category
                ? 'text-white border-transparent'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
            style={selectedCategory === category ? { backgroundColor: getCategoryColor(category), borderColor: getCategoryColor(category) } : {}}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: getCategoryColor(category) }}
            />
            {category}
            <span className="opacity-70">({count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
