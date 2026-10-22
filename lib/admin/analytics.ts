import mongoose from "mongoose";
import { Diagnosis } from "@/lib/models/Diagnosis";
import { AnalyticsEvent } from "@/lib/models/AnalyticsEvent";
import { AdminErrorLog } from "@/lib/models/AdminErrorLog";
import { connectMongo } from "@/lib/mongoose";
import mongoClient from "@/lib/mongodb";
import {
  FUNNEL_CONVERSION_DAYS,
  FUNNEL_EVENTS,
  ANALYTICS_TZ,
} from "@/lib/analytics/constants";
import { addTokyoDays, parsePeriod, startOfTokyoDay } from "@/lib/admin/timezone";

export type Granularity = "day" | "week" | "month";

function pct(n: number, d: number) {
  if (d <= 0) return null;
  return Math.round((n / d) * 1000) / 10;
}

function changeRatio(current: number, previous: number) {
  if (previous <= 0) {
    return { value: null as number | null, reason: "比較不能（前期データ不足）" };
  }
  return {
    value: Math.round(((current - previous) / previous) * 1000) / 10,
    reason: null as string | null,
  };
}

async function countDiagnoses(start: Date, end: Date) {
  return Diagnosis.countDocuments({
    createdAt: { $gte: start, $lt: end },
  });
}

async function activeUsers(start: Date, end: Date) {
  const rows = await Diagnosis.aggregate<{ n: number }>([
    { $match: { createdAt: { $gte: start, $lt: end } } },
    { $group: { _id: "$userId" } },
    { $count: "n" },
  ]);
  return rows[0]?.n ?? 0;
}

