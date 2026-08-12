const { pathToFileURL } = require('node:url');
const { join, resolve } = require('node:path');
const { existsSync, mkdirSync } = require('node:fs');

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

const root = resolve(__dirname, '..');

async function waitFor(page, selector, timeout = 12000) {
  await page.waitForSelector(selector, { timeout, state: 'visible' });
}

(async () => {
  const browser = await playwright.chromium.launch({ executablePath: SYSTEM_CHROME || undefined });

  {
    const commentDir = resolve(root, 'projects', 'ai-comment-insight', 'assets');
    mkdirSync(commentDir, { recursive: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(pathToFileURL(join(root, 'projects', 'ai-comment-insight', 'index.html')).href, { waitUntil: 'load' });
    await page.waitForSelector('#analyzeBtn');
    await page.click('#analyzeBtn');
    await waitFor(page, '#report:not(.hidden)');
    await page.screenshot({ path: join(commentDir, 'dashboard.png') });
    await page.close();
  }

  {
    const prdDir = resolve(root, 'projects', 'ai-prd-assistant', 'assets');
    mkdirSync(prdDir, { recursive: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(pathToFileURL(join(root, 'projects', 'ai-prd-assistant', 'index.html')).href, { waitUntil: 'load' });
    await page.waitForSelector('#generateBtn');
    await page.click('#generateBtn');
    await waitFor(page, '#prdDoc:not(.hidden)');
    await page.screenshot({ path: join(prdDir, 'studio.png') });
    await page.close();
  }

  await browser.close();
  console.log('PROJECT_SHOTS_OK');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
