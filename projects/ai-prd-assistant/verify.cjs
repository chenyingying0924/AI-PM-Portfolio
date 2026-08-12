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
  await page.waitForSelector('#generateBtn');
  await page.click('#generateBtn');
  await page.waitForSelector('#prdDoc:not(.hidden)', { timeout: 12000 });
  assert((await page.locator('.persona-card').count()) >= 2, '用户画像不足');
  assert((await page.locator('#reqBody tr').count()) >= 5, '需求清单不足');
  assert((await page.locator('.module-card').count()) >= 4, '功能模块不足');
  assert((await page.locator('.insight-card').count()) >= 3, '需求洞察不足');
  const reviewScore = await page.locator('#reviewScore').innerText();
  assert(reviewScore.includes('分'), 'AI Review评分缺失');
  assert((await page.locator('#reviewIssues li').count()) >= 3, 'AI Review问题列表缺失');
  await page.screenshot({ path: '/tmp/prd-assistant.png', fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(200);
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  assert(metrics.scrollWidth <= metrics.innerWidth + 1, `Mobile overflow ${metrics.scrollWidth}`);
  assert(errors.length === 0, `Browser errors: ${errors.join(' | ')}`);
  console.log('PRD_ASSISTANT_VERIFY_OK');
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
