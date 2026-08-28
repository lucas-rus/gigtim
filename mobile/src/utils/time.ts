/**
 * Format a date as a relative time string in Romanian (like Instagram).
 * "acum câteva secunde" → "acum 5 min" → "acum 3 ore" → "acum 2 zile" → date
 */
export function formatRelativeTime(isoString: string): string {
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 10) return 'acum câteva secunde';
  if (diffSec < 60) return `acum ${diffSec} sec`;
  if (diffMin < 60) return `acum ${diffMin} min`;
  if (diffHour < 24) return `acum ${diffHour} ${diffHour === 1 ? 'oră' : 'ore'}`;
  if (diffDay < 7) return `acum ${diffDay} ${diffDay === 1 ? 'zi' : 'zile'}`;

  // Older than a week — show date
  return then.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
}
