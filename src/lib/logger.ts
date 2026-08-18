export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogPayload {
  level: LogLevel;
  message: string;
  context?: string;
  requestId?: string;
  actorId?: string;
  route?: string;
  statusCode?: number;
  durationMs?: number;
  data?: Record<string, any>;
  error?: string | Error;
}

const REDACTED_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "secret",
  "authsecret",
  "apikey",
  "signature",
  "accountnumber",
  "cardnumber",
  "cvv",
  "ssn",
  "authorization",
  "cookie",
  "x-apisports-key",
  "xapisportskey",
  "football_api_key",
  "apisportskey",
]);

export class Logger {
  /**
   * Recursively sanitizes and redacts sensitive data properties
   */
  public static redact(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== "object") return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => Logger.redact(item));
    }

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      if (REDACTED_KEYS.has(lowerKey)) {
        sanitized[key] = "[REDACTED]";
      } else if (typeof value === "object") {
        sanitized[key] = Logger.redact(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  public static log(payload: LogPayload): void {
    const entry = {
      timestamp: new Date().toISOString(),
      level: payload.level.toUpperCase(),
      message: payload.message,
      context: payload.context,
      requestId: payload.requestId,
      actorId: payload.actorId,
      route: payload.route,
      statusCode: payload.statusCode,
      durationMs: payload.durationMs,
      data: payload.data ? Logger.redact(payload.data) : undefined,
      error: payload.error instanceof Error ? payload.error.stack || payload.error.message : payload.error,
    };

    const output = JSON.stringify(entry);

    if (payload.level === "error") {
      console.error(output);
    } else if (payload.level === "warn") {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  public static info(message: string, meta?: Partial<LogPayload>): void {
    Logger.log({ level: "info", message, ...meta });
  }

  public static warn(message: string, meta?: Partial<LogPayload>): void {
    Logger.log({ level: "warn", message, ...meta });
  }

  public static error(message: string, meta?: Partial<LogPayload>): void {
    Logger.log({ level: "error", message, ...meta });
  }

  public static debug(message: string, meta?: Partial<LogPayload>): void {
    if (process.env.NODE_ENV !== "production") {
      Logger.log({ level: "debug", message, ...meta });
    }
  }
}

export const logger = Logger;
