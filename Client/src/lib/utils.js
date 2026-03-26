/**
 * Utility functions.
 */

/**
 * Conditional class name joiner (like clsx/classnames).
 * @param  {...(string|boolean|undefined|null)} classes
 * @returns {string}
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format a score as a percentage string.
 * @param {number} score
 * @returns {string} e.g., "85.5%"
 */
export function formatScore(score) {
  if (score === null || score === undefined) return 'N/A';
  return `${Math.round(score * 10) / 10}%`;
}

/**
 * Format seconds into mm:ss display.
 * @param {number} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format a date to a readable string.
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format relative time (e.g., "2 hours ago").
 * @param {string|Date} date
 * @returns {string}
 */
export function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const { label, seconds: intervalSeconds } of intervals) {
    const count = Math.floor(seconds / intervalSeconds);
    if (count >= 1) {
      return `${count} ${label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'Just now';
}

/**
 * Get initials from a name (for avatar fallback).
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate text with ellipsis.
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength) + '...';
}

/**
 * Get a color for a score value (green/yellow/red gradient).
 * @param {number} score 0-100
 * @returns {string} hex color
 */
export function getScoreColor(score) {
  if (score >= 75) return '#10B981';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
}
