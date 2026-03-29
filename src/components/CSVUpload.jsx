import { useRef, useState } from 'react';

export default function CSVUpload({ onUpload }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (file) => {
    setError('');
    if (!file) return;
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('Please upload a CSV file.');
      return;
    }
    onUpload(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Expense Tracker</h1>
          <p className="mt-2 text-gray-500">Upload your bank CSV to categorize and track your spending.</p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
            ${dragging
              ? 'border-blue-500 bg-blue-50 scale-[1.02]'
              : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <div className="flex flex-col items-center gap-3">
            <svg className={`w-12 h-12 transition-colors ${dragging ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div>
              <p className="text-lg font-semibold text-gray-700">
                {dragging ? 'Drop it here!' : 'Drag & drop your CSV'}
              </p>
              <p className="mt-1 text-sm text-gray-500">or click to browse files</p>
            </div>
            <span className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Choose File
            </span>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-center text-sm text-red-600">{error}</p>
        )}

        {/* Info box */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Supported CSV formats</h3>
          <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
            <li>Chase, Bank of America, Wells Fargo exports</li>
            <li>Any CSV with Date, Description, and Amount columns</li>
            <li>Category mappings are saved automatically for future uploads</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
