import { PopunderPolicy, AdTargetingContext } from "./types";
import { adAuditService } from "./ad-audit.service";

export class PopunderPolicyService {
  private static instance: PopunderPolicyService;

  private static policy: PopunderPolicy = {
    id: "popunder_global_policy",
    enabled: false, // Default to safe disabled mode
    desktopEnabled: true,
    mobileEnabled: false, // Prevent intrusive mobile popunders by default
    frequencyCapMinutes: 30,
    cooldownSeconds: 1800,
    maxPerSession: 1,
    maxPerDay: 2,
    allowedRoutes: ["/news", "/articles", "/transfers", "/matches"],
    excludedRoutes: ["/admin", "/contributor", "/auth", "/login", "/editor"],
    targetUrl: "https://example.com/partner-sponsor",
    providerName: "Adsterra Network",
    updatedAt: "2026-08-17T12:00:00Z",
  };

  private constructor() {}

  public static getInstance(): PopunderPolicyService {
    if (!PopunderPolicyService.instance) {
      PopunderPolicyService.instance = new PopunderPolicyService();
    }
    return PopunderPolicyService.instance;
  }

  public getPolicy(): PopunderPolicy {
    return { ...PopunderPolicyService.policy };
  }

  public async updatePolicy(
    updates: Partial<PopunderPolicy>,
    actorId = "admin"
  ): Promise<PopunderPolicy> {
    PopunderPolicyService.policy = {
      ...PopunderPolicyService.policy,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await adAuditService.logAction({
      actorId,
      action: "CHANGE_POPUNDER_POLICY",
      entityType: "POLICY",
      entityId: PopunderPolicyService.policy.id,
      details: `Updated popunder policy (Enabled: ${PopunderPolicyService.policy.enabled}, Freq: ${PopunderPolicyService.policy.frequencyCapMinutes}m)`,
    });

    return { ...PopunderPolicyService.policy };
  }

  /**
   * Evaluates whether a popunder can be safely triggered for a given context
   */
  public evaluateTrigger(context: {
    route: string;
    device?: "DESKTOP" | "MOBILE" | "TABLET" | "ALL";
    lastTriggeredTimestamp?: number;
    sessionImpressionsCount?: number;
  }): { allowed: boolean; reason?: string; targetUrl?: string } {
    const policy = PopunderPolicyService.policy;

    // 1. Global Kill-Switch
    if (!policy.enabled) {
      return { allowed: false, reason: "Popunder globally disabled" };
    }

    // 2. Device Controls
    if (context.device === "MOBILE" && !policy.mobileEnabled) {
      return { allowed: false, reason: "Popunder disabled for mobile devices" };
    }
    if (context.device === "DESKTOP" && !policy.desktopEnabled) {
      return { allowed: false, reason: "Popunder disabled for desktop devices" };
    }

    // 3. Excluded Route Check
    const isExcluded = policy.excludedRoutes.some((exc) =>
      context.route.toLowerCase().startsWith(exc.toLowerCase())
    );
    if (isExcluded) {
      return { allowed: false, reason: `Route ${context.route} is blacklisted for popunders` };
    }

    // 4. Session Cap
    if (
      context.sessionImpressionsCount !== undefined &&
      context.sessionImpressionsCount >= policy.maxPerSession
    ) {
      return { allowed: false, reason: "Max session popunder cap reached" };
    }

    // 5. Cooldown Protection
    if (context.lastTriggeredTimestamp) {
      const elapsedSeconds = (Date.now() - context.lastTriggeredTimestamp) / 1000;
      if (elapsedSeconds < policy.cooldownSeconds) {
        return {
          allowed: false,
          reason: `Popunder cooldown active (${Math.round(policy.cooldownSeconds - elapsedSeconds)}s remaining)`,
        };
      }
    }

    return {
      allowed: true,
      targetUrl: policy.targetUrl,
    };
  }
}

export const popunderPolicyService = PopunderPolicyService.getInstance();
