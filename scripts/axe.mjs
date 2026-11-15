import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const base = process.env.BASE_URL || 'http://127.0.0.1:4322/';
const pages = [
  '/',
  '/blog/',
  '/blog/minimum-spanning-tree/',
  '/projects/',
  '/projects/cuda-knn/',
  '/research/',
  '/research/dp-hierarchical-counts/',
];

const browser = await chromium.launch();
let violations = 0;

for (const theme of ['light', 'dark']) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate((t) => {
    localStorage.setItem('qz-intro-seen', '1');
    localStorage.setItem('theme', t);
  }, theme);

  for (const path of pages) {
    await page.goto(new URL(path, base).href, { waitUntil: 'networkidle' });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    if (results.violations.length) {
      console.log(`\n${theme} ${path}: ${results.violations.length} violation(s)`);
      for (const v of results.violations) {
        console.log(`  [${v.impact}] ${v.id}: ${v.help}`);
        for (const node of v.nodes.slice(0, 3)) console.log(`    ${node.target.join(' ')}`);
      }
      violations += results.violations.length;
    }
  }
  await context.close();
}

await browser.close();
console.log(`\nAxe WCAG A/AA: ${violations ? `${violations} violation group(s)` : 'clean'} across ${pages.length * 2} page/theme combinations.`);
process.exitCode = violations ? 1 : 0;
