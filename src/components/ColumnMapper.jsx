import { useState } from 'react';

export default function ColumnMapper({ headers, preview, initialMapping, onConfirm, onBack }) {
  const [mapping, setMapping] = useState({
    date: initialMapping.date >= 0 ? initialMapping.date : '',
    description: initialMapping.description >= 0 ? initialMapping.description : '',
    amount: initialMapping.amount >= 0 ? initialMapping.amount : '',
  });

  const isValid =
    mapping.date !== '' &&
    mapping.description !== '' &&
    mapping.amount !== '' &&
    new Set([mapping.date, mapping.description, mapping.amount]).size === 3;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      date: Number(mapping.date),
      description: Number(mapping.description),
      amount: Number(mapping.amount),
    });
  };

  const fieldConfig = [
    { key: 'date', label: 'Date Column', icon: '📅', description: 'The column containing transaction dates' },
    { key: 'description', label: 'Description Column', icon: '📝', description: 'Merchant name or transaction description' },
    { key: 'amount', label: 'Amount Column', icon: '💰', description: 'Transaction amount (negative = debit)' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Map Your Columns</h2>
          <p className="mt-2 text-gray-500">
            We couldn't auto-detect your CSV columns. Please match them below.
          </p>
        </div>

        {/* CSV Preview */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">CSV Preview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-50">
                  {headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left font-semibold text-blue-700 whitespace-nowrap">
                      [{i}] {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, ri) => (
                  <tr key={ri} className="border-t border-gray-100">
                    {headers.map((_, ci) => (
                      <td key={ci} className="px-3 py-2 text-gray-600 whitespace-nowrap max-w-[200px] truncate">
                        {row[ci] ?? ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Column mapping form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="space-y-4">
            {fieldConfig.map(({ key, label, icon, description }) => (
              <div key={key}>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <span>{icon}</span> {label}
                  <span className="text-xs text-gray-400 font-normal">— {description}</span>
                </label>
                <select
                  value={mapping[key]}
                  onChange={(e) => setMapping((m) => ({ ...m, [key]: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">Select a column…</option>
                  {headers.map((h, i) => (
                    <option key={i} value={i}>
                      [{i}] {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {!isValid && mapping.date !== '' && mapping.description !== '' && mapping.amount !== '' && (
            <p className="mt-3 text-sm text-red-600">Each field must map to a different column.</p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Confirm & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
