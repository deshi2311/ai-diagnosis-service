import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireUserId } from "@/lib/diagnosis/auth";
import { validateAnswers } from "@/lib/diagnosis/questions";
import { analyzeCareer } from "@/lib/diagnosis/analyzeCareer";
import { Diagnosis } from "@/lib/models/Diagnosis";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const gate = await requireUserId();
  if ("error" in gate) return gate.error;

  const items = await Diagnosis.find({ userId: gate.userId })
    .sort({ createdAt: -1 })
    .select("_id result.strengthType result.summary createdAt updatedAt")
    .lean();

  return NextResponse.json({
    items: items.map((doc) => ({
      id: String(doc._id),
      strengthType: doc.result?.strengthType ?? "",
      summary: doc.result?.summary ?? "",
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })),
  });
}

export async function POST(request: Request) {
  const gate = await requireUserId();
  if ("error" in gate) return gate.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const answers = validateAnswers(
    typeof body === "object" && body && "answers" in body
      ? (body as { answers: unknown }).answers
      : body,
  );
  if (!answers) {
    return NextResponse.json(
      { error: "5問すべて1〜1000文字で入力してください" },
      { status: 400 },
    );
  }

  const analysis = await analyzeCareer(answers);
  if (!analysis.ok) {
    return NextResponse.json(
      { error: analysis.message, code: analysis.code },
      { status: 422 },
    );
  }

  const doc = await Diagnosis.create({
    userId: new mongoose.Types.ObjectId(gate.userId),
    answers,
    result: {
      strengthType: analysis.analysis.strengthType,
      suitableJobs: analysis.analysis.suitableJobs,
      nextSteps: analysis.analysis.nextSteps,
      summary: analysis.analysis.summary,
      usage: analysis.usage,
      estimatedCostUsd: analysis.estimatedCostUsd,
    },
    careerRoadmap: analysis.analysis.careerRoadmap,
  });

  return NextResponse.json({ id: String(doc._id) }, { status: 201 });
}
