const PHONE_RE = /(\+?\d[\d\s\-.]{7,}\d)/;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

/** Returns 'phone number', 'email address', or null if the text looks clean. */
export function detectContactInfo(text: string): string | null {
  if (EMAIL_RE.test(text)) return 'email address';
  if (PHONE_RE.test(text)) return 'phone number';
  return null;
}
