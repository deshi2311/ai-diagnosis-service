import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  ensureAnonymousSessionId,
  isValidAnonymousSessionId,
} from "@/lib/analytics/session";
import { trackAnalyticsEvent, tokyoDateKey } from "@/lib/analytics/track";
import {
  FUNNEL_EVENTS,
  type FunnelEventName,
} from "@/lib/analytics/constants";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: {
    event?: string;
    diagnosisId?: string;
    testRunId?: string;
    meta?: Record<string, unknown>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = body.event as FunnelEventName;
  // サーバー専用イベントはクライアントから受け付けない
  const clientAllowed: FunnelEventName[] = [
    "landing_viewed",
    "diagnosis_started",
    "result_viewed",
  ];
  if (!FUNNEL_EVENTS.includes(event) || !clientAllowed.includes(event)) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  // クライアント指定のsessionIdは信用しない
  const sid = await ensureAnonymousSessionId();
  if (!isValidAnonymousSessionId(sid)) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  const session = await auth();
  const userId = session?.user?.id ?? null;
  const day = tokyoDateKey();

  let dedupeKey = `${event}:${sid}:${day}`;
  if (event === "login_completed" && userId) {
    dedupeKey = `login_completed:${sid}:${userId}`;
  }
  if (event === "diagnosis_started" && userId) {
    dedupeKey = `diagnosis_started:${sid}:${userId}:${day}`;
  }
  if (event === "result_viewed" && body.diagnosisId && userId) {
    dedupeKey = `result_viewed:${body.diagnosisId}:${userId}`;
  }
  if (body.testRunId && typeof body.testRunId === "string") {
    dedupeKey = `${dedupeKey}:test:${body.testRunId.slice(0, 64)}`;
  }

  try {
    await trackAnalyticsEvent({
      event,
      anonymousSessionId: sid,
      userId,
      diagnosisId: body.diagnosisId,
      testRunId: body.testRunId,
      dedupeKey,
      meta: { ...(body.meta ?? {}), path: body.meta?.path },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("analytics event", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
