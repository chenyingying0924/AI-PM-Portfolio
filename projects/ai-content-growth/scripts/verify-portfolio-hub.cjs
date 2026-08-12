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

const root = resolve(__dirname, '..', '..', '..');
const projectRoot = resolve(root, 'projects', 'ai-content-growth');

function url(file) {
  return pathToFileURL(file).href;
}

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

  await page.goto(url(join(root, 'index.html')), { waitUntil: 'load' });
  await page.waitForSelector('.name');
  const name = await page.locator('.name').innerText();
  assert(name.includes('陈莹莹'), 'Portfolio hero missing');
  assert((await page.locator('.project-card').count()) === 3, 'Project cards missing');
  assert((await page.locator('a[href="projects/ai-content-growth/landing/index.html"]').count()) >= 1, 'Landing link missing');
  assert((await page.locator('a[href="projects/ai-content-growth/agent-app/index.html"]').count()) >= 1, 'Agent link missing');
  assert((await page.locator('a[href="projects/ai-content-growth/docs/PRD-AI出海内容增长助手-Agent.html"]').count()) >= 1, 'PRD link missing');
  assert((await page.locator('a[href="projects/ai-comment-insight/index.html"]').count()) >= 1, 'Comment insight link missing');
  assert((await page.locator('a[href="projects/ai-prd-assistant/index.html"]').count()) >= 1, 'PRD assistant link missing');
  assert((await page.locator('a[href="projects/ai-comment-insight/landing/index.html"]').count()) >= 1, 'Comment landing link missing');
  assert((await page.locator('a[href="projects/ai-comment-insight/docs/PRD-V2.0.html"]').count()) >= 1, 'Comment PRD link missing');
  assert((await page.locator('a[href="projects/ai-prd-assistant/landing/index.html"]').count()) >= 1, 'PRD landing link missing');
  assert((await page.locator('a[href="projects/ai-prd-assistant/docs/PRD-V2.0.html"]').count()) >= 1, 'PRD assistant PRD link missing');
  await page.screenshot({ path: '/tmp/portfolio-hub.png', fullPage: true });

  await page.goto(url(join(projectRoot, 'docs', 'PRD-AI出海内容增长助手-Agent.html')), { waitUntil: 'load' });
  await page.waitForSelector('.doc-content h1');
  assert((await page.locator('.toc a').count()) > 10, 'PRD TOC missing');

  await page.goto(url(join(projectRoot, 'docs', 'full-solution.html')), { waitUntil: 'load' });
  await page.waitForSelector('.doc-content h1');
  assert((await page.locator('.toc a').count()) > 10, 'Solution TOC missing');

  await page.goto(url(join(root, 'projects', 'ai-comment-insight', 'index.html')), { waitUntil: 'load' });
  await page.waitForSelector('#analyzeBtn');

  await page.goto(url(join(root, 'projects', 'ai-prd-assistant', 'index.html')), { waitUntil: 'load' });
  await page.waitForSelector('#generateBtn');

  await page.goto(url(join(root, 'projects', 'ai-comment-insight', 'landing', 'index.html')), { waitUntil: 'load' });
  await page.waitForSelector('h1');
  await page.waitForFunction(() =>
    document.images.length > 0 &&
    Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0)
  );

  await page.goto(url(join(root, 'projects', 'ai-prd-assistant', 'landing', 'index.html')), { waitUntil: 'load' });
  await page.waitForSelector('h1');
  await page.waitForFunction(() =>
    document.images.length > 0 &&
    Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0)
  );

  await page.goto(url(join(root, 'projects', 'ai-comment-insight', 'docs', 'PRD-V2.0.html')), { waitUntil: 'load' });
  await page.waitForSelector('.doc-content h1');

  await page.goto(url(join(root, 'projects', 'ai-prd-assistant', 'docs', 'PRD-V2.0.html')), { waitUntil: 'load' });
  await page.waitForSelector('.doc-content h1');

  assert(errors.length === 0, `Browser errors: ${errors.join(' | ')}`);
  console.log('PORTFOLIO_HUB_VERIFY_OK');
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
