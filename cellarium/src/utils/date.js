/**
 * Returns the current date in YYYY-MM-DD format (local timezone).
 * Avoids timezone surprises by using local date components.
 */
export function todayISODate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
