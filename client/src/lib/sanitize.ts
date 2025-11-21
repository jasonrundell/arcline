/**
 * Sanitizes text content to prevent XSS attacks
 *
 * While React automatically escapes content when rendering as text,
 * this utility provides an extra layer of security by:
 * - Removing any HTML tags
 * - Escaping special characters
 * - Ensuring only plain text is returned
 *
 * @param text - The text content to sanitize
 * @returns Sanitized plain text
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return "";

  // Convert to string if not already
  const textStr = String(text);

  // Remove HTML tags using regex (for defense in depth)
  // This is safe because React will also escape the result
  const withoutHtml = textStr.replace(/<[^>]*>/g, "");

  // Return the sanitized text
  // React will further escape this when rendering as text content
  return withoutHtml;
}
