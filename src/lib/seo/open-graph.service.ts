export interface OpenGraphImageParams {
  url?: string | null;
  alt?: string;
  width?: number;
  height?: number;
}

export interface OpenGraphParams {
  title: string;
  description: string;
  url: string;
  type?: "website" | "article" | "profile";
  siteName?: string;
  image?: OpenGraphImageParams;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
  twitterCard?: "summary" | "summary_large_image";
  twitterHandle?: string;
}

export class OpenGraphService {
  private static readonly DEFAULT_IMAGE = "https://football.example.com/images/og-default.jpg";
  private static readonly DEFAULT_SITE_NAME = "FUTIQ FOOTBALL";
  private static readonly DEFAULT_TWITTER_HANDLE = "@futiqfootball";

  public static buildMetadata(params: OpenGraphParams) {
    const imageUrl = params.image?.url || this.DEFAULT_IMAGE;
    const imageAlt = params.image?.alt || params.title;
    const imageWidth = params.image?.width || 1200;
    const imageHeight = params.image?.height || 630;

    const openGraph: any = {
      title: params.title,
      description: params.description,
      url: params.url,
      siteName: params.siteName || this.DEFAULT_SITE_NAME,
      locale: "en_US",
      type: params.type || "website",
      images: [
        {
          url: imageUrl,
          width: imageWidth,
          height: imageHeight,
          alt: imageAlt,
        },
      ],
    };

    if (params.type === "article") {
      if (params.publishedTime) openGraph.publishedTime = params.publishedTime;
      if (params.modifiedTime) openGraph.modifiedTime = params.modifiedTime;
      if (params.authors && params.authors.length > 0) openGraph.authors = params.authors;
      if (params.section) openGraph.section = params.section;
      if (params.tags && params.tags.length > 0) openGraph.tags = params.tags;
    }

    const twitter: any = {
      card: params.twitterCard || "summary_large_image",
      title: params.title,
      description: params.description,
      site: params.twitterHandle || this.DEFAULT_TWITTER_HANDLE,
      creator: params.twitterHandle || this.DEFAULT_TWITTER_HANDLE,
      images: [imageUrl],
    };

    return { openGraph, twitter };
  }
}
