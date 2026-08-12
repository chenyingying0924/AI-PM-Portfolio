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

const appUrl = pathToFileURL(
  resolve(__dirname, '..', 'agent-app', 'index.html')
).href;
const outDir = resolve(__dirname, '..', 'landing', 'images');

async function waitFor(page, selector, timeout = 12000) {
  await page.waitForSelector(selector, { timeout, state: 'visible' });
}

async function newPage(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.addInitScript(() => localStorage.clear());
  await page.goto(appUrl, { waitUntil: 'load' });
  await waitFor(page, '#view-workbench.active');
  await page.waitForFunction(() => window.lucide && document.querySelectorAll('svg').length > 5);
  return { context, page };
}

async function runTeardown(page) {
  await page.click('#teardownBtn');
  await waitFor(page, '#teardownOutput:not(.hidden)');
  await page.waitForSelector('#teardownBtn:not(:disabled)', { timeout: 12000 });
}

(async () => {
  const browser = await playwright.chromium.launch({ executablePath: SYSTEM_CHROME || undefined });

  {
    const { context, page } = await newPage(browser);
    await page.screenshot({ path: join(outDir, 'agent-01-input.png') });
    await context.close();
  }

  {
    const { context, page } = await newPage(browser);
    await runTeardown(page);
    await page.screenshot({ path: join(outDir, 'agent-02-teardown.png') });
    await context.close();
  }

  {
    const { context, page } = await newPage(browser);
    await page.click('[data-view="brand"]');
    await waitFor(page, '#view-brand.active');
    await page.screenshot({ path: join(outDir, 'agent-03-brand.png') });
    await context.close();
  }

  {
    const { context, page } = await newPage(browser);
    await runTeardown(page);
    await page.click('[data-step="2"]');
    await waitFor(page, '#panel-2.active');
    await page.click('#rewriteBtn');
    await waitFor(page, '.variant-card');
    await page.screenshot({ path: join(outDir, 'agent-04-rewrite.png') });
    await context.close();
  }

  {
    const { context, page } = await newPage(browser);
    await runTeardown(page);
    await page.click('[data-step="2"]');
    await waitFor(page, '#panel-2.active');
    await page.click('#rewriteBtn');
    await waitFor(page, '.variant-card');
    await page.click('[data-step="3"]');
    await waitFor(page, '#panel-3.active');
    await page.click('#evalBtn');
    await waitFor(page, '.score-box');
    await page.screenshot({ path: join(outDir, 'agent-05-eval.png') });
    await context.close();
  }

  await browser.close();
  console.log('BRANDPILOT_SHOTS_OK', outDir);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
