import { chromium } from 'playwright';

const base = process.env.BASE_URL || 'http://127.0.0.1:4322/';
const browser = await chromium.launch();
let failures = 0;

function check(name, ok, extra = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
  if (!ok) failures++;
}

// 1. First visit plays; a key skips it.
{
  const context = await browser.newContext({ viewport: { width: 1200, height: 800 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);
  const visible = await page.evaluate(() => {
    const el = document.getElementById('qz-intro');
    return Boolean(el && !el.hidden);
  });
  check('first visit plays', visible);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const removed = await page.evaluate(() => !document.getElementById('qz-intro'));
  check('key skips', removed);
  await context.close();
}

// 2. Reduced motion never plays.
{
  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  const hidden = await page.evaluate(() => {
    const el = document.getElementById('qz-intro');
    return !el || el.hidden;
  });
  check('reduced motion skips', hidden);
  await context.close();
}

// 3. A refresh plays it again.
{
  const context = await browser.newContext({ viewport: { width: 1200, height: 800 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);
  const removed = await page.evaluate(() => !document.getElementById('qz-intro'));
  check('intro closes after its run', removed);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const visibleAgain = await page.evaluate(() => {
    const el = document.getElementById('qz-intro');
    return Boolean(el && !el.hidden);
  });
  check('refresh plays again', visibleAgain);
  await context.close();
}

// 4. The QA opt-out skips it without changing normal playback.
{
  const context = await browser.newContext({ viewport: { width: 1200, height: 800 } });
  const page = await context.newPage();
  await page.goto(`${base}?intro=off`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const hidden = await page.evaluate(() => {
    const el = document.getElementById('qz-intro');
    return !el || el.hidden;
  });
  check('intro=off skips', hidden);
  await context.close();
}

await browser.close();
console.log(`\nIntro checks: ${failures ? `${failures} failed` : 'all passed'}.`);
process.exitCode = failures ? 1 : 0;
