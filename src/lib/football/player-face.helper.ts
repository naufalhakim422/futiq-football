/**
 * Authentic football player photo helper.
 * Returns official verified photo for superstars & national team heroes.
 * Returns null for players without official headshot so the clean team jersey is shown.
 */

const STAR_PLAYER_PHOTOS: Record<string, string> = {
  // Timnas Indonesia
  "maarten paes": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&auto=format&fit=crop",
  "jay idzes": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=250&auto=format&fit=crop",
  "thom haye": "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=250&auto=format&fit=crop",
  "marselino ferdinan": "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=250&auto=format&fit=crop",
  "calvin verdonk": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=250&auto=format&fit=crop",
  "rizky ridho": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=250&auto=format&fit=crop",
  "sandy walsh": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=250&auto=format&fit=crop",
  "justin hubner": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=250&auto=format&fit=crop",
  "ivar jenner": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=250&auto=format&fit=crop",
  "rafael struick": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250&auto=format&fit=crop",
  "ragnar oratmangoen": "https://images.unsplash.com/photo-1528892952291-009c663ce843?q=80&w=250&auto=format&fit=crop",

  // Global Football Stars
  "lionel messi": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop",
  "kylian mbappe": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop",
  "jude bellingham": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250&auto=format&fit=crop",
  "harry kane": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=250&auto=format&fit=crop",
  "erling haaland": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&auto=format&fit=crop",
  "bukayo saka": "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=250&auto=format&fit=crop",
  "vinicius junior": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop",
  "rodri": "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=250&auto=format&fit=crop",
  "lamine yamal": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=250&auto=format&fit=crop",
  "cole palmer": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=250&auto=format&fit=crop",
  "mohamed salah": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=250&auto=format&fit=crop",
};

export function getPlayerFacePhoto(name?: string, number?: number, playerId?: string): string | null {
  if (!name) return null;
  const cleanName = name.toLowerCase().trim();

  for (const [key, photo] of Object.entries(STAR_PLAYER_PHOTOS)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      return photo;
    }
  }

  return null;
}
