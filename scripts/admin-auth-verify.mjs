/**
 * 管理APIの未ログイン拒否を確認する。
 * 一般ユーザー/管理者の実ログインは手動（未確認）。
 */
const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");

const endpoints = [
  "/api/admin/analytics",
  "/api/admin/users",
  "/api/admin/errors",
  "/api/admin/analytics/csv",
];

let failed = 0;
for (const path of endpoints) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  const ok = res.status === 401 || res.status === 403;
  console.log(`${ok ? "OK" : "NG"} | ${path} status=${res.status}`);
  if (!ok) failed += 1;
}

const adminPage = await fetch(`${BASE}/admin`, { redirect: "manual" });
console.log(
  `INFO | /admin status=${adminPage.status} (未ログインはsigninへ or 307/302)`,
);

if (failed) {
  console.error(`Failed: ${failed}`);
  process.exit(1);
}
console.log("Admin API unauthenticated rejection: OK");
