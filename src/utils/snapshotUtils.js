const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Generates a human-readable label from the date range of a set of expenses.
 * Parses dates as local time to avoid UTC offset shifts.
 * @param {Array<{date: string}>} expenses
 * @returns {{ label: string, dateRange: string }}
 */
export function generateSnapshotLabel(expenses) {
  const dates = expenses
    .map((e) => e.date)
    .filter(Boolean)
    .sort();

  if (dates.length === 0) {
    return { label: 'Snapshot', dateRange: '' };
  }

  // Parse as local time by appending T00:00:00
  const parse = (d) => new Date(d + 'T00:00:00');
  const earliest = parse(dates[0]);
  const latest = parse(dates[dates.length - 1]);

  const m1 = earliest.getMonth();
  const y1 = earliest.getFullYear();
  const m2 = latest.getMonth();
  const y2 = latest.getFullYear();

  let label;
  if (m1 === m2 && y1 === y2) {
    label = `${MONTH_NAMES[m1]} ${y1}`;
  } else if (y1 === y2) {
    label = `${MONTH_NAMES[m1]}–${MONTH_NAMES[m2]} ${y1}`;
  } else {
    label = `${MONTH_NAMES[m1]} ${y1}–${MONTH_NAMES[m2]} ${y2}`;
  }

  return { label, dateRange: label };
}
