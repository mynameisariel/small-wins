/**
 * Gets today's date in YYYY-MM-DD format (local timezone)
 * CRITICAL: Avoid using toISOString() which converts to UTC
 */
export const getTodayLocalDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a YYYY-MM-DD date string to readable format
 */
export const formatDisplayDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00'); // Prevent timezone shift
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Gets ISO timestamp for created_at
 */
export const getISOTimestamp = (): string => {
  return new Date().toISOString();
};