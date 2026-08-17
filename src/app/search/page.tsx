import { Metadata } from "next";
import { MetadataService } from "@/lib/seo/metadata.service";
import { SearchClient } from "./SearchClient";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return MetadataService.getSearchMetadata(q);
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  return <SearchClient initialQuery={q || ""} />;
}
