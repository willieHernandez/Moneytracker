import Papa from 'papaparse';

export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: reject,
    });
  });
}

export function detectColumns(headers) {
  const norm = headers.map((h) => String(h).toLowerCase().trim());

  const find = (patterns) => {
    for (const pat of patterns) {
      const idx = norm.findIndex((h) => h === pat || h.includes(pat));
      if (idx >= 0) return idx;
    }
    return -1;
  };

  return {
    date: find(['date', 'posted date', 'transaction date', 'post date', 'trans date', 'posting date']),
    description: find([
      'description',
      'merchant',
      'payee',
      'name',
      'memo',
      'narrative',
      'details',
      'transaction description',
      'original description',
    ]),
    amount: find([
      'amount',
      'transaction amount',
      'debit amount',
      'charge',
      'sum',
      'value',
      'debit',
    ]),
  };
}

export function parseAmount(str) {
  if (typeof str === 'number') return str;
  // Handle parentheses notation like (1,234.56) → -1234.56
  const cleaned = String(str)
    .replace(/[$,\s]/g, '')
    .replace(/^\((.+)\)$/, '-$1');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function processRows(rows, colMap) {
  return rows
    .map((row, idx) => ({
      id: idx,
      date: String(row[colMap.date] ?? '').trim(),
      description: String(row[colMap.description] ?? '').trim(),
      amount: parseAmount(row[colMap.amount]),
      category: null,
    }))
    .filter((e) => e.description);
}
