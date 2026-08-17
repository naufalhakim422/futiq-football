import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "HEALTHY";
  let redisStatus = "HEALTHY";

  // 1. Check PostgreSQL Database Connection
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err: any) {
    dbStatus = "DOWN";
  }

  // 2. Check Redis Ephemeral Store
  try {
    if (redis && redis.status === "ready") {
      await redis.ping();
    } else {
      redisStatus = "DEGRADED";
    }
  } catch (err: any) {
    redisStatus = "DOWN";
  }

  const isHealthy = dbStatus === "HEALTHY";
  const overallStatus = isHealthy ? (redisStatus === "HEALTHY" ? "UP" : "DEGRADED") : "DOWN";

  const responsePayload = {
    status: overallStatus,
    service: "football-media-platform",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - startTime,
    checks: {
      database: dbStatus,
      redis: redisStatus,
      app: "RUNNING",
    },
    system: {
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
    },
  };

  return NextResponse.json(responsePayload, {
    status: isHealthy ? 200 : 503,
  });
}
