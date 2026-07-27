/**
 * Format a date string as a relative time (e.g. "2 hours ago", "yesterday").
 */
export function formatRelativeTime(input: string | Date | null | undefined): string {
  if (!input) return "";
  const date = typeof input === "string" ? new Date(input) : input;
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) === 1 ? "" : "s"} ago`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)} month${Math.floor(diffDay / 30) === 1 ? "" : "s"} ago`;
  return `${Math.floor(diffDay / 365)} year${Math.floor(diffDay / 365) === 1 ? "" : "s"} ago`;
}

/**
 * Format a date in a localized, friendly format.
 */
export function formatDate(input: string | Date | null | undefined, fallback = "N/A"): string {
  if (!input) return fallback;
  const date = typeof input === "string" ? new Date(input) : input;
  if (isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(input: string | Date | null | undefined, fallback = "N/A"): string {
  if (!input) return fallback;
  const date = typeof input === "string" ? new Date(input) : input;
  if (isNaN(date.getTime())) return fallback;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}