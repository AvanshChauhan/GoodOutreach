import crypto from 'crypto';

/** Generate a SHA-256 hash of a string (used for duplicate detection) */
export function hashString(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/** Count words in a string */
export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Sanitize a string — trim whitespace, replace empty with null */
export function sanitizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' || trimmed.toLowerCase() === 'notfound' ? null : trimmed;
}

/** Parse a number field safely */
export function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Validate URL format */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/** Parse comma-separated string into array */
export function parseArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value !== 'string' || !value.trim()) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Format a number with commas */
export function formatNumber(n: number | null): string {
  if (n === null) return 'N/A';
  return n.toLocaleString();
}
