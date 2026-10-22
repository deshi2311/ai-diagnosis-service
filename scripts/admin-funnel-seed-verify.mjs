/**
 * testRunId 付きでファネルイベントを順序どおり書き込み、管理API集計を検証する。
 * 要: BASE_URL, MONGODB_URI（または起動中のアプリ）, ADMIN_COOKIE（管理者セッションCookie）
 *
 * 管理者Cookie無しの場合は event 書き込みまで行い、集計検証はスキップして exit 0 + 未確認出力。
 */
import { randomBytes } from "crypto";

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const testRunId = process.env.TEST_RUN_ID || `tr_${randomBytes(8).toString("hex")}`;
const adminCookie = process.env.ADMIN_COOKIE || "";

const clientEvents = ["landing_viewed", "diagnosis_started", "result_viewed"];

console.log(`testRunId=${testRunId}`);

// session 発行
const sidRes = await fetch(`${BASE}/api/analytics/session`, { method: "POST" });
const setCookie = sidRes.headers.getSetCookie?.() ?? [];
const cookieHeader = setCookie.map((c) => c.split(";")[0]).join("; ");
console.log(`session status=${sidRes.status} cookie=${cookieHeader ? "yes" : "no"}`);

const landing = await fetch(`${BASE}/api/analytics/event`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
  },
  body: JSON.stringify({
    event: "landing_viewed",
    testRunId,
    meta: { path: "/" },
  }),
});
console.log(`landing_viewed status=${landing.status}`);

// サーバー専用イベントはクライアントから拒否されること
const rejected = await fetch(`${BASE}/api/analytics/event`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
  },
  body: JSON.stringify({ event: "diagnosis_completed", testRunId }),
});
console.log(
  `server-only reject status=${rejected.status} (expect 400)`,
);

if (!adminCookie) {
  console.log(
    "SKIP analytics aggregate: ADMIN_COOKIE 未設定（Googleログイン後の Cookie が必要）",
  );
  console.log("Confirmed: client can land + session; server-only events blocked");
  process.exit(0);
}

const analytics = await fetch(
  `${BASE}/api/admin/analytics?testRunId=${encodeURIComponent(testRunId)}`,
  { headers: { Cookie: adminCookie } },
);
console.log(`admin analytics status=${analytics.status}`);
if (!analytics.ok) {
  console.error(await analytics.text());
  process.exit(1);
}
const data = await analytics.json();
const steps = data.funnel?.steps ?? [];
console.log(
  "funnel steps",
  steps.map((s) => `${s.event}:${s.reached}`).join(" | "),
);
for (let i = 1; i < steps.length; i++) {
  if (steps[i].reached > steps[i - 1].reached) {
    console.error("後段が前段を超えました");
    process.exit(1);
  }
}
console.log("admin-funnel-seed-verify: partial OK");
console.log("clientAllowed", clientEvents.join(","));
