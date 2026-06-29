/**
 * Turns a pastor's full name into a URL-safe slug, e.g.
 * "Pastor James Okafor" -> "james-okafor"
 *
 * Strips honorifics (Pastor, Rev, Dr, Prophet, etc.) since they
 * clutter the URL and aren't useful for uniqueness.
 */
export function slugifyName(fullName: string): string {
  const honorifics = /\b(pastor|rev\.?|reverend|dr\.?|doctor|prophet|prophetess|apostle|bishop|elder|minister)\b/gi;

  return fullName
    .replace(honorifics, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Derives initials for the monogram avatar fallback, e.g.
 * "Pastor James Okafor" -> "JO"
 */
export function deriveInitials(fullName: string): string {
  const honorifics = /\b(pastor|rev\.?|reverend|dr\.?|doctor|prophet|prophetess|apostle|bishop|elder|minister)\b/gi;
  const cleaned = fullName.replace(honorifics, '').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);

  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Appends a short random suffix to a slug if needed to resolve a
 * uniqueness collision, e.g. "james-okafor" -> "james-okafor-4f2a"
 */
export function withUniqueSuffix(slug: string): string {
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${slug}-${suffix}`;
}
