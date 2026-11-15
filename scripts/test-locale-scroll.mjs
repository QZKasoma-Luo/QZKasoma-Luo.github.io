import { chromium, devices } from 'playwright';

// Language switching moves between three static documents, so it is a full
// page navigation. This checks that the reading position survives the switch.
const base = process.env.BASE_URL || 'http://127.0.0.1:4322/';
const browser = await chromium.launch();
let failures = 0;

function check(name, ok, extra = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
  if (!ok) failures++;
}

const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await desktop.newPage();

const scrollY = () => page.evaluate(() => Math.round(window.scrollY));
const jump = (top) => page.evaluate((value) => window.scrollTo({ top: value, behavior: 'instant' }), top);
const sectionTop = (id) => page.evaluate((value) => Math.round(document.getElementById(value).getBoundingClientRect().top + window.scrollY), id);
// A normal click, without Playwright scrolling the sticky header into view first.
const switchTo = async (locale) => {
  await page.evaluate((value) => document.querySelector(`a[data-locale="${value}"]`).click(), locale);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(400);
};
const introSkipped = () => page.evaluate(() => {
  const el = document.getElementById('qz-intro');
  return !el || el.hidden;
});

// The language links keep the current page in every locale.
await page.goto(`${base}zh/blog/`, { waitUntil: 'networkidle' });
const links = await page.evaluate(() => [...document.querySelectorAll('a[data-locale]')].map((el) => `${el.dataset.locale}=${el.getAttribute('href')}`));
check('language links keep the page', links.includes('en=/blog/') && links.includes('ja=/ja/blog/'), links.join(' '));

// Home page: 150px into the projects section.
await page.goto(base, { waitUntil: 'networkidle' });
await page.keyboard.press('Escape');
await jump((await sectionTop('projects')) + 150);
await page.waitForTimeout(200);
await switchTo('zh');
const expected = (await sectionTop('projects')) + 150;
check('home keeps the section and offset (en → zh)', Math.abs((await scrollY()) - expected) <= 8, `y=${await scrollY()}, expected≈${expected}`);
check('home switch hides the intro', await introSkipped());

// Blog index: mid-page.
await page.goto(`${base}zh/blog/`, { waitUntil: 'networkidle' });
await page.keyboard.press('Escape');
await jump(300);
await page.waitForTimeout(200);
await switchTo('en');
check('blog index keeps position (zh → en)', Math.abs((await scrollY()) - 300) <= 8, `y=${await scrollY()}`);

// Article page: mid-page.
await page.goto(`${base}blog/minimum-spanning-tree/`, { waitUntil: 'networkidle' });
await page.keyboard.press('Escape');
await jump(420);
await page.waitForTimeout(200);
await switchTo('ja');
check('article keeps position (en → ja)', Math.abs((await scrollY()) - 420) <= 8, `y=${await scrollY()}`);

// At the top of a page, stay at the top.
await page.goto(`${base}ja/projects/`, { waitUntil: 'networkidle' });
await page.keyboard.press('Escape');
await switchTo('en');
check('top of page stays at the top', (await scrollY()) === 0, `y=${await scrollY()}`);
check('top of page is revealed', await page.evaluate(() => getComputedStyle(document.body).visibility) === 'visible');

// Mobile: the collapsed menu has its own language links.
const mobile = await browser.newContext({ ...devices['iPhone 13'] });
const mobilePage = await mobile.newPage();
await mobilePage.goto(`${base}blog/`, { waitUntil: 'networkidle' });
await mobilePage.keyboard.press('Escape');
await mobilePage.evaluate(() => window.scrollTo({ top: 320, behavior: 'instant' }));
await mobilePage.waitForTimeout(200);
await mobilePage.evaluate(() => {
  document.querySelector('.menu').open = true;
  document.querySelector('.menu-langs a[data-locale="zh"]').click();
});
await mobilePage.waitForLoadState('networkidle');
await mobilePage.waitForTimeout(400);
const mobileY = await mobilePage.evaluate(() => Math.round(window.scrollY));
check('mobile menu keeps position (en → zh)', Math.abs(mobileY - 320) <= 8, `y=${mobileY}`);

await browser.close();
if (failures) {
  console.error(`[test:locale] ${failures} failure(s)`);
  process.exitCode = 1;
} else {
  console.log('[test:locale] all checks passed');
}
