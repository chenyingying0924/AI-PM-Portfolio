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

const appDir = resolve(__dirname, '..', 'agent-app');
const appUrl = pathToFileURL(join(appDir, 'index.html')).href;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitFor(page, selector, timeout = 8000) {
  await page.waitForSelector(selector, { timeout, state: 'visible' });
}

(async () => {
  const browser = await playwright.chromium.launch({ executablePath: SYSTEM_CHROME || undefined });
  const errors = [];

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });

  await page.goto(appUrl, { waitUntil: 'load' });
  await waitFor(page, '#view-workbench.active');
  await page.waitForFunction(() => window.lucide && document.querySelectorAll('svg').length > 5);
  const unresolvedIcons = await page.evaluate(() => document.querySelectorAll('i[data-lucide]').length);
  assert(unresolvedIcons === 0, `未渲染图标数量 ${unresolvedIcons}`);

  assert((await page.locator('.step.active').count()) === 1, '初始步骤异常');

  await page.click('#teardownBtn');
  await waitFor(page, '#teardownOutput:not(.hidden)', 12000);
  assert(await page.locator('#outSelling li').count() >= 2, '拆解卖点不足');

  await page.click('[data-step="2"]');
  await waitFor(page, '#panel-2.active');
  await waitFor(page, '#rewriteMarkets .chip');
  await page.click('[data-market="SG"]');
  await page.click('#rewriteBtn');
  await waitFor(page, '.variant-card', 12000);
  assert(await page.locator('.variant-card').count() >= 6, '多市场变体数量不足');

  await page.click('[data-step="3"]');
  await waitFor(page, '#panel-3.active');
  await page.click('#evalBtn');
  await waitFor(page, '.score-box', 12000);
  assert((await page.locator('.score-box').count()) === 3, '评分维度不足');

  await page.click('[data-step="4"]');
  await waitFor(page, '#panel-4.active');
  assert(await page.locator('#approveBtn:not(:disabled)').count() === 1, '交付按钮未启用');

  await page.click('#approveBtn');
  await page.waitForFunction(() =>
    document.querySelector('#recordCount') &&
    document.querySelector('#recordCount').textContent.includes('1条')
  );

  await page.screenshot({ path: '/tmp/agent-app-desktop.png', fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/agent-app-mobile.png', fullPage: true });

  assert(errors.length === 0, `浏览器错误: ${errors.join(' | ')}`);
  console.log('AGENT_APP_VERIFY_OK');
  console.log('DESKTOP_SHOT /tmp/agent-app-desktop.png');
  console.log('MOBILE_SHOT /tmp/agent-app-mobile.png');

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
