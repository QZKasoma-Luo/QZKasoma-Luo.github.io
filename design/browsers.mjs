import { chromium, webkit, firefox } from "playwright";
import { mkdir } from "node:fs/promises";

const base = process.env.BASE_URL || "http://127.0.0.1:4173";
const outDir = "/tmp/qz-browsers";
const engines = { chromium, webkit, firefox };

await mkdir(outDir, { recursive: true });

for (const [name, engine] of Object.entries(engines)) {
  const opts = name === "firefox"
    ? { env: { ...process.env, CFFIXED_USER_HOME: "/tmp/ffuser" }, timeout: 30000 }
    : {};
  const browser = await engine.launch(opts);
  for (const dir of ["a", "b"]) {
    for (const [label, viewport, dpr, mobile] of [
      ["desktop", { width: 1440, height: 1000 }, 1, false],
      ["mobile", { width: 390, height: 844 }, 2, true],
    ]) {
      const context = await browser.newContext({
        viewport,
        deviceScaleFactor: dpr,
        isMobile: mobile,
        hasTouch: mobile,
        colorScheme: "light",
        locale: "en-CA",
      });
      const page = await context.newPage();
      await page.goto(`${base}/${dir}/`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(500);
      const info = await page.evaluate(() => ({
        cls: document.documentElement.className,
        bf: getComputedStyle(document.querySelector(".nav")).backdropFilter,
        bg: getComputedStyle(document.querySelector(".nav")).backgroundColor,
      }));
      await page.screenshot({ path: `${outDir}/${dir}-${label}-${name}.png` });
      console.log(`${dir}-${label}-${name}`, JSON.stringify(info));
      await context.close();
    }
  }
  await browser.close();
}
