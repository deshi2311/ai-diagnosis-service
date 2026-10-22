import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { connectMongo } from "@/lib/mongoose";
import { AdminErrorLog } from "@/lib/models/AdminErrorLog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  await connectMongo();
  const filter: Record<string, unknown> = {};
  if (status === "open" || status === "resolved") filter.status = status;

  const items = await AdminErrorLog.find(filter)
    .sort({ occurredAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json({
    items: items.map((e) => ({
      id: String(e._id),
      occurredAt: e.occurredAt,
      type: e.type,
      message: e.message,
      impact: e.impact,
      status: e.status,
      source: e.source,
    })),
    updatedAt: new Date().toISOString(),
  });
}
