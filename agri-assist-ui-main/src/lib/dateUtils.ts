/**
 * "Just now", "5 min ago", "2 hours ago", "Today 10:30 AM", "Yesterday", "15 Jan 2025"
 */
export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const ms = now.getTime() - date.getTime();
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);

  if (sec < 60) return 'Just now';
  if (min < 60) return `${min} min ago`;
  if (hour < 24 && date.getDate() === now.getDate()) return `${hour} hr ago`;
  if (day === 0) return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  if (day === 1) return 'Yesterday';
  if (day < 7) return date.toLocaleDateString('en-IN', { weekday: 'short' });
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined });
}

/**
 * For "Last updated: X ago" - updates every minute
 */
export function formatTimeAgo(date: Date, now: Date = new Date()): string {
  const ms = now.getTime() - date.getTime();
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);

  if (sec < 60) return 'Just now';
  if (min < 60) return `${min} min ago`;
  if (hour < 24) return `${hour} hr ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
