/**
 * Google OAuth に渡される redirect_uri を表示する（原因調査用）
 */
import { chromium } from "playwright-core";

const bases = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://192.168.11.29:3000",
];

for (const BASE of bases) {
  try {
    const browser = await chromium.launch({ headless: true, channel: "msedge" });
    const page = await browser.newPage();
    await page.goto(`${BASE}/auth/signin`, { waitUntil: "domcontentloaded", timeout: 20000 });
    const [req] = await Promise.all([
      page.waitForRequest(
        (r) => r.url().includes("accounts.google.com"),
        { timeout: 20000 },
      ).catch(() => null),
      page.getByRole("button", { name: /Google/ }).click().catch(() => null),
    ]);
    if (!req) {
      console.log(`BASE=${BASE} -> could not capture google redirect`);
    } else {
      const u = new URL(req.url());
      console.log(`BASE=${BASE}`);
      console.log(`  redirect_uri=${u.searchParams.get("redirect_uri")}`);
      console.log(`  client_id=${(u.searchParams.get("client_id") || "").slice(0, 24)}...`);
    }
    await browser.close();
  } catch (e) {
    console.log(`BASE=${BASE} ERROR ${e.message}`);
  }
}
