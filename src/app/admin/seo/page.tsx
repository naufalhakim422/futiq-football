import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { SeoConsole } from "./SeoConsole";

export const metadata = {
  title: "SEO, Discovery & Growth Console | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSeoPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin");
  }

  const isAuthorized = user.roles.some((r) =>
    ["SUPER_ADMIN", "EDITOR_IN_CHIEF", "SENIOR_EDITOR"].includes(r)
  );

  if (!isAuthorized) {
    redirect("/admin");
  }

  return <SeoConsole />;
}