export async function buildAnalyticsPayload(options: {
  from?: string | null;
  to?: string | null;
  granularity?: Granularity;
  testRunId?: string | null;
}) {
  await connectMongo();
  const { start, end } = parsePeriod(options.from, options.to);
  const granularity = options.granularity ?? "day";
  const todayStart = startOfTokyoDay();
  const tomorrow = addTokyoDays(todayStart, 1);
  const yesterdayStart = addTokyoDays(todayStart, -1);
  const weekAgoStart = addTokyoDays(todayStart, -7);
  const prevWeekStart = addTokyoDays(todayStart, -14);

  const [
    todayCount,
    yesterdayCount,
    totalCount,
    weekCount,
    prevWeekCount,
    active,
    recent,
    strengthDist,
    jobTop,
  ] = await Promise.all([
    countDiagnoses(todayStart, tomorrow),
    countDiagnoses(yesterdayStart, todayStart),
    Diagnosis.countDocuments({}),
    countDiagnoses(weekAgoStart, tomorrow),
    countDiagnoses(prevWeekStart, weekAgoStart),
    activeUsers(start, end),
    Diagnosis.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .select("_id userId result.strengthType result.summary createdAt")
      .lean(),
    Diagnosis.aggregate<{ _id: string; count: number }>([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      { $group: { _id: "$result.strengthType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]),
    Diagnosis.aggregate<{ _id: string; count: number }>([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      { $unwind: "$result.suitableJobs" },
      { $group: { _id: "$result.suitableJobs", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  const format =
    granularity === "month"
      ? "%Y-%m"
      : granularity === "week"
        ? "%G-W%V"
        : "%Y-%m-%d";

  const trend = await Diagnosis.aggregate<{ _id: string; count: number }>([
    { $match: { createdAt: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: {
          $dateToString: { format, date: "$createdAt", timezone: ANALYTICS_TZ },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const answerSamples = await Diagnosis.find({ createdAt: { $gte: start, $lt: end } })
    .select("answers")
    .limit(200)
    .lean();

  const tendency = buildAnswerTendency(answerSamples);

  const [funnel, funnelUser] = await Promise.all([
    buildSessionFunnel({
      start,
      end,
      testRunId: options.testRunId,
    }),
    buildUserFunnel({
      start,
      end,
      testRunId: options.testRunId,
    }),
  ]);

  const openErrors = await AdminErrorLog.countDocuments({ status: "open" });

  let dbOk = false;
  let dbMs = 0;
  const t0 = Date.now();
  try {
    await mongoClient.db().command({ ping: 1 });
    dbOk = true;
    dbMs = Date.now() - t0;
  } catch {
    dbMs = Date.now() - t0;
  }

  const dayChange = changeRatio(todayCount, yesterdayCount);
  const weekChange = changeRatio(weekCount, prevWeekCount);

  return {
    timezone: ANALYTICS_TZ,
    period: { start: start.toISOString(), end: end.toISOString() },
    granularity,
    conversionWindowDays: FUNNEL_CONVERSION_DAYS,
    updatedAt: new Date().toISOString(),
    refresh: "画面表示時および手動更新",
    kpi: {
      todayDiagnoses: {
        value: todayCount,
        judge: "本日の利用が平常か",
        next: "急減→エラーログ・診断APIを確認",
      },
      totalDiagnoses: {
        value: totalCount,
        judge: "累計成長",
        next: "長期停滞→施策検討",
      },
      activeUsers: {
        value: active,
        judge: "期間内の利用者の厚み",
        next: "減少→導線・CTA確認",
        periodNote: "選択期間内に診断した distinct userId",
      },
      completionRate: {
        value: funnel.steps[4] && funnel.steps[2]
          ? pct(funnel.steps[4].reached, funnel.steps[2].reached)
          : null,
        judge: "開始後の完了落ち",
        next: "質問負荷・API失敗を調査",
        note: "同一sessionコホートの diagnosis_completed / diagnosis_started",
      },
      dayOverDay: dayChange,
      weekOverWeek: weekChange,
    },
    trend: trend.map((r) => ({ bucket: r._id, count: r.count })),
    distribution: {
      strengthType: strengthDist.map((r) => ({
        label: r._id || "(未設定)",
        count: r.count,
      })),
    },
    answerTendency: tendency,
    topCareerPaths: jobTop.map((r) => ({ path: r._id, count: r.count })),
    recentDiagnoses: recent.map((d) => ({
      id: String(d._id),
      userId: String(d.userId),
      strengthType: d.result?.strengthType ?? "",
      summary: (d.result?.summary ?? "").slice(0, 80),
      createdAt: d.createdAt,
    })),
    funnel,
    funnelUser,
    system: {
      db: { ok: dbOk, latencyMs: dbMs },
      openErrorCount: openErrors,
      diagnosisApi: { note: "診断APIは利用時に計測。常時ヘルスは未実装", ok: null },
    },
    empty: totalCount === 0,
  };
}

function buildAnswerTendency(
  docs: { answers?: { q1?: string; q2?: string; q3?: string; q5?: string } }[],
) {
  const buckets = {
    purpose: countTokens(docs.map((d) => d.answers?.q1 ?? "")),
    values: countTokens(docs.map((d) => d.answers?.q2 ?? "")),
    experience: countTokens(docs.map((d) => d.answers?.q3 ?? "")),
    future: countTokens(docs.map((d) => d.answers?.q5 ?? "")),
  };
  return buckets;
}

function countTokens(texts: string[]) {
  const map = new Map<string, number>();
  for (const t of texts) {
    const parts = t
      .split(/[\s、。,.！？!?\n/]+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 2 && s.length <= 20);
    for (const p of parts.slice(0, 8)) {
      map.set(p, (map.get(p) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([term, count]) => ({ term, count }));
}

async function buildSessionFunnel(options: {
  start: Date;
  end: Date;
  testRunId?: string | null;
}) {
  const match: Record<string, unknown> = {
    event: "landing_viewed",
    createdAt: { $gte: options.start, $lt: options.end },
  };
  if (options.testRunId) match.testRunId = options.testRunId;

  const landings = await AnalyticsEvent.find(match)
    .select("anonymousSessionId createdAt")
    .lean();

  const cohort = new Map<string, Date>();
  for (const row of landings) {
    const sid = row.anonymousSessionId;
    const t = row.createdAt ? new Date(row.createdAt) : new Date();
    const prev = cohort.get(sid);
    if (!prev || t < prev) cohort.set(sid, t);
  }

  const sids = [...cohort.keys()];
  const steps = FUNNEL_EVENTS.map((event) => ({
    event,
    reached: 0,
    reachRateFromStart: null as number | null,
    transitionRateFromPrev: null as number | null,
    dropOff: null as number | null,
    dropOffRate: null as number | null,
  }));

  if (sids.length === 0) {
    return {
      unit: "session" as const,
      cohortSize: 0,
      conversionWindowDays: FUNNEL_CONVERSION_DAYS,
      note: "選択期間内にLP閲覧したsessionが母集団。変換期限はLP閲覧から7日以内。",
      maxDropStep: null as string | null,
      guidance: [] as { from: string; to: string; judge: string; next: string }[],
      steps,
      referenceOnly: true,
    };
  }

  const windowMs = FUNNEL_CONVERSION_DAYS * 24 * 60 * 60 * 1000;
  const events = await AnalyticsEvent.find({
    anonymousSessionId: { $in: sids },
    event: { $in: [...FUNNEL_EVENTS] },
    ...(options.testRunId ? { testRunId: options.testRunId } : {}),
  })
    .select("anonymousSessionId event createdAt")
    .lean();

  const bySid = new Map<string, { event: string; at: Date }[]>();
  for (const e of events) {
    const list = bySid.get(e.anonymousSessionId) ?? [];
    list.push({ event: e.event, at: new Date(e.createdAt as Date) });
    bySid.set(e.anonymousSessionId, list);
  }

  const reachedCounts = FUNNEL_EVENTS.map(() => 0);

  for (const [sid, landingAt] of cohort) {
    const list = (bySid.get(sid) ?? []).filter(
      (e) => e.at >= landingAt && e.at.getTime() - landingAt.getTime() <= windowMs,
    );
    const has = new Set(list.map((e) => e.event));
    // 順序制約: 前段を満たさない後段はカウントしない
    let ok = true;
    for (let i = 0; i < FUNNEL_EVENTS.length; i++) {
      const ev = FUNNEL_EVENTS[i];
      if (i === 0) {
        reachedCounts[i] += 1;
        continue;
      }
      if (ok && has.has(ev)) {
        reachedCounts[i] += 1;
      } else {
        ok = false;
      }
    }
  }

  const startN = reachedCounts[0] || sids.length;
  let maxDrop: { idx: number; rate: number } | null = null;
  const enriched = FUNNEL_EVENTS.map((event, i) => {
    const reached = reachedCounts[i];
    const prev = i === 0 ? startN : reachedCounts[i - 1];
    const dropOff = i === FUNNEL_EVENTS.length - 1 ? null : Math.max(prev - reached, 0);
    const dropOffRate =
      i === FUNNEL_EVENTS.length - 1 ? null : pct(dropOff ?? 0, prev);
    if (dropOffRate != null && (maxDrop == null || dropOffRate > maxDrop.rate)) {
      maxDrop = { idx: i, rate: dropOffRate };
    }
    return {
      event,
      reached,
      reachRateFromStart: pct(reached, startN),
      transitionRateFromPrev: i === 0 ? 100 : pct(reached, prev),
      dropOff,
      dropOffRate,
    };
  });

  // fix maxDrop comparison - TypeScript
  let maxDropStep: string | null = null;
  let best = -1;
  for (let i = 0; i < enriched.length - 1; i++) {
    const r = enriched[i].dropOffRate ?? -1;
    if (r > best) {
      best = r;
      maxDropStep = `${enriched[i].event} → ${enriched[i + 1].event}`;
    }
  }

  const guidance = [
    {
      from: "landing_viewed",
      to: "login_completed",
      judge: "CTAや価値説明が弱いか",
      next: "CTA文言・配置、対象者への説明を見直す",
    },
    {
      from: "login_completed",
      to: "diagnosis_started",
      judge: "ログイン後の案内が分かりにくいか",
      next: "dashboardの診断開始導線を確認する",
    },
    {
      from: "diagnosis_started",
      to: "diagnosis_answered",
      judge: "初問表示や入力UIに障害があるか",
      next: "エラーログ、モバイル入力、表示速度を確認する",
    },
    {
      from: "diagnosis_answered",
      to: "diagnosis_completed",
      judge: "質問数・必須・API失敗が負担か",
      next: "バリデーション、診断APIを調べる",
    },
    {
      from: "diagnosis_completed",
      to: "result_viewed",
      judge: "完了後遷移・結果保存に問題があるか",
      next: "完了レスポンス、結果リンク、権限を確認する",
    },
  ];

  return {
    unit: "session" as const,
    cohortSize: startN,
    conversionWindowDays: FUNNEL_CONVERSION_DAYS,
    note: "選択期間内にLP閲覧したsessionが母集団。変換期限はLP閲覧から7日以内。[start,end) は Asia/Tokyo。",
    maxDropStep,
    guidance,
    steps: enriched,
    referenceOnly: startN < 30,
  };
}

/** user基準: 期間内 login_completed を起点。LP閲覧は対象外（sessionファネルで計測） */
async function buildUserFunnel(options: {
  start: Date;
  end: Date;
  testRunId?: string | null;
}) {
  const userEvents = [
    "login_completed",
    "diagnosis_started",
    "diagnosis_answered",
    "diagnosis_completed",
    "result_viewed",
  ] as const;

  const match: Record<string, unknown> = {
    event: "login_completed",
    createdAt: { $gte: options.start, $lt: options.end },
    userId: { $ne: null },
  };
  if (options.testRunId) match.testRunId = options.testRunId;

  const logins = await AnalyticsEvent.find(match)
    .select("userId createdAt")
    .lean();

  const cohort = new Map<string, Date>();
  for (const row of logins) {
    if (!row.userId) continue;
    const uid = String(row.userId);
    const t = row.createdAt ? new Date(row.createdAt) : new Date();
    const prev = cohort.get(uid);
    if (!prev || t < prev) cohort.set(uid, t);
  }

  const emptySteps = userEvents.map((event) => ({
    event,
    reached: 0,
    reachRateFromStart: null as number | null,
    transitionRateFromPrev: null as number | null,
    dropOff: null as number | null,
    dropOffRate: null as number | null,
  }));

  if (cohort.size === 0) {
    return {
      unit: "user" as const,
      cohortSize: 0,
      conversionWindowDays: FUNNEL_CONVERSION_DAYS,
      note: "期間内にlogin_completedしたuserIdが母集団。LP閲覧は対象外（sessionファネル参照）。変換期限はログインから7日以内。",
      maxDropStep: null as string | null,
      guidance: [] as { from: string; to: string; judge: string; next: string }[],
      steps: emptySteps,
      referenceOnly: true,
    };
  }

  const uids = [...cohort.keys()];
  const oidList = uids
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  const windowMs = FUNNEL_CONVERSION_DAYS * 24 * 60 * 60 * 1000;
  const events = await AnalyticsEvent.find({
    userId: { $in: oidList },
    event: { $in: [...userEvents] },
    ...(options.testRunId ? { testRunId: options.testRunId } : {}),
  })
    .select("userId event createdAt")
    .lean();

  const byUser = new Map<string, { event: string; at: Date }[]>();
  for (const e of events) {
    if (!e.userId) continue;
    const uid = String(e.userId);
    const list = byUser.get(uid) ?? [];
    list.push({ event: e.event, at: new Date(e.createdAt as Date) });
    byUser.set(uid, list);
  }

  const reachedCounts = userEvents.map(() => 0);
  for (const [uid, loginAt] of cohort) {
    const list = (byUser.get(uid) ?? []).filter(
      (e) => e.at >= loginAt && e.at.getTime() - loginAt.getTime() <= windowMs,
    );
    const has = new Set(list.map((e) => e.event));
    let ok = true;
    for (let i = 0; i < userEvents.length; i++) {
      if (i === 0) {
        reachedCounts[i] += 1;
        continue;
      }
      if (ok && has.has(userEvents[i])) {
        reachedCounts[i] += 1;
      } else {
        ok = false;
      }
    }
  }

  const startN = reachedCounts[0];
  const enriched = userEvents.map((event, i) => {
    const reached = reachedCounts[i];
    const prev = i === 0 ? startN : reachedCounts[i - 1];
    const dropOff =
      i === userEvents.length - 1 ? null : Math.max(prev - reached, 0);
    return {
      event,
      reached,
      reachRateFromStart: pct(reached, startN),
      transitionRateFromPrev: i === 0 ? 100 : pct(reached, prev),
      dropOff,
      dropOffRate:
        i === userEvents.length - 1 ? null : pct(dropOff ?? 0, prev),
    };
  });

  let maxDropStep: string | null = null;
  let best = -1;
  for (let i = 0; i < enriched.length - 1; i++) {
    const r = enriched[i].dropOffRate ?? -1;
    if (r > best) {
      best = r;
      maxDropStep = `${enriched[i].event} → ${enriched[i + 1].event}`;
    }
  }

  return {
    unit: "user" as const,
    cohortSize: startN,
    conversionWindowDays: FUNNEL_CONVERSION_DAYS,
    note: "期間内にlogin_completedしたuserIdが母集団。LP閲覧は対象外（sessionファネル参照）。変換期限はログインから7日以内。[start,end) は Asia/Tokyo。",
    maxDropStep,
    guidance: [
      {
        from: "login_completed",
        to: "diagnosis_started",
        judge: "ログイン後の案内が分かりにくいか",
        next: "dashboardの診断開始導線を確認する",
      },
      {
        from: "diagnosis_started",
        to: "diagnosis_answered",
        judge: "初問表示や入力UIに障害があるか",
        next: "エラーログ、モバイル入力、表示速度を確認する",
      },
      {
        from: "diagnosis_answered",
        to: "diagnosis_completed",
        judge: "質問数・必須・API失敗が負担か",
        next: "バリデーション、診断APIを調べる",
      },
      {
        from: "diagnosis_completed",
        to: "result_viewed",
        judge: "完了後遷移・結果保存に問題があるか",
        next: "完了レスポンス、結果リンク、権限を確認する",
      },
    ],
    steps: enriched,
    referenceOnly: startN < 30,
  };
}

export async function buildAnalyticsCsv(payload: Awaited<ReturnType<typeof buildAnalyticsPayload>>) {
  const lines = [
    `# exportedAt=${payload.updatedAt}`,
    `# period=${payload.period.start}/${payload.period.end}`,
    `# timezone=${payload.timezone}`,
    `# granularity=${payload.granularity}`,
    "section,key,value",
    `kpi,todayDiagnoses,${payload.kpi.todayDiagnoses.value}`,
    `kpi,totalDiagnoses,${payload.kpi.totalDiagnoses.value}`,
    `kpi,activeUsers,${payload.kpi.activeUsers.value}`,
    `kpi,completionRate,${payload.kpi.completionRate.value ?? ""}`,
    ...payload.trend.map((t) => `trend,${t.bucket},${t.count}`),
    ...payload.topCareerPaths.map((t) => `topCareer,${csvEscape(t.path)},${t.count}`),
    ...payload.funnel.steps.map(
      (s) => `funnel,${s.event},${s.reached}`,
    ),
  ];
  return `\uFEFF${lines.join("\n")}`;
}

function csvEscape(v: string) {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}
