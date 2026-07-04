const PHONE_RE = /(?:\+91[\s-]?)?[6-9]\d{9}|\b\d{10}\b|\b\d{5}[\s-]\d{5}\b/g;
const INSTA_RE = /(?:instagram\.com\/|@)[a-zA-Z0-9_.]{3,}/gi;
const FB_RE = /(?:facebook\.com|fb\.com|fb\.gg)\/[a-zA-Z0-9.?=&_-]+/gi;
const WHATSAPP_RE = /(?:wa\.me|whatsapp\.com\/send)[^\s]*/gi;

export function containsContactInfo(text: string): boolean {
  return (
    PHONE_RE.test(text) ||
    INSTA_RE.test(text) ||
    FB_RE.test(text) ||
    WHATSAPP_RE.test(text)
  );
}

export function getContactInfoViolation(text: string): string | null {
  if (PHONE_RE.test(text)) return 'phone number';
  if (INSTA_RE.test(text)) return 'Instagram handle';
  if (FB_RE.test(text)) return 'Facebook link';
  if (WHATSAPP_RE.test(text)) return 'WhatsApp link';
  return null;
}
