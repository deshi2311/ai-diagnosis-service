import AdminShell from "@/app/components/admin/AdminShell";
import AdminUsersClient from "@/app/components/admin/AdminUsersClient";

export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  return (
    <AdminShell title="ユーザー管理">
      <AdminUsersClient />
    </AdminShell>
  );
}
