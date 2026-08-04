/**
 * Returns a `YYYY-MM-DD` key for the given date. Used both for
 * display and to detect duplicate check-ins for the same day.
 */
export function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date as `DD/MM/YYYY`.
 */
export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

/**
 * Formats a date as `HH:MM AM/PM` (12 hour clock).
 */
export function formatTime(date: Date): string {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${meridiem}`;
}

/**
 * Formats a `YYYY-MM-DD` key into `DD/MM/YYYY` for display.
 */
export function formatDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split('-');
  return `${day}/${month}/${year}`;
}
