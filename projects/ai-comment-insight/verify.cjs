const { pathToFileURL } = require('node:url');
const { join, resolve } = require('node:path');
const { existsSync } = require('node:fs');

const RUNTIME_NODE_MODULES =
  process.env.RUNTIME_NODE_MODULES ||
  '/Users/chenyingying/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';

let playwright;
try {
  playwright = require('playwright');
} catch (err) {
  playwright = require(join(RUNTIME_NODE_MODULES, 'playwright'));
}

const SYSTEM_CHROME = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
].find(existsSync);

const url = pathToFileURL(resolve(__dirname, 'index.html')).href;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const browser = await playwright.chromium.launch({ executablePath: SYSTEM_CHROME || undefined });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });

  await page.goto(url, { waitUntil: 'load' });
  await page.waitForSelector('#analyzeBtn');
  const unresolvedIcons = await page.evaluate(() => document.querySelectorAll('i[data-lucide]').length);
  assert(unresolvedIcons === 0, `未渲染图标数量 ${unresolvedIcons}`);
  await page.click('#analyzeBtn');
  await page.waitForSelector('#report:not(.hidden)', { timeout: 12000 });
  const total = await page.locator('#statTotal').innerText();
  assert(Number(total) > 0, '评论总数异常');
  assert((await page.locator('.pain-card').count()) > 0, '痛点聚类缺失');
  assert((await page.locator('.opportunity-card').count()) > 0, '市场机会缺失');
  await page.screenshot({ path: '/tmp/comment-insight.png', fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(200);
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  assert(metrics.scrollWidth <= metrics.innerWidth + 1, `Mobile overflow ${metrics.scrollWidth}`);
  assert(errors.length === 0, `Browser errors: ${errors.join(' | ')}`);
  console.log('COMMENT_INSIGHT_VERIFY_OK');
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
