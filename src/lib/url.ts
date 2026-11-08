/** Adds https:// when someone types a bare domain like "instagram.com/x" in the CMS. */
export function normalizeUrl(value: string): string {
  const v = value.trim();
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}
