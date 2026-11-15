import { chromium } from 'playwright';
import { mkdir, rm } from 'node:fs/promises';

const base = process.env.BASE_URL || 'http://127.0.0.1:4322/';
const outDir = 'docs/media';
const tmpDir = '/tmp/qz-intro-video';
await mkdir(outDir, { recursive: true });
await rm(tmpDir, { recursive: true, force: true });
await mkdir(tmpDir, { recursive: true });

const browser = await chromium.launch();
const shots = [
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
  { name: 'mobile', viewport: { width: 390, height: 844 } },
];

for (const shot of shots) {
  const context = await browser.newContext({
    viewport: shot.viewport,
    recordVideo: { dir: tmpDir, size: shot.viewport },
  });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForTimeout(3400);
  const video = page.video();
  await context.close();
  const path = `${outDir}/opening-${shot.name}.webm`;
  await video.saveAs(path);
  console.log(path);
}

await browser.close();
