import { chromium, devices } from 'playwright';

// Blog list: category filters + keyword search, on the English and localised pages.
// The search matches the rendered (translated) text, so it is checked in zh/ja/ko too.
const base = process.env.BASE_URL || 'http://127.0.0.1:4322/';
const browser = await chromium.launch();
let failures = 0;

function check(name, ok, extra = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
  if (!ok) failures++;
}

const visiblePosts = (page) => page.evaluate(() =>
  [...document.querySelectorAll('#blog-posts .post')].filter((el) => !el.hidden).length);
const emptyShown = (page) => page.evaluate(() => {
  const el = document.getElementById('blog-empty');
  return Boolean(el && !el.hidden);
});

const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', (err) => errors.push(String(err)));

await page.goto(`${base}blog/`, { waitUntil: 'networkidle' });
check('all posts are listed', (await visiblePosts(page)) === 6, `${await visiblePosts(page)} visible`);

await page.click('[data-blog-filter="life"]');
check('life filter keeps the life post', (await visiblePosts(page)) === 1, `${await visiblePosts(page)} visible`);
check('life filter shows the 4.0 post', await page.evaluate(() => {
  const visible = [...document.querySelectorAll('#blog-posts .post')].find((el) => !el.hidden);
  return Boolean(visible && /4\.0/.test(visible.textContent ?? ''));
}));
check('message stays hidden while posts match', !(await emptyShown(page)));
check('life filter is pressed', (await page.getAttribute('[data-blog-filter="life"]', 'aria-pressed')) === 'true');
check('all filter is released', (await page.getAttribute('[data-blog-filter="all"]', 'aria-pressed')) === 'false');

await page.click('[data-blog-filter="all"]');
check('all filter restores every post', (await visiblePosts(page)) === 6);

await page.click('[data-blog-filter="course"]');
check('course filter keeps the course notes', (await visiblePosts(page)) === 4);
check('message stays hidden while posts match', !(await emptyShown(page)));

await page.click('[data-blog-filter="project"]');
check('project filter keeps the project post', (await visiblePosts(page)) === 1);
check('project filter shows the right post', await page.evaluate(() => {
  const visible = [...document.querySelectorAll('#blog-posts .post')].find((el) => !el.hidden);
  return Boolean(visible && /Picking up a site/.test(visible.textContent ?? ''));
}));

await page.click('[data-blog-filter="all"]');
await page.fill('#blog-search', 'minimum spanning');
check('search narrows to one post', (await visiblePosts(page)) === 1);

await page.fill('#blog-search', 'kruskal');
check('search matches the description', (await visiblePosts(page)) === 1);

await page.fill('#blog-search', 'air-gapped');
check('search finds the new project post', (await visiblePosts(page)) === 1);

await page.fill('#blog-search', 'no-such-post-xyz');
check('unmatched search shows the message', (await visiblePosts(page)) === 0 && (await emptyShown(page)));

await page.fill('#blog-search', '');
await page.click('[data-blog-filter="all"]');
check('clearing restores every post', (await visiblePosts(page)) === 6);

await page.goto(`${base}zh/blog/`, { waitUntil: 'networkidle' });
check('zh labels match their categories', await page.evaluate(() =>
  [...document.querySelectorAll('#blog-posts .post')].every((el) => {
    const label = el.querySelector('.tag-accent')?.textContent.trim();
    if (el.dataset.category === 'course') return label === '课程笔记';
    if (el.dataset.category === 'project') return label === '项目心得';
    return true;
  })));
await page.fill('#blog-search', '最小生成树');
check('zh search matches translated text', (await visiblePosts(page)) === 1, `${await visiblePosts(page)} visible`);

await page.goto(`${base}ja/blog/`, { waitUntil: 'networkidle' });
await page.fill('#blog-search', '最小全域木');
check('ja search matches translated text', (await visiblePosts(page)) === 1, `${await visiblePosts(page)} visible`);

await page.goto(`${base}ko/blog/`, { waitUntil: 'networkidle' });
check('ko labels match their categories', await page.evaluate(() =>
  [...document.querySelectorAll('#blog-posts .post')].every((el) => {
    const label = el.querySelector('.tag-accent')?.textContent.trim();
    if (el.dataset.category === 'course') return label === '수업 노트';
    if (el.dataset.category === 'project') return label === '프로젝트 노트';
    return true;
  })));
await page.fill('#blog-search', '최소 신장 트리');
check('ko search matches translated text', (await visiblePosts(page)) === 1, `${await visiblePosts(page)} visible`);

const mobile = await browser.newContext({ ...devices['iPhone 13'] });
const mobilePage = await mobile.newPage();
await mobilePage.goto(`${base}blog/`, { waitUntil: 'networkidle' });
const overflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
check('mobile layout does not overflow', overflow <= 1, `${overflow}px`);
await mobilePage.fill('#blog-search', 'minimum');
check('mobile search works', await mobilePage.evaluate(() =>
  [...document.querySelectorAll('#blog-posts .post')].filter((el) => !el.hidden).length) === 1);

check('no console errors', errors.length === 0, errors.join(' | '));

await browser.close();
if (failures) {
  console.error(`[test:blog] ${failures} failure(s)`);
  process.exitCode = 1;
} else {
  console.log('[test:blog] all checks passed');
}
