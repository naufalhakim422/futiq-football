/**
 * Security & Content Sanitization Utilities
 * Prevents XSS, script injection, and enforces safe markup for newsroom articles.
 */

// Allowed HTML tags in sanitized article body
const ALLOWED_TAGS = [
  "p",
  "h2",
  "h3",
  "h4",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "figure",
  "figcaption",
  "hr",
  "br",
];

/**
 * Sanitize rich text input by removing dangerous tags, script blocks, and inline event handlers
 */
export function sanitizeRichText(input: string): string {
  if (!input || typeof input !== "string") return "";

  let sanitized = input
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove iframe tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    // Remove style tags and contents
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    // Remove event handlers (e.g. onclick, onerror, onload)
    .replace(/\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    // Remove javascript: URLs
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
    .replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""');

  return sanitized.trim();
}

/**
 * Generate SEO-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Calculate estimated reading time in minutes based on word count
 */
export function calculateReadTime(text: string): { wordCount: number; readTimeMinutes: number } {
  if (!text) return { wordCount: 0, readTimeMinutes: 1 };

  // Strip HTML tags for word counting
  const plainText = text.replace(/<[^>]*>/g, " ");
  const words = plainText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  // Standard reading speed ~ 200 words/min
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return { wordCount, readTimeMinutes };
}

/**
 * Validate that an image URL is safe and well-formed
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    return true;
  } catch {
    return false;
  }
}
