import { NextResponse } from "next/server";
import { SitemapService } from "@/lib/seo/sitemap.service";

export async function GET() {
  try {
    const entries = await SitemapService.getNewsSitemapEntries();

    const xmlItems = entries
      .map((item) => {
        const keywordsTag = item.keywords && item.keywords.length > 0
          ? `\n      <news:keywords>${escapeXml(item.keywords.join(", "))}</news:keywords>`
          : "";

        return `  <url>
    <loc>${item.url}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(item.publicationName)}</news:name>
        <news:language>${item.publicationLanguage}</news:language>
      </news:publication>
      <news:publication_date>${item.publicationDate}</news:publication_date>
      <news:title>${escapeXml(item.title)}</news:title>${keywordsTag}
    </news:news>
  </url>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${xmlItems}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[News Sitemap Error]:", error);
    return new NextResponse("<urlset></urlset>", {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}
