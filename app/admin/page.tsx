import AdminShell from "@/app/components/admin/AdminShell";
import AdminDashboardClient from "@/app/components/admin/AdminDashboardClient";

export const dynamic = "force-dynamic";

export default function AdminHomePage() {
  return (
    <AdminShell title="管理者ダッシュボード">
      <AdminDashboardClient />
    </AdminShell>
  );
}
