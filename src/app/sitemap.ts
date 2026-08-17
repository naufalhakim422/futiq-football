import { MetadataRoute } from "next";
import { SitemapService } from "@/lib/seo/sitemap.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await SitemapService.getGlobalSitemapEntries();

  return entries.map((e) => ({
    url: e.url,
    lastModified: e.lastModified ? new Date(e.lastModified) : new Date(),
    changeFrequency: e.changeFrequency,
    priority: e.priority,
  }));
}
