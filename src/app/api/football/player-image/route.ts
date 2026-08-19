import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-Side Image Proxy for Official Football Player Photos
 * Fetches official player photos directly from API-Sports servers with proper headers,
 * bypassing browser CORS, hotlinking restrictions, and referer blocks.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get("id");
  const urlParam = searchParams.get("url");

  let targetUrl = "";
  if (urlParam) {
    const decoded = decodeURIComponent(urlParam);
    if (
      decoded.startsWith("https://media.api-sports.io/") ||
      decoded.startsWith("https://media-1.api-sports.io/") ||
      decoded.startsWith("https://media-2.api-sports.io/") ||
      decoded.startsWith("https://media-3.api-sports.io/") ||
      decoded.startsWith("https://media-4.api-sports.io/")
    ) {
      targetUrl = decoded;
    } else {
      return new NextResponse("Unauthorized image source domain", { status: 400 });
    }
  } else if (playerId) {
    const cleanId = playerId.replace(/^(ply_|player_)/, "");
    if (/^\d+$/.test(cleanId)) {
      targetUrl = `https://media.api-sports.io/football/players/${cleanId}.png`;
    } else {
      return new NextResponse("Invalid player ID format", { status: 400 });
    }
  }

  if (!targetUrl) {
    return new NextResponse("Missing or invalid player identity", { status: 400 });
  }

  try {
    const apiKey = process.env.API_FOOTBALL_KEY || process.env.FOOTBALL_API_KEY || "";
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };

    if (apiKey) {
      headers["x-apisports-key"] = apiKey;
    }

    const response = await fetch(targetUrl, {
      headers,
      next: { revalidate: 86400 }, // Cache on server for 24 hours
    });

    if (!response.ok) {
      // If primary media fails, try fallback mirror
      if (playerId) {
        const cleanId = playerId.replace(/^ply_/, "");
        const fallbackUrl = `https://media-4.api-sports.io/football/players/${cleanId}.png`;
        const fallbackRes = await fetch(fallbackUrl, { headers });
        if (fallbackRes.ok) {
          const buffer = await fallbackRes.arrayBuffer();
          return new NextResponse(buffer, {
            headers: {
              "Content-Type": fallbackRes.headers.get("content-Type") || "image/png",
              "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
            },
          });
        }
      }

      return new NextResponse("Player image not found", { status: 404 });
    }

    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/png",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    return new NextResponse("Error fetching player image", { status: 500 });
  }
}
