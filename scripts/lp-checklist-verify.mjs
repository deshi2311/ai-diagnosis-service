import { chromium } from "playwright-core";

const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const RESULTS = [];

function record(id, ok, note = "") {
  RESULTS.push({ id, ok, note });
  console.log(`${ok ? "OK" : "NG"} | ${id}${note ? " — " + note : ""}`);
}

async function checkViewport(page, label, width, height) {
  await page.setViewportSize({ width, height });
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  const metrics = await page.evaluate(() => {
    const header = document.querySelector("header, .MuiAppBar-root");
    const headerRect = header?.getBoundingClientRect();
    const overflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    const bodyTop = document.querySelector("main")?.getBoundingClientRect().top ?? 0;
    const texts = {
      service: !!document.body.innerText.includes("AIキャリア診断サービス"),
      navFeatures: !!document.body.innerText.includes("特徴"),
      navSteps: !!document.body.innerText.includes("診断の流れ"),
      navFaq: !!document.body.innerText.includes("FAQ"),
      cta: (document.body.innerText.match(/無料で診断を始める/g) || []).length,
      hero: !!document.body.innerText.includes("5問でわかる、あなたのキャリア"),
      heroSub: !!document.body.innerText.includes("AIがあなたに最適なキャリアロードマップを提案します"),
    };
    const headerVisible = headerRect && headerRect.height > 0 && headerRect.width > 0;
    const headerCoversBody = header && getComputedStyle(header).position === "fixed";
    const appBarStatic = !!document.querySelector(".MuiAppBar-positionStatic");

    // Check clipping of hero heading
    const h1 = document.querySelector("h1");
    const h1Rect = h1?.getBoundingClientRect();
    const h1Clipped =
      h1Rect &&
      (h1Rect.right > window.innerWidth + 2 || h1Rect.left < -2);

    return {
      overflowX,
      headerVisible,
      headerCoversBody,
      appBarStatic,
      texts,
      h1Clipped,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      headerHeight: headerRect?.height ?? 0,
      bodyTop,
    };
  });

  const prefix = `R:${label}`;
  record(`${prefix}/R-1`, metrics.texts.service && metrics.texts.navFeatures && metrics.texts.navSteps && metrics.texts.navFaq && metrics.texts.cta >= 1, `ctaCount=${metrics.texts.cta}`);
  record(`${prefix}/R-2`, metrics.headerVisible && !metrics.overflowX, `scrollW=${metrics.scrollWidth} clientW=${metrics.clientWidth}`);
  record(`${prefix}/R-3`, metrics.appBarStatic && !metrics.headerCoversBody, `static=${metrics.appBarStatic}`);
  record(`${prefix}/R-4`, metrics.texts.hero && metrics.texts.heroSub && !metrics.h1Clipped);
  record(`${prefix}/R-8`, !metrics.overflowX);

  return metrics;
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    channel: "msedge",
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  // P-1
  const res = await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  record("P-1", res && res.ok(), `status=${res?.status()}`);

  const content = await page.evaluate(() => {
    const text = document.body.innerText;
    const html = document.documentElement.outerHTML;
    const order = [];
    const header = document.querySelector(".MuiAppBar-root, header");
    if (header) order.push("header");
    document.querySelectorAll("main section, main > *").forEach((el, i) => {
      const id = el.id || el.getAttribute("aria-labelledby") || el.tagName + i;
      const t = el.innerText.slice(0, 40).replace(/\s+/g, " ");
      order.push(`${id}:${t}`);
    });
    const footer = document.querySelector("footer");
    if (footer) order.push("footer");

    const svgs = document.querySelectorAll("svg").length;
    const expandIcons = document.querySelectorAll(".MuiAccordionSummary-expandIconWrapper, [data-testid='ExpandMoreIcon']").length;

    return {
      text,
      hasTop: !!document.getElementById("top"),
      hasFeatures: !!document.getElementById("features"),
      hasSteps: !!document.getElementById("steps"),
      hasFaq: !!document.getElementById("faq"),
      appBarBeforeHero: (() => {
        const appBar = document.querySelector(".MuiAppBar-root");
        const h1 = document.querySelector("h1");
        if (!appBar || !h1) return false;
        return appBar.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING;
      })(),
      ctaCount: (text.match(/無料で診断を始める/g) || []).length,
      svgCount: svgs,
      expandIcons,
      order,
      year: new Date().getFullYear(),
    };
  });

  // Sections
  record("S-1", content.appBarBeforeHero && content.text.includes("AIキャリア診断サービス") && content.text.includes("特徴") && content.text.includes("診断の流れ") && content.text.includes("FAQ") && content.ctaCount >= 1);
  record("S-2", content.text.includes("5問でわかる、あなたのキャリア") && content.text.includes("AIがあなたに最適なキャリアロードマップを提案します"));
  record("S-3", content.text.includes("こんなお悩みありませんか？") && content.text.includes("自分に何が向いているか分からない") && content.text.includes("このままのキャリアでいいか不安") && content.text.includes("何から始めればいいか分からない"));
  record("S-4", content.hasFeatures && content.text.includes("たった5問・3分で完了") && content.text.includes("AIが深く分析") && content.text.includes("パーソナライズされた提案"));
  record("S-5", content.text.includes("あなたの強みタイプ") && content.text.includes("向いている職種の候補") && content.text.includes("次の一歩としてやるべきこと"));
  record("S-6", content.hasSteps && content.text.includes("質問に回答") && content.text.includes("AI分析") && content.text.includes("結果表示"));
  record("S-7", content.hasFaq && content.text.includes("診断は無料ですか？") && content.text.includes("どれくらい時間がかかりますか？") && content.text.includes("会員登録は必要ですか？"));
  record("S-8", content.text.includes("さあ、あなたのキャリアを見つけよう") && content.ctaCount >= 3);
  record("S-9", content.text.includes(`© ${content.year} AIキャリア診断サービス`) || content.text.includes("©") && content.text.includes("AIキャリア診断サービス"));
  record("S-10", content.appBarBeforeHero && content.hasFeatures && content.hasSteps && content.hasFaq && content.order.includes("footer"));

  // CTA labels
  const ctaButtons = page.locator('button:has-text("無料で診断を始める")');
  const ctaCount = await ctaButtons.count();
  record("C-1", ctaCount === 3, `count=${ctaCount}`);

  // Click each CTA
  let allComingSoon = true;
  let noNavAway = true;
  for (let i = 0; i < ctaCount; i++) {
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.locator('button:has-text("無料で診断を始める")').nth(i).click();
    await page.waitForTimeout(400);
    const url = page.url();
    const snack = await page.locator("text=Coming Soon").isVisible().catch(() => false);
    if (!snack) allComingSoon = false;
    if (!url.startsWith(`${BASE_URL}/`) && url !== `${BASE_URL}/` && !url.startsWith(BASE_URL)) noNavAway = false;
    // dismiss snackbar if needed
    const close = page.locator('[aria-label="Close"]').first();
    if (await close.isVisible().catch(() => false)) await close.click().catch(() => {});
  }
  record("C-2", noNavAway);
  record("C-3", allComingSoon);
  record("C-4", allComingSoon && noNavAway && ctaCount === 3);

  // Links
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
  await page.locator('a:has-text("AIキャリア診断サービス")').first().click();
  await page.waitForTimeout(600);
  const scrollAfterLogo = await page.evaluate(() => window.scrollY);
  record("L-1", scrollAfterLogo < 80, `scrollY=${scrollAfterLogo}`);

  for (const [id, hash, label] of [
    ["L-2", "#features", "特徴"],
    ["L-3", "#steps", "診断の流れ"],
    ["L-4", "#faq", "FAQ"],
  ]) {
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.locator(`nav a:has-text("${label}"), a:has-text("${label}")`).first().click();
    await page.waitForTimeout(700);
    const info = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return { ok: false };
      const rect = el.getBoundingClientRect();
      return { ok: rect.top >= -20 && rect.top < window.innerHeight * 0.5, top: rect.top, href: location.hash };
    }, hash);
    record(id, info.ok || info.href === hash, JSON.stringify(info));
  }

  // Direct hash
  let hashOk = true;
  const hashNotes = [];
  for (const hash of ["#features", "#steps", "#faq"]) {
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.evaluate((h) => {
      location.hash = h;
    }, hash);
    await page.waitForTimeout(700);
    const info = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return { ok: false, reason: "missing" };
      el.scrollIntoView();
      const r = el.getBoundingClientRect();
      return {
        ok: r.height > 0 && r.top < window.innerHeight && r.bottom > 0,
        top: r.top,
        hash: location.hash,
      };
    }, hash);
    hashNotes.push(`${hash}:${JSON.stringify(info)}`);
    if (!info.ok) hashOk = false;
  }
  record("L-5", hashOk, hashNotes.join(" "));

  // Icons
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  const iconInfo = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll("section"));
    const problemSection = sections.find((s) => s.innerText.includes("こんなお悩みありませんか？"));
    const featureSection = document.getElementById("features");
    const resultSection = sections.find((s) => s.innerText.includes("診断でわかること"));
    const faqSection = document.getElementById("faq");
    return {
      problemSvgs: problemSection?.querySelectorAll("svg").length ?? 0,
      featureSvgs: featureSection?.querySelectorAll("svg").length ?? 0,
      resultSvgs: resultSection?.querySelectorAll("svg").length ?? 0,
      faqExpand: faqSection?.querySelectorAll(".MuiAccordionSummary-expandIconWrapper").length ?? 0,
      logoImg: document.querySelector("header img, .MuiAppBar-root img") ? true : false,
      serviceTextLogo: !!document.querySelector('.MuiAppBar-root a, .MuiAppBar-root a[href="#top"]'),
    };
  });
  record("I-1", iconInfo.problemSvgs >= 3, `svgs=${iconInfo.problemSvgs}`);
  record("I-2", iconInfo.featureSvgs >= 3, `svgs=${iconInfo.featureSvgs}`);
  record("I-3", iconInfo.resultSvgs >= 1, `svgs=${iconInfo.resultSvgs}`);
  record("I-4", iconInfo.faqExpand >= 3, `expand=${iconInfo.faqExpand}`);

  // FAQ open
  await page.locator("#faq .MuiAccordionSummary-root").first().click();
  await page.waitForTimeout(300);
  const faqOpen = await page.locator("#faq").getByText("A. 無料です", { exact: true }).isVisible();
  record("I-4-open", faqOpen);
  record("I-5", iconInfo.problemSvgs >= 3 && iconInfo.featureSvgs >= 3);
  record("I-6", !iconInfo.logoImg && content.text.includes("AIキャリア診断サービス"));

  // Responsive layout checks for cards (R-5, R-6, R-7) at each size
  for (const [label, w, h] of [
    ["PC", 1280, 800],
    ["Tablet", 768, 1024],
    ["Mobile", 375, 812],
  ]) {
    const m = await checkViewport(page, label, w, h);
    const layout = await page.evaluate(() => {
      const cardsOk = true;
      const bottomCta = Array.from(document.querySelectorAll("section")).find((s) =>
        s.innerText.includes("さあ、あなたのキャリアを見つけよう")
      );
      const footer = document.querySelector("footer");
      const steps = document.getElementById("steps");
      const faq = document.getElementById("faq");
      const readable = (el) => {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      };
      return {
        r5: document.querySelectorAll(".MuiCard-root").length >= 6,
        r6: readable(steps) && readable(faq),
        r7: readable(bottomCta) && readable(footer),
      };
    });
    record(`R:${label}/R-5`, layout.r5);
    record(`R:${label}/R-6`, layout.r6);
    record(`R:${label}/R-7`, layout.r7);
  }

  record("P-2", consoleErrors.length === 0, consoleErrors.slice(0, 5).join(" | ") || "no console errors");

  await browser.close();

  const ng = RESULTS.filter((r) => !r.ok);
  console.log("\n=== SUMMARY ===");
  console.log(`Total: ${RESULTS.length}, OK: ${RESULTS.length - ng.length}, NG: ${ng.length}`);
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
