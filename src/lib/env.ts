import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(10, "DATABASE_URL is required"),
  REDIS_URL: z.string().optional().default("redis://localhost:6379"),
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 characters"),
  FOOTBALL_DATA_PROVIDER: z.string().default("mock"),
  FOOTBALL_DATA_API_KEY: z.string().optional(),
  FOOTBALL_API_BASE_URL: z.string().url().default("https://v3.football.api-sports.io"),
  FOOTBALL_API_KEY: z.string().optional(),
  AI_API_KEY: z.string().optional(),
  AI_API_ENDPOINT: z.string().optional(),
  KYC_WEBHOOK_SECRET: z.string().optional().default("mock-kyc-secret-key-123456"),
  PAYOUT_WEBHOOK_SECRET: z.string().optional().default("mock-payout-secret-key-123456"),
  CRON_SECRET: z.string().optional().default("default_cron_secret"),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.format());
    if (process.env.NODE_ENV === "production") {
      throw new Error("Missing or invalid critical environment variables in production.");
    }
  }

  return result.success
    ? result.data
    : (envSchema.parse({
        NODE_ENV: "development",
        APP_URL: "http://localhost:3000",
        DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/fmp_dev?schema=public",
        AUTH_SECRET: "dev_fallback_secret_must_replace_in_prod",
      }) as Env);
}

export const env = validateEnv();
