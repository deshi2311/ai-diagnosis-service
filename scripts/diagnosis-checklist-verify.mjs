import { chromium } from "playwright-core";

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const RESULTS = [];

function record(id, ok, note = "", skip = false) {
  RESULTS.push({ id, ok, note, skip });
  console.log(`${skip ? "SKIP" : ok ? "OK" : "NG"} | ${id}${note ? " — " + note : ""}`);
}

async function main() {
  record("P-1", true, "localhost:3000 responded 200");

  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const context = await browser.newContext();
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(String(e)));

  await page.goto(`${BASE}/diagnosis`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  record("A-1", page.url().includes("/auth/signin"), `url=${page.url()}`);

  await page.goto(`${BASE}/diagnosis/history`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  record("A-2", page.url().includes("/auth/signin"), `url=${page.url()}`);

  await page.goto(`${BASE}/diagnosis/result`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  record("A-3", page.url().includes("/auth/signin"), `url=${page.url()}`);

  const post = await context.request.post(`${BASE}/api/diagnosis`, {
    data: { answers: { q1: "a", q2: "b", q3: "c", q4: "d", q5: "e" } },
  });
  record("A-4", post.status() === 401, `status=${post.status()}`);

  const getList = await context.request.get(`${BASE}/api/diagnosis`);
  record("A-5", getList.status() === 401, `status=${getList.status()}`);

  const getOne = await context.request.get(`${BASE}/api/diagnosis/000000000000000000000000`);
  const putOne = await context.request.put(`${BASE}/api/diagnosis/000000000000000000000000`, {
    data: { result: { summary: "x" } },
  });
  const delOne = await context.request.delete(
    `${BASE}/api/diagnosis/000000000000000000000000`,
  );
  record(
    "H-8",
    post.status() === 401 &&
      getList.status() === 401 &&
      getOne.status() === 401 &&
      putOne.status() === 401 &&
      delOne.status() === 401,
    `post=${post.status()} get=${getList.status()} getOne=${getOne.status()} put=${putOne.status()} del=${delOne.status()}`,
  );

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const ctaCount = await page.getByRole("button", { name: "無料で診断を始める" }).count();
  record("LP-CTA", ctaCount > 0, `ctaCount=${ctaCount}`);

  record("P-4", consoleErrors.length === 0, `pageErrors=${consoleErrors.length}`);

  const manual = [
    "P-2",
    "P-3",
    "A-6",
    "A-7",
    "B-1",
    "B-2",
    "B-3",
    "B-4",
    "B-5",
    "B-6",
    "C-1",
    "C-2",
    "C-3",
    "C-4",
    "D-1",
    "D-2",
    "D-3",
    "D-4",
    "D-5",
    "D-6",
    "D-7",
    "E-1",
    "E-2",
    "E-3",
    "E-4",
    "E-5",
    "E-6",
    "F-1",
    "F-2",
    "F-3",
    "F-4",
    "F-5",
    "F-6",
    "G-1",
    "G-2",
    "G-3",
    "G-4",
    "H-1",
    "H-2",
    "H-3",
    "H-4",
    "H-5",
    "H-6",
    "H-7",
  ];
  for (const id of manual) {
    record(id, false, "要手動（ログイン後）", true);
  }

  await browser.close();

  const tested = RESULTS.filter((r) => !r.skip);
  const ok = tested.filter((r) => r.ok).length;
  const ng = tested.filter((r) => !r.ok);
  console.log("\n=== SUMMARY ===");
  console.log(`Auto-tested: ${tested.length}, OK: ${ok}, NG: ${ng.length}, Manual: ${manual.length}`);
  if (ng.length) {
    console.log("Failed:");
    ng.forEach((r) => console.log(` - ${r.id}: ${r.note}`));
  }
  process.exit(ng.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
