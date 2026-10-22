import AdminShell from "@/app/components/admin/AdminShell";
import AdminErrorsClient from "@/app/components/admin/AdminErrorsClient";

export const dynamic = "force-dynamic";

export default function AdminErrorsPage() {
  return (
    <AdminShell title="エラーログ">
      <AdminErrorsClient />
    </AdminShell>
  );
}
