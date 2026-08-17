import { NextRequest, NextResponse } from "next/server";
import { contributorService } from "@/lib/contributor/contributor.service";
import { getCurrentUser } from "@/lib/auth/session";
import { z } from "zod";

const applicationSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  email: z.string().email("Valid email address is required"),
  country: z.string().min(2, "Country is required"),
  preferredLanguage: z.string().default("en"),
  footballInterests: z.string().min(3, "Football interests/leagues of expertise required"),
  preferredCategories: z.string().min(3, "Preferred coverage categories required"),
  shortBio: z.string().min(10, "Short bio must be at least 10 characters"),
  writingExperience: z.string().min(10, "Writing experience summary required"),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  socialUrl: z.string().url().optional().or(z.literal("")),
  agreementAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the Contributor Agreement" }),
  }),
  originalityDeclared: z.literal(true, {
    errorMap: () => ({ message: "You must declare that all submitted work is original" }),
  }),
  copyrightDeclared: z.literal(true, {
    errorMap: () => ({ message: "You must declare adherence to copyright laws" }),
  }),
});

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const parsed = applicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const application = await contributorService.applyContributor(
      parsed.data,
      user?.id
    );

    return NextResponse.json(
      {
        success: true,
        message: "Contributor application submitted successfully.",
        data: application,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API POST /api/contributor/apply Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to submit application" },
      { status: 400 }
    );
  }
}
