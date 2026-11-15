import { chromium, webkit, firefox } from "playwright";
import { mkdir } from "node:fs/promises";

const base = process.env.BASE_URL || "http://127.0.0.1:4173";
const outDir = process.env.OUT_DIR || "/tmp/qz-design";
const engines = { chromium, webkit, firefox };

const shots = [
  { name: "a-desktop", path: "/a/", browser: "chromium", width: 1440, height: 1000, dpr: 1 },
  { name: "a-mobile", path: "/a/", browser: "chromium", width: 390, height: 844, dpr: 2, mobile: true },
  { name: "b-desktop", path: "/b/", browser: "chromium", width: 1440, height: 1000, dpr: 1 },
  { name: "b-mobile", path: "/b/", browser: "chromium", width: 390, height: 844, dpr: 2, mobile: true },
];

await mkdir(outDir, { recursive: true });

for (const s of shots) {
  const browser = await engines[s.browser].launch();
  const context = await browser.newContext({
    viewport: { width: s.width, height: s.height },
    deviceScaleFactor: s.dpr,
    isMobile: !!s.mobile,
    hasTouch: !!s.mobile,
    colorScheme: "light",
    locale: "en-CA",
    timezoneId: "America/Vancouver",
  });
  const page = await context.newPage();
  await page.goto(base + s.path, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${outDir}/${s.name}.png` });
  console.log(`${s.name}: ${await page.title()}`);
  await browser.close();
}
