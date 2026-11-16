import { chromium, webkit, firefox } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base = 'http://127.0.0.1:4322/';
const ffHome = '/tmp/ffuser-pages';
await mkdir(ffHome, { recursive: true });
const pages = [
  '/', '/zh/', '/ja/', '/ko/',
  '/research/ieee-access-iout-ddos/', '/zh/research/ieee-access-iout-ddos/', '/ja/research/ieee-access-iout-ddos/', '/ko/research/ieee-access-iout-ddos/',
  '/projects/', '/zh/projects/', '/ja/projects/', '/ko/projects/',
  '/projects/pigy/', '/zh/projects/pigy/', '/ja/projects/pigy/', '/ko/projects/pigy/',
  '/blog/', '/zh/blog/', '/ja/blog/', '/ko/blog/',
  '/feed/', '/zh/feed/', '/ja/feed/', '/ko/feed/',
];
const engines = { chromium, webkit, firefox };
const report = {};
let failures = 0;

for (const [engineName, engine] of Object.entries(engines)) {
  const launchOptions = engineName === 'firefox'
    ? { env: { ...process.env, CFFIXED_USER_HOME: ffHome } }
    : {};
  const browser = await engine.launch(launchOptions);
  report[engineName] = {};
  for (const [label, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
    report[engineName][label] = {};
    for (const path of pages) {
      const context = await browser.newContext({
        viewport,
        isMobile: label === 'mobile',
        hasTouch: label === 'mobile',
        colorScheme: 'light',
      });
      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      const failed = [];
      page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
      page.on('pageerror', (err) => pageErrors.push(String(err)));
      page.on('requestfailed', (req) => failed.push(`${req.url()} ${req.failure()?.errorText ?? ''}`));
      const pageUrl = new URL(path, base);
      pageUrl.searchParams.set('intro', 'off');
      await page.goto(pageUrl.href, { waitUntil: 'networkidle', timeout: 30000 });
      await page.evaluate(() => document.fonts.ready);
      const info = await page.evaluate(() => ({
        title: document.title,
        h1: document.querySelector('h1')?.textContent?.trim() ?? '',
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        fonts: document.fonts.status,
      }));
      const ok = info.overflow <= 1 && info.h1.length > 0 && consoleErrors.length === 0
        && pageErrors.length === 0 && failed.length === 0;
      if (!ok) failures++;
      report[engineName][label][path] = { ...info, consoleErrors, pageErrors, failed, ok };
      await context.close();
    }
  }
  await browser.close();
}

await writeFile('docs/media/qa/three-browser-pages.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
console.log(`\nThree-browser page checks: ${failures ? `${failures} failure(s)` : 'all passed'}.`);
process.exitCode = failures ? 1 : 0;
