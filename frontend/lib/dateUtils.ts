/**
 * Date utility functions for parsing and formatting dates
 */

export const parseApiDate = (value: string): Date => {
  if (!value) return new Date();
  const trimmed = value.trim();
  if (!trimmed) return new Date();
  const hasOffset = /([zZ]|[+-]\d{2}:\d{2})$/.test(trimmed);
  const candidate = hasOffset
    ? trimmed
    : trimmed.includes('T')
      ? `${trimmed}Z`
      : `${trimmed.replace(' ', 'T')}Z`;
  const parsed = new Date(candidate);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  const fallback = new Date(trimmed);
  return Number.isNaN(fallback.getTime()) ? new Date() : fallback;
};

export const getRelativeTime = (dateString: string): string => {
  if (!dateString) return '';
  const now = new Date();
  const past = parseApiDate(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMs < 0) {
    return 'in the future';
  }

  if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  if (diffWeeks > 0) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffSecs > 10) return `${diffSecs} seconds ago`;
  return 'just now';
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  const date = parseApiDate(dateString);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

