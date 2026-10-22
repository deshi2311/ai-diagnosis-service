import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/admin/auth";
import mongoClient from "@/lib/mongodb";
import { connectMongo } from "@/lib/mongoose";
import { Diagnosis } from "@/lib/models/Diagnosis";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const role = searchParams.get("role");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 20) || 20));

  await connectMongo();
  const filter: Record<string, unknown> = {};
  if (role === "admin" || role === "user") filter.role = role;
  if (q) {
    filter.$or = [
      { email: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
      { name: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
    ];
  }

  const col = mongoClient.db().collection("users");
  const total = await col.countDocuments(filter);
  const users = await col
    .find(filter, { projection: { email: 1, name: 1, role: 1, image: 1, createdAt: 1 } })
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray();

  // mongodb ドライバの ObjectId を mongoose に渡すと BSONVersionError になるため変換する
  const ids = users.map((u) => new mongoose.Types.ObjectId(String(u._id)));
  const counts = await Diagnosis.aggregate<{
    _id: mongoose.Types.ObjectId;
    n: number;
    last: Date;
  }>([
    { $match: { userId: { $in: ids } } },
    {
      $group: {
        _id: "$userId",
        n: { $sum: 1 },
        last: { $max: "$createdAt" },
      },
    },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c]));

  return NextResponse.json({
    total,
    page,
    pageSize,
    items: users.map((u) => {
      const c = countMap.get(String(u._id));
      return {
        id: String(u._id),
        email: u.email ?? "",
        name: u.name ?? "",
        role: u.role === "admin" ? "admin" : "user",
        diagnosisCount: c?.n ?? 0,
        lastDiagnosisAt: c?.last ?? null,
        createdAt: u.createdAt ?? null,
      };
    }),
  });
}
