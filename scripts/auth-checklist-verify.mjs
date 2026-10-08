import { chromium } from "playwright-core";
import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const RESULTS = [];

function record(id, ok, note = "", skip = false) {
  RESULTS.push({ id, ok, note, skip });
  const mark = skip ? "SKIP" : ok ? "OK" : "NG";
  console.log(`${mark} | ${id}${note ? " — " + note : ""}`);
}

async function main() {
  const envPath = path.join(process.cwd(), ".env.local");
  const envText = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  const keys = Object.fromEntries(
    envText
      .split(/\r?\n/)
      .filter((l) => /^[A-Z_]+=/.test(l))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i), l.slice(i + 1).trim()];
      }),
  );
  const required = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "AUTH_SECRET", "MONGODB_URI"];
  const missing = required.filter((k) => !keys[k]);
  record("P-2", missing.length === 0, missing.length ? `missing=${missing.join(",")}` : "required keys present");

  // P-3 Mongo
  try {
    const client = new MongoClient(keys.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    await client.connect();
    await client.db().command({ ping: 1 });
    await client.close();
    record("P-3", true, "mongo ping OK");
  } catch (e) {
    record("P-3", false, String(e.message || e));
  }

  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const context = await browser.newContext();
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => consoleErrors.push(String(e)));

  const home = await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  record("P-1", !!home && home.ok(), `status=${home?.status()}`);

  const lpText = await page.locator("body").innerText();
  record("H-4", lpText.includes("5問でわかる") || lpText.includes("AIキャリア診断"), "LP visible without login");

  const hasLogin =
    (await page.getByRole("link", { name: "ログイン" }).count()) > 0 ||
    (await page.getByRole("button", { name: "ログイン" }).count()) > 0 ||
    lpText.includes("ログイン");
  record("G-5", hasLogin, "header shows ログイン when logged out");

  const signinRes = await page.goto(`${BASE}/auth/signin`, { waitUntil: "networkidle" });
  record("A-1", !!signinRes && signinRes.ok() && page.url().includes("/auth/signin"), `url=${page.url()}`);
  const signinText = await page.locator("body").innerText();
  record("A-2", signinText.includes("ログイン"), "heading/description");
  const googleBtn = page.getByRole("button", { name: "Googleでログイン" });
  record("A-3", (await googleBtn.count()) > 0, "Google login button");
  record("A-4", (await page.getByRole("link", { name: /トップ/ }).count()) > 0, "back to top link");

  // B-1: should leave for Google (or stay on google accounts)
  await googleBtn.click();
  try {
    await page.waitForURL(/accounts\.google\.com|google\.com\/o\/oauth|google\.com\/signin/, {
      timeout: 20000,
    });
    record("B-1", true, `url=${page.url().slice(0, 120)}`);
  } catch {
    record("B-1", false, `url=${page.url()}`);
  }

  await context.close();
  const context2 = await browser.newContext();
  const page2 = await context2.newPage();

  // H-1 / H-2: follow redirects and expect signin
  await page2.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  await page2.waitForTimeout(400);
  record("H-1", page2.url().includes("/auth/signin"), `url=${page2.url()}`);

  await page2.goto(`${BASE}/profile`, { waitUntil: "networkidle" });
  await page2.waitForTimeout(400);
  const profileUrl = page2.url();
  record("H-2", profileUrl.includes("/auth/signin"), `url=${profileUrl}`);
  record(
    "H-3",
    profileUrl.includes("callbackUrl") || decodeURIComponent(profileUrl).includes("profile"),
    `url=${profileUrl}`,
  );

  const api = await context2.request.get(`${BASE}/api/user/profile`);
  record("H-5", api.status() === 401, `status=${api.status()}`);

  await page2.goto(`${BASE}/auth/signin`, { waitUntil: "networkidle" });
  const fatal = consoleErrors.filter(
    (e) => /crypto|edge runtime|Configuration|AdapterError/i.test(e),
  );
  record("P-5", fatal.length === 0, `fatal=${fatal.length} totalConsole=${consoleErrors.length}`);

  // Manual: require real Google account session
  const manual = [
    "P-4",
    "A-5",
    "B-2",
    "B-3",
    "C-1",
    "C-2",
    "C-3",
    "D-1",
    "D-2",
    "D-3",
    "D-4",
    "D-5",
    "E-1",
    "E-2",
    "E-3",
    "E-4",
    "E-5",
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
    "I-1",
    "I-2",
    "I-3",
    "I-4",
    "I-5",
  ];
  for (const id of manual) {
    record(id, false, "要手動（Google実ログイン後）", true);
  }

  await browser.close();

  const tested = RESULTS.filter((r) => !r.skip);
  const ok = tested.filter((r) => r.ok);
  const ng = tested.filter((r) => !r.ok);
  console.log("\n=== SUMMARY ===");
  console.log(`Auto-tested: ${tested.length}, OK: ${ok.length}, NG: ${ng.length}, Manual-needed: ${manual.length}`);
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
