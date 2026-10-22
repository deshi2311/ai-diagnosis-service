import mongoose from "mongoose";
import { AnalyticsEvent } from "@/lib/models/AnalyticsEvent";
import {
  FUNNEL_EVENTS,
  type FunnelEventName,
} from "@/lib/analytics/constants";
import { connectMongo } from "@/lib/mongoose";

type TrackInput = {
  event: FunnelEventName;
  anonymousSessionId: string;
  dedupeKey: string;
  userId?: string | null;
  diagnosisId?: string | null;
  testRunId?: string | null;
  meta?: Record<string, unknown>;
};

function sanitizeMeta(meta?: Record<string, unknown>) {
  if (!meta) return {};
  const blocked = new Set([
    "email",
    "name",
    "password",
    "token",
    "cookie",
    "authorization",
    "answers",
    "answer",
    "q1",
    "q2",
    "q3",
    "q4",
    "q5",
  ]);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (blocked.has(k.toLowerCase())) continue;
    if (typeof v === "string" && v.length > 200) continue;
    out[k] = v;
  }
  return out;
}

export async function trackAnalyticsEvent(input: TrackInput) {
  if (!FUNNEL_EVENTS.includes(input.event)) {
    throw new Error("invalid event");
  }
  await connectMongo();
  await AnalyticsEvent.updateOne(
    { dedupeKey: input.dedupeKey },
    {
      $setOnInsert: {
        event: input.event,
        anonymousSessionId: input.anonymousSessionId,
        userId: input.userId ? new mongoose.Types.ObjectId(input.userId) : null,
        diagnosisId: input.diagnosisId
          ? new mongoose.Types.ObjectId(input.diagnosisId)
          : null,
        dedupeKey: input.dedupeKey,
        testRunId: input.testRunId ?? null,
        meta: sanitizeMeta(input.meta),
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );
}

export function tokyoDateKey(d = new Date()) {
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Tokyo" });
}
