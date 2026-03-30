import { useState, useCallback, useRef } from 'react';
import CSVUpload from './components/CSVUpload';
import ColumnMapper from './components/ColumnMapper';
import CategorySummary from './components/CategorySummary';
import CategoriesPage from './components/CategoriesPage';
import ExpenseList from './components/ExpenseList';
import CategorizationPanel from './components/CategorizationPanel';
import { useCategoryMappings } from './hooks/useCategoryMappings';
import { useCustomCategories } from './hooks/useCustomCategories';
import { useHiddenDefaults } from './hooks/useHiddenDefaults';
import { parseCSV, detectColumns, processRows } from './utils/csvParser';
import { applyMappings, getCategoryTotals } from './utils/categoryMatcher';
import { DEFAULT_CATEGORIES } from './data/defaultCategories';

// view: 'upload' | 'columnMapping' | 'dashboard' | 'categories'

export default function App() {
  const [view, setView] = useState('upload');
  const [rawRows, setRawRows] = useState([]); // all rows including header
  const [detectedCols, setDetectedCols] = useState({ date: -1, description: -1, amount: -1 });
  const [expenses, setExpenses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { customCategories, addCustomCategory, removeCustomCategory, renameCustomCategory } = useCustomCategories();
  const { mappings, addMapping, addMappings, renameMappingsCategory, clearMappings } = useCategoryMappings();
  const { hiddenDefaults, hideDefault } = useHiddenDefaults();
  const importInputRef = useRef(null);

  // --- CSV Upload ---
  const handleUpload = useCallback(async (file) => {
    const rows = await parseCSV(file);
    if (rows.length < 2) return;
    const [headers, ...dataRows] = rows;
    const cols = detectColumns(headers);
    setRawRows(rows);
    setDetectedCols(cols);

    if (cols.date >= 0 && cols.description >= 0 && cols.amount >= 0) {
      // Auto-detected — process immediately
      const processed = processRows(dataRows, cols);
      const withCategories = applyMappings(processed, mappings);
      setExpenses(withCategories);
      setView('dashboard');
    } else {
      // Need user to map columns
      setView('columnMapping');
    }
  }, [mappings]);

  // --- Column Mapping confirmed ---
  const handleColumnConfirm = useCallback((colMap) => {
    const [, ...dataRows] = rawRows;
    const processed = processRows(dataRows, colMap);
    const withCategories = applyMappings(processed, mappings);
    setExpenses(withCategories);
    setView('dashboard');
  }, [rawRows, mappings]);

  // --- Categorize a description (applies to all matching expenses) ---
  const handleCategorizeAll = useCallback((description, category, saveRule) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.description === description ? { ...e, category } : e
      )
    );

    if (saveRule) {
      addMapping(description, category);
    }
  }, [addMapping]);

  // --- Add a new custom category ---
  const handleAddCategory = useCallback((name) => {
    addCustomCategory(name);
  }, [addCustomCategory]);

  // --- Remove a category (uncategorize any transactions using it) ---
  const handleRemoveCategory = useCallback((name) => {
    if (DEFAULT_CATEGORIES.includes(name)) {
      hideDefault(name);
    } else {
      removeCustomCategory(name);
    }
    setExpenses((prev) =>
      prev.map((e) => e.category === name ? { ...e, category: undefined } : e)
    );
  }, [removeCustomCategory, hideDefault]);

  // --- Rename a category (update expenses + saved rules) ---
  const handleRenameCategory = useCallback((oldName, newName) => {
    if (DEFAULT_CATEGORIES.includes(oldName)) {
      hideDefault(oldName);
      addCustomCategory(newName);
    } else {
      renameCustomCategory(oldName, newName);
    }
    renameMappingsCategory(oldName, newName);
    setExpenses((prev) =>
      prev.map((e) => e.category === oldName ? { ...e, category: newName } : e)
    );
  }, [removeCustomCategory, hideDefault, addCustomCategory, renameCustomCategory, renameMappingsCategory]);

  // --- Export profile as JSON download ---
  const handleExportProfile = useCallback(() => {
    const profile = {
      version: '1',
      exported: new Date().toISOString(),
      mappings,
      customCategories,
    };
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moneytracker-profile-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [mappings, customCategories]);

  // --- Import profile from JSON file (merges into existing) ---
  const handleImportProfile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const profile = JSON.parse(ev.target.result);
        if (!profile.mappings || typeof profile.mappings !== 'object') {
          alert('Invalid profile file.');
          return;
        }
        const pairs = Object.entries(profile.mappings).map(([description, category]) => ({ description, category }));
        if (pairs.length) addMappings(pairs);
        (profile.customCategories || []).forEach(addCustomCategory);
      } catch {
        alert('Could not read profile file.');
      }
    };
    reader.readAsText(file);
  }, [addMappings, addCustomCategory]);

  // --- Reset to upload a new file ---
  const handleNewUpload = () => {
    setExpenses([]);
    setRawRows([]);
    setSelectedCategory(null);
    setView('upload');
  };

  // =====================
  // Derived data
  // =====================
  const uncategorized = expenses.filter((e) => !e.category);
  const categorized = expenses.filter((e) => e.category);
  const totals = getCategoryTotals(expenses);
  const activeDefaults = DEFAULT_CATEGORIES.filter((c) => !hiddenDefaults.includes(c));
  const allCategories = [...new Set([...activeDefaults, ...customCategories])].sort();

  // =====================
  // Shared header (dashboard + categories views)
  // =====================
  const appHeader = (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-gray-900">Expense Tracker</h1>
        </div>
        <div className="flex items-center gap-2">
          {Object.keys(mappings).length > 0 && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              {Object.keys(mappings).length} saved rule{Object.keys(mappings).length !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={handleNewUpload}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            New CSV
          </button>
          {Object.keys(mappings).length > 0 && (
            <button
              onClick={() => { if (window.confirm('Clear all saved category rules?')) clearMappings(); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
              title="Clear saved category rules"
            >
              Clear Rules
            </button>
          )}
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportProfile}
          />
          {(Object.keys(mappings).length > 0 || customCategories.length > 0) && (
            <button
              onClick={handleExportProfile}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
              title="Export profile as JSON"
            >
              Export Profile
            </button>
          )}
          <button
            onClick={() => importInputRef.current?.click()}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-colors"
            title="Import profile from JSON"
          >
            Import Profile
          </button>
        </div>
      </div>
      {/* Tab nav */}
      <div className="max-w-7xl mx-auto px-6 border-t border-gray-100">
        <nav className="flex -mb-px">
          <button
            onClick={() => setView('dashboard')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              view === 'dashboard'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setView('categories')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              view === 'categories'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Categories
            <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
              {allCategories.length}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );

  // =====================
  // Render
  // =====================
  if (view === 'upload') {
    return <CSVUpload onUpload={handleUpload} />;
  }

  if (view === 'columnMapping') {
    const [headers] = rawRows;
    const preview = rawRows.slice(1, 4);
    return (
      <ColumnMapper
        headers={headers}
        preview={preview}
        initialMapping={detectedCols}
        onConfirm={handleColumnConfirm}
        onBack={() => setView('upload')}
      />
    );
  }

  if (view === 'categories') {
    return (
      <div className="min-h-screen bg-gray-50">
        {appHeader}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <CategoriesPage
            customCategories={customCategories}
            activeDefaults={activeDefaults}
            expenses={expenses}
            mappings={mappings}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onRenameCategory={handleRenameCategory}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {appHeader}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Summary + Chart */}
        <CategorySummary
          expenses={expenses}
          totals={totals}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Uncategorized panel — shown prominently if there are any */}
        {uncategorized.length > 0 && (
          <CategorizationPanel
            uncategorized={uncategorized}
            categories={allCategories}
            onCategorize={(id, category, saveRule) => {
              setExpenses((prev) =>
                prev.map((e) => (e.id === id ? { ...e, category } : e))
              );
              const expense = expenses.find((e) => e.id === id);
              if (saveRule && expense) addMapping(expense.description, category);
            }}
            onCategorizeAll={handleCategorizeAll}
            onAddCategory={handleAddCategory}
          />
        )}

        {/* Expense list */}
        <ExpenseList
          expenses={expenses}
          selectedCategory={selectedCategory}
        />
      </main>
    </div>
  );
}
