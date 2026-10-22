import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdminPage();
  if (!admin) {
    redirect("/dashboard");
  }
  return <>{children}</>;
}
