export interface AuthorSummary {
  id: string;
  fullName: string;
  tier: "JUNIOR" | "REGULAR" | "SENIOR" | "EXPERT";
  avatarUrl?: string | null;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface ArticleSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  coverImageCaption?: string;
  category: CategorySummary;
  author: AuthorSummary;
  readTimeMinutes: number;
  publishedAt: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  relatedTeam?: string;
}
