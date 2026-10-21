import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const root = process.cwd();
const results = [];

function record(id, ok, note = "") {
  results.push({ id, ok, note });
  console.log(`${ok ? "OK" : "NG"} | ${id}${note ? " — " + note : ""}`);
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

// --- static / source checks ---
const intro = read("app/components/diagnosis/DiagnosisResultIntro.tsx");
record(
  "P1-source",
  intro.includes("しんだん かんりょう！") && !intro.includes("てんしょく せいこう！"),
  "DiagnosisResultIntro heading",
);

const form = read("app/components/diagnosis/DiagnosisForm.tsx");
const features = read("app/components/FeaturesSection.tsx");
const faq = read("app/components/FaqSection.tsx");
record(
  "P2-source",
  form.includes("約3分") &&
    !form.includes("約1分") &&
    features.includes("3分") &&
    faq.includes("約3分です"),
  "LP + form time copy",
);

const prompt = read("lib/diagnosis/analyzeCareer.ts");
record(
  "P3-prompt",
  prompt.includes("今日やること") && prompt.includes("所要時間"),
  "nextSteps prompt rules",
);
record(
  "P3-ui",
  read("app/components/diagnosis/NextStepsList.tsx").includes("きょうやること") &&
    read("app/diagnosis/result/page.tsx").includes("NextStepsList") &&
    read("app/diagnosis/[id]/page.tsx").includes("NextStepsList"),
  "NextStepsList wired",
);

record(
  "P4-prompt",
  prompt.includes("労働条件") &&
    prompt.includes("断定") &&
    prompt.includes("求人ごと"),
  "labor condition rules",
);

const disclaimer = read("app/components/diagnosis/DiagnosisDisclaimer.tsx");
const disclaimerText = "AIによる参考提案であり、適性や就職を保証するものではありません";
record(
  "P5-source",
  disclaimer.includes(disclaimerText) &&
    read("app/diagnosis/result/page.tsx").includes("DiagnosisDisclaimer") &&
    read("app/diagnosis/[id]/page.tsx").includes("DiagnosisDisclaimer"),
  "disclaimer component wired",
);

// --- browser checks (public + auth gate) ---
const browser = await chromium.launch({ headless: true, channel: "msedge" });
const page = await browser.newPage();
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(String(e)));

await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
const lpText = await page.evaluate(() => document.body.innerText);
// FAQの「約3分です」はアコーディオン内のため、特徴の「3分」でUI確認
record("P2-lp-ui", lpText.includes("たった5問・3分で完了"), "LP features shows 3 min");
record("LP-alive", lpText.includes("5問でわかる、あなたのキャリア"), "home loaded");

await page.goto(`${BASE}/diagnosis`, { waitUntil: "networkidle" });
const onSignin = page.url().includes("/auth/signin");
record("auth-gate", onSignin, `url=${page.url()}`);

// Render disclaimer + next steps components via a tiny evaluation of source presence in client bundle is hard;
// instead open result without auth (should redirect) and confirm no crash.
await page.goto(`${BASE}/diagnosis/result`, { waitUntil: "networkidle" });
record(
  "result-gate",
  page.url().includes("/auth/signin"),
  `url=${page.url()}`,
);

record("no-page-error", pageErrors.length === 0, `errors=${pageErrors.length}`);

await browser.close();

const ng = results.filter((r) => !r.ok);
console.log("\n=== SUMMARY ===");
console.log(`OK: ${results.filter((r) => r.ok).length}/${results.length}, NG: ${ng.length}`);
if (ng.length) {
  ng.forEach((r) => console.log(` - ${r.id}: ${r.note}`));
  process.exit(1);
}
console.log("Manual remainders: login後に結果画面で P1見出し / P3きょうやること / P5免責 / 再診断でP4文面");
process.exit(0);
