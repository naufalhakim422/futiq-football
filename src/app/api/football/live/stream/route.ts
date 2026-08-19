import { NextRequest } from "next/server";
import { liveMatchEngine } from "@/lib/football/live-engine/live-match.engine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fixtureId = searchParams.get("fixtureId");

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isAlive = true;

      // Close handler on abort
      request.signal.addEventListener("abort", () => {
        isAlive = false;
        try {
          controller.close();
        } catch {
          // Ignored if already closed
        }
      });

      const pushUpdate = async () => {
        if (!isAlive) return;

        try {
          if (fixtureId) {
            const matchData = await liveMatchEngine.getLiveMatch(fixtureId);
            if (matchData) {
              const payload = `data: ${JSON.stringify({ type: "MATCH_UPDATE", data: matchData, timestamp: Date.now() })}\n\n`;
              controller.enqueue(encoder.encode(payload));
            }
          } else {
            const liveList = await liveMatchEngine.getLiveMatchesList();
            const payload = `data: ${JSON.stringify({ type: "LIVE_LIST_UPDATE", data: liveList, count: liveList.length, timestamp: Date.now() })}\n\n`;
            controller.enqueue(encoder.encode(payload));
          }
        } catch (err: any) {
          if (isAlive) {
            const errorPayload = `data: ${JSON.stringify({ type: "ERROR", message: err?.message || "Stream update error" })}\n\n`;
            controller.enqueue(encoder.encode(errorPayload));
          }
        }
      };

      // 1. Immediate initial push
      await pushUpdate();

      // 2. Scheduled 15-second interval loop (matching API-Football update interval)
      const intervalId = setInterval(async () => {
        if (!isAlive) {
          clearInterval(intervalId);
          return;
        }
        await pushUpdate();
      }, 15000);

      // Clean up interval if stream closes
      request.signal.addEventListener("abort", () => {
        clearInterval(intervalId);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
