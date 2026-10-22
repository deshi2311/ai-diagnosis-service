import { requireAdmin } from "@/lib/admin/auth";
import {
  buildAnalyticsCsv,
  buildAnalyticsPayload,
  type Granularity,
} from "@/lib/admin/analytics";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const granularity = (searchParams.get("granularity") ?? "day") as Granularity;
  const payload = await buildAnalyticsPayload({
    from: searchParams.get("from"),
    to: searchParams.get("to"),
    granularity: ["day", "week", "month"].includes(granularity)
      ? granularity
      : "day",
  });
  const csv = await buildAnalyticsCsv(payload);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="analytics-${Date.now()}.csv"`,
    },
  });
}
