import { redirect } from "next/navigation";

interface RoleLoginRedirectProps {
  params: Promise<{ role: string }>;
}

export default async function RoleLoginRedirect({ params }: RoleLoginRedirectProps) {
  const { role } = await params;
  const validRedirects: Record<string, string> = {
    contributor: "/contributor",
    admin: "/admin",
    editor: "/editor",
    finance: "/admin/finance",
  };

  const targetPath = validRedirects[role.toLowerCase()] || `/${role}`;
  redirect(`/login?redirect=${encodeURIComponent(targetPath)}`);
}
