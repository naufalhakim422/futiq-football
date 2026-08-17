import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://football.example.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/news",
          "/news/*",
          "/teams",
          "/teams/*",
          "/players",
          "/players/*",
          "/competitions",
          "/competitions/*",
          "/matches",
          "/matches/*",
          "/transfers",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/editor",
          "/editor/*",
          "/contributor",
          "/contributor/*",
          "/api",
          "/api/*",
          "/search",
          "/search/*",
          "/auth",
          "/auth/*",
        ],
      },
    ],
    sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/news-sitemap.xml`],
  };
}
