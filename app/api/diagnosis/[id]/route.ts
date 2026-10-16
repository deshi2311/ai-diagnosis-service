import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireUserId } from "@/lib/diagnosis/auth";
import { Diagnosis } from "@/lib/models/Diagnosis";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

function isOwned(userId: string, docUserId: unknown) {
  return String(docUserId) === userId;
}

export async function GET(_request: Request, { params }: Params) {
  const gate = await requireUserId();
  if ("error" in gate) return gate.error;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const doc = await Diagnosis.findById(id).lean();
  if (!doc || !isOwned(gate.userId, doc.userId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: String(doc._id),
    answers: doc.answers,
    result: doc.result,
    careerRoadmap: doc.careerRoadmap,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
}

export async function PUT(request: Request, { params }: Params) {
  const gate = await requireUserId();
  if ("error" in gate) return gate.error;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: {
    result?: {
      strengthType?: string;
      suitableJobs?: string[];
      nextSteps?: string[];
      summary?: string;
    };
    careerRoadmap?: {
      shortTerm?: string;
      midTerm?: string;
      longTerm?: string;
    };
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const doc = await Diagnosis.findById(id);
  if (!doc || !isOwned(gate.userId, doc.userId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.result) {
    if (typeof body.result.strengthType === "string") {
      doc.result.strengthType = body.result.strengthType.trim();
    }
    if (Array.isArray(body.result.suitableJobs)) {
      doc.result.suitableJobs = body.result.suitableJobs.map(String);
    }
    if (Array.isArray(body.result.nextSteps)) {
      doc.result.nextSteps = body.result.nextSteps.map(String);
    }
    if (typeof body.result.summary === "string") {
      doc.result.summary = body.result.summary.trim();
    }
  }

  if (body.careerRoadmap) {
    if (typeof body.careerRoadmap.shortTerm === "string") {
      doc.careerRoadmap.shortTerm = body.careerRoadmap.shortTerm.trim();
    }
    if (typeof body.careerRoadmap.midTerm === "string") {
      doc.careerRoadmap.midTerm = body.careerRoadmap.midTerm.trim();
    }
    if (typeof body.careerRoadmap.longTerm === "string") {
      doc.careerRoadmap.longTerm = body.careerRoadmap.longTerm.trim();
    }
  }

  await doc.save();

  return NextResponse.json({
    id: String(doc._id),
    answers: doc.answers,
    result: doc.result,
    careerRoadmap: doc.careerRoadmap,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  const gate = await requireUserId();
  if ("error" in gate) return gate.error;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const doc = await Diagnosis.findById(id);
  if (!doc || !isOwned(gate.userId, doc.userId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await doc.deleteOne();
  return NextResponse.json({ ok: true });
}
