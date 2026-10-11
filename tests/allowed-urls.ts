// The URL forms the privacy policy may link to. Anything else, javascript: and data: included, could run code or load content from elsewhere.
export const allowedUrlPattern = /^(?:https?:\/\/|mailto:|#|\/(?!\/))/;

// Browsers ignore whitespace and control characters inside a URL scheme and match it case-insensitively, so compare against the stripped, lowercased URL.
export function normalizeUrl(url: string): string {
  return url.replace(/[\s\u0000-\u001f\u007f]/g, '').toLowerCase();
}
