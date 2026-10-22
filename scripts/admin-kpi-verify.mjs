/**
 * KPI/ファネルの純関数ロジック検証（DB不要）
 */

function pct(n, d) {
  if (d <= 0) return null;
  return Math.round((n / d) * 1000) / 10;
}

function changeRatio(current, previous) {
  if (previous <= 0) {
    return { value: null, reason: "比較不能（前期データ不足）" };
  }
  return {
    value: Math.round(((current - previous) / previous) * 1000) / 10,
    reason: null,
  };
}

/** 起点コホート: 順序制約付き到達カウント */
function cohortReach(sessionEvents, funnelEvents) {
  const counts = funnelEvents.map(() => 0);
  for (const has of sessionEvents) {
    let ok = true;
    for (let i = 0; i < funnelEvents.length; i++) {
      if (i === 0) {
        counts[i] += 1;
        continue;
      }
      if (ok && has.has(funnelEvents[i])) {
        counts[i] += 1;
      } else {
        ok = false;
      }
    }
  }
  return counts;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const FUNNEL = [
  "landing_viewed",
  "login_completed",
  "diagnosis_started",
  "diagnosis_answered",
  "diagnosis_completed",
  "result_viewed",
];

// changeRatio
assert(changeRatio(10, 0).value === null, "prev0 should be null");
assert(changeRatio(12, 10).value === 20, "12/10 = +20%");
assert(changeRatio(8, 10).value === -20, "8/10 = -20%");

// pct
assert(pct(1, 0) === null, "pct denom0");
assert(pct(1, 4) === 25, "pct 25");

// 後段が前段を超えない
const sessions = [
  new Set(FUNNEL),
  new Set(["landing_viewed", "login_completed"]),
  new Set(["landing_viewed"]),
  // 順序崩れ: completed だけあっても前段欠落なら途中で止まる
  new Set(["landing_viewed", "diagnosis_completed", "result_viewed"]),
];
const counts = cohortReach(sessions, FUNNEL);
for (let i = 1; i < counts.length; i++) {
  assert(counts[i] <= counts[i - 1], `monotonic fail at ${i}: ${counts}`);
}
assert(counts[0] === 4, "cohort size");
assert(counts[1] === 2, "login reached");
assert(counts[4] === 1, "completed only full path");
assert(counts[5] === 1, "result only full path");

console.log("admin-kpi-verify: OK", { counts });
