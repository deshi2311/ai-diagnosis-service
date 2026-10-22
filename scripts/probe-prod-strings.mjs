import { chromium } from "playwright-core";

const BASE = "https://ai-diagnosis-service-one.vercel.app";
const needles = [
  "しんだん かんりょう",
  "きょうやること",
  "適性や就職を保証するものではありません",
  "約3分",
  "てんしょく せいこう",
  "DiagnosisResultIntro",
  "DiagnosisDisclaimer",
  "NextStepsList",
  "労働条件",
];

const browser = await chromium.launch({ headless: true, channel: "msedge" });
const page = await browser.newPage();

const routes = ["/diagnosis", "/diagnosis/result"];
const chunkSet = new Set();
const rscHits = {};

for (const route of routes) {
  const res = await page.request.get(BASE + route, {
    headers: { RSC: "1", "Next-Url": route },
  });
  const body = await res.text();
  rscHits[route] = needles.filter((n) => body.includes(n));
  for (const m of body.matchAll(/\/_next\/static\/chunks\/[A-Za-z0-9._-]+\.js/g)) {
    chunkSet.add(BASE + m[0]);
  }
  console.log("RSC", route, "len", body.length, "hits", rscHits[route]);
}

console.log("chunks from RSC", [...chunkSet].map((u) => u.split("/").pop()));

const chunkHits = {};
for (const url of chunkSet) {
  const body = await (await page.request.get(url)).text();
  const hit = needles.filter((n) => body.includes(n));
  if (hit.length) chunkHits[url.split("/").pop()] = hit;
}
console.log("chunkHits", chunkHits);

// Homepage chunk that previously had 約3分 / typing
await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
const homeSrcs = await page.$$eval("script[src]", (ss) => ss.map((s) => s.src));
const homeHits = {};
for (const src of homeSrcs) {
  if (!src.includes("/_next/static/chunks/")) continue;
  const body = await (await page.request.get(src)).text();
  const hit = needles.filter((n) => body.includes(n));
  if (hit.length) homeHits[src.split("/").pop()] = hit;
}
console.log("homeHits", homeHits);

await browser.close();

const summary = {
  P1: Object.values(chunkHits).flat().includes("しんだん かんりょう") ||
    Object.values(homeHits).flat().includes("しんだん かんりょう") ||
    Object.values(rscHits).flat().includes("しんだん かんりょう"),
  P2: Object.values(homeHits).flat().includes("約3分") ||
    Object.values(chunkHits).flat().includes("約3分"),
  P3: Object.values(chunkHits).flat().includes("きょうやること") ||
    Object.values(rscHits).flat().includes("きょうやること"),
  P5: Object.values(chunkHits).flat().includes("適性や就職を保証するものではありません") ||
    Object.values(rscHits).flat().includes("適性や就職を保証するものではありません"),
  OLD: Object.values({ ...chunkHits, ...homeHits }).flat().includes("てんしょく せいこう"),
  Vercel: "success per gh status on 5c21853",
};
console.log("\nSUMMARY", summary);
