import { Suspense } from "react";
import { CircularProgress, Box } from "@mui/material";
import AdminShell from "@/app/components/admin/AdminShell";
import AdminAnalyticsClient from "@/app/components/admin/AdminAnalyticsClient";

export const dynamic = "force-dynamic";

export default function AdminAnalyticsPage() {
  return (
    <AdminShell title="診断分析">
      <Suspense
        fallback={
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        }
      >
        <AdminAnalyticsClient />
      </Suspense>
    </AdminShell>
  );
}
