import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/admin/auth";
import mongoClient from "@/lib/mongodb";
import { connectMongo } from "@/lib/mongoose";
import { Diagnosis } from "@/lib/models/Diagnosis";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Props) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await connectMongo();
  const user = await mongoClient
    .db()
    .collection("users")
    .findOne(
      { _id: new ObjectId(id) },
      { projection: { email: 1, name: 1, role: 1, createdAt: 1 } },
    );
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const diagnoses = await Diagnosis.find({
    userId: new mongoose.Types.ObjectId(id),
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .select("_id result.strengthType createdAt")
    .lean();

  return NextResponse.json({
    id: String(user._id),
    email: user.email ?? "",
    name: user.name ?? "",
    role: user.role === "admin" ? "admin" : "user",
    createdAt: user.createdAt ?? null,
    recentDiagnoses: diagnoses.map((d) => ({
      id: String(d._id),
      strengthType: d.result?.strengthType ?? "",
      createdAt: d.createdAt,
    })),
  });
}

export async function PATCH(request: Request, { params }: Props) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (id === gate.user.id) {
    return NextResponse.json(
      { error: "自分自身のロールは変更できません" },
      { status: 400 },
    );
  }

  let body: { role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (body.role !== "admin" && body.role !== "user") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const col = mongoClient.db().collection("users");
  const target = await col.findOne({ _id: new ObjectId(id) });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (target.role === "admin" && body.role === "user") {
    const adminCount = await col.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "最後の管理者は一般ユーザーに変更できません" },
        { status: 400 },
      );
    }
  }

  await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: { role: body.role, updatedAt: new Date() } },
  );

  return NextResponse.json({ ok: true, id, role: body.role });
}
