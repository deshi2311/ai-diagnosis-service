import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { buildAnalyticsPayload, type Granularity } from "@/lib/admin/analytics";

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
    testRunId: searchParams.get("testRunId"),
  });
  return NextResponse.json(payload);
}
