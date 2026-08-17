export class CanonicalService {
  private static readonly DEFAULT_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || "https://football.example.com";

  // Parameter keys to strip from canonical links
  private static readonly STRIPPED_QUERY_PARAMS = new Set([
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "ref",
    "source",
    "fbclid",
    "gclid",
    "_ga",
    "sort",
    "order",
    "page",
    "search",
    "q",
  ]);

  /**
   * Generates a deterministic, normalized canonical URL without tracking or alternate path parameters
   */
  public static getCanonicalUrl(rawPathOrUrl: string, customDomain?: string): string {
    const domain = (customDomain || this.DEFAULT_DOMAIN).replace(/\/+$/, "");

    try {
      // If it's a relative path, resolve against base domain
      const parsed = rawPathOrUrl.startsWith("http")
        ? new URL(rawPathOrUrl)
        : new URL(rawPathOrUrl.startsWith("/") ? rawPathOrUrl : `/${rawPathOrUrl}`, domain);

      // Clean pathname (lowercase and normalize multiple slashes)
      let pathname = parsed.pathname.replace(/\/+/g, "/");
      if (pathname.length > 1 && pathname.endsWith("/")) {
        pathname = pathname.slice(0, -1);
      }

      // Filter out tracking/session parameters
      const cleanParams = new URLSearchParams();
      parsed.searchParams.forEach((val, key) => {
        const lowerKey = key.toLowerCase();
        if (!CanonicalService.STRIPPED_QUERY_PARAMS.has(lowerKey)) {
          cleanParams.set(key, val);
        }
      });

      const queryString = cleanParams.toString();
      const finalUrl = `${domain}${pathname}${queryString ? `?${queryString}` : ""}`;
      return finalUrl;
    } catch {
      // Fallback
      return `${domain}/${rawPathOrUrl.replace(/^\/+/, "")}`;
    }
  }
}
