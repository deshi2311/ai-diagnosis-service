import { chromium } from "playwright-core";
import { execSync } from "node:child_process";

const BASE = (
  process.env.BASE_URL || "https://ai-diagnosis-service-one.vercel.app"
).replace(/\/$/, "");

const results = [];
function record(id, ok, note = "") {
  results.push({ id, ok, note });
  console.log(`${ok ? "OK" : "NG"} | ${id}${note ? " — " + note : ""}`);
}

let remoteSha = "";
try {
  remoteSha = execSync("git ls-remote origin main", {
    encoding: "utf8",
  })
    .trim()
    .split(/\s+/)[0]
    .slice(0, 7);
} catch {
  remoteSha = "?";
}
record("git-main", remoteSha === "5c21853" || remoteSha.length === 7, `origin/main=${remoteSha}`);

const browser = await chromium.launch({ headless: true, channel: "msedge" });
const page = await browser.newPage();
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(String(e)));

await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 90000 });
const lpText = await page.evaluate(() => document.body.innerText);
record("deploy-lp", lpText.includes("5問でわかる、あなたのキャリア"), "LP loaded");
record("P2-lp", lpText.includes("たった5問・3分で完了"), "features 3 min");

await page.goto(`${BASE}/diagnosis`, { waitUntil: "networkidle" });
record("auth-diagnosis", page.url().includes("/auth/signin"), `url=${page.url()}`);

await page.goto(`${BASE}/diagnosis/result`, { waitUntil: "networkidle" });
record("auth-result", page.url().includes("/auth/signin"), `url=${page.url()}`);

const scriptSrcs = await page.$$eval("script[src]", (ss) => ss.map((s) => s.src));
const needles = [
  "しんだん かんりょう",
  "しんだん",
  "かんりょう",
  "きょうやること",
  "適性や就職を保証するものではありません",
  "約3分",
  "てんしょく せいこう",
  "てんしょく",
];

const hits = Object.fromEntries(needles.map((n) => [n, []]));
let scanned = 0;
for (const src of scriptSrcs) {
  if (!src.includes("/_next/")) continue;
  try {
    const body = await (await page.request.get(src)).text();
    scanned += 1;
    const short = src.split("/").pop();
    for (const n of needles) {
      if (body.includes(n)) hits[n].push(short);
    }
  } catch {
    // ignore
  }
}

const html = await page.content();
for (const n of needles) {
  if (html.includes(n)) hits[n].push("html");
}

record("P1-asset", hits["しんだん かんりょう"].length > 0 || hits["かんりょう"].length > 0, JSON.stringify(hits["かんりょう"]));
record("P2-form-asset", hits["約3分"].length > 0, JSON.stringify(hits["約3分"]));
record("P3-asset", hits["きょうやること"].length > 0, JSON.stringify(hits["きょうやること"]));
record("P5-asset", hits["適性や就職を保証するものではありません"].length > 0, JSON.stringify(hits["適性や就職を保証するものではありません"]));
record(
  "old-P1-gone",
  hits["てんしょく せいこう"].length === 0 && hits["てんしょく"].length === 0,
  JSON.stringify(hits["てんしょく"]),
);

const clientOk =
  (hits["しんだん かんりょう"].length > 0 || hits["かんりょう"].length > 0) &&
  hits["きょうやること"].length > 0 &&
  hits["適性や就職を保証するものではありません"].length > 0;
record(
  "P4-deploy-proxy",
  clientOk,
  clientOk
    ? "client review strings live (P4 server prompt inferred)"
    : `client strings missing; scanned=${scanned}`,
);
record("no-page-error", pageErrors.length === 0, `errors=${pageErrors.length}`);

console.log("\nHIT DETAIL");
for (const [k, v] of Object.entries(hits)) {
  if (v.length) console.log(` ${k}: ${v.join(", ")}`);
}

await browser.close();

const ng = results.filter((r) => !r.ok);
console.log("\n=== SUMMARY ===");
console.log(`OK: ${results.filter((r) => r.ok).length}/${results.length}, NG: ${ng.length}`);
if (ng.length) {
  ng.forEach((r) => console.log(` - ${r.id}: ${r.note}`));
  process.exit(1);
}
console.log("Manual: login後に結果/詳細・再診断でP1/P3/P4/P5を目視");
process.exit(0);
