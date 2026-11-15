import { chromium, firefox, webkit } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.BASE_URL || 'http://127.0.0.1:4322/';
const outDir = 'docs/media/qa';
await mkdir(outDir, { recursive: true });

const engines = { chromium, webkit, firefox };
const report = {};

for (const [name, engine] of Object.entries(engines)) {
  const launchOptions =
    name === 'firefox'
      ? { env: { ...process.env, CFFIXED_USER_HOME: '/tmp/ffuser' } }
      : {};
  const browser = await engine.launch(launchOptions);
  report[name] = {};

  for (const [label, viewport] of [
    ['desktop', { width: 1440, height: 1000 }],
    ['mobile', { width: 390, height: 844 }],
  ]) {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
      isMobile: label === 'mobile',
      hasTouch: label === 'mobile',
      colorScheme: 'light',
    });
    const page = await context.newPage();
    const pageUrl = new URL(base);
    pageUrl.searchParams.set('intro', 'off');
    await page.goto(pageUrl.href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);

    const info = await page.evaluate(() => {
      const nav = document.querySelector('.nav');
      const style = getComputedStyle(nav);
      return {
        classes: document.documentElement.className,
        theme: document.documentElement.dataset.theme,
        navBackdrop: style.backdropFilter,
        navBackground: style.backgroundColor,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      };
    });
    report[name][label] = info;
    await page.screenshot({ path: `${outDir}/${name}-${label}.png` });

    if ((name === 'webkit' || name === 'chromium') && label === 'mobile') {
      await page.click('.menu summary');
      await page.waitForTimeout(150);
      await page.screenshot({ path: `${outDir}/${name}-mobile-menu.png` });
    }
    await context.close();
  }
  await browser.close();
}

await writeFile(`${outDir}/report.json`, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
