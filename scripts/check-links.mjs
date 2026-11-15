import { chromium } from 'playwright';

const base = process.env.BASE_URL || 'http://127.0.0.1:4322/';
const origin = new URL(base).origin;
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

const pages = new Set(['/']);
const hrefs = new Set();
const queue = ['/'];

while (queue.length) {
  const path = queue.shift();
  const url = new URL(path, base).href;
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
  } catch (error) {
    console.log(`PAGE FAIL ${url} — ${error.message}`);
    continue;
  }
  const found = await page.$$eval('a[href]', (anchors) =>
    anchors.map((anchor) => anchor.getAttribute('href')).filter(Boolean),
  );
  for (const href of found) {
    if (href.startsWith('mailto:') || href.startsWith('tel:')) {
      console.log(`PRIVATE CONTACT LINK ${href}`);
      continue;
    }
    const absolute = new URL(href, url);
    hrefs.add(absolute.href);
    const isHtmlPage = !/\.(?:pdf|xml|png|jpe?g|webp|gif|svg|ico|css|js|mjs|woff2?)$/i.test(absolute.pathname);
    if (absolute.origin === origin && isHtmlPage && !pages.has(absolute.pathname)) {
      pages.add(absolute.pathname);
      queue.push(absolute.pathname);
    }
  }
}

let failures = 0;
for (const href of [...hrefs].sort()) {
  let status = 0;
  try {
    const response = await context.request.get(href, {
      timeout: 15000,
      maxRedirects: 5,
      failOnStatusCode: false,
    });
    status = response.status();
  } catch (error) {
    console.log(`FAIL ${href} — ${error.message.split('\n')[0]}`);
    failures++;
    continue;
  }
  const ok = status >= 200 && status < 400;
  const blocked = status === 999 || status === 403 || status === 429;
  if (!ok && !blocked) failures++;
  if (!ok) {
    console.log(`${blocked ? 'BLOCKED' : 'FAIL'} ${status} ${href}`);
  }
}

console.log(`\nChecked ${hrefs.size} links across ${pages.size} pages. Failures: ${failures}.`);
await browser.close();
process.exitCode = failures ? 1 : 0;
