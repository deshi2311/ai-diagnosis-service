import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/admin/auth";
import { connectMongo } from "@/lib/mongoose";
import { AdminErrorLog } from "@/lib/models/AdminErrorLog";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (body.status !== "open" && body.status !== "resolved") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  await connectMongo();
  const doc = await AdminErrorLog.findByIdAndUpdate(
    id,
    { $set: { status: body.status } },
    { new: true },
  );
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, id, status: doc.status });
}
