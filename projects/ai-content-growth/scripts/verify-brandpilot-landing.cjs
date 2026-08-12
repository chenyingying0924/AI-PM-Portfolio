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

const landingUrl = pathToFileURL(
  resolve(__dirname, '..', 'landing', 'index.html')
).href;

const SIZES = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile-414', width: 414, height: 896 },
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'mobile-320', width: 320, height: 640 },
];

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

  await page.goto(landingUrl, { waitUntil: 'load' });
  await page.waitForSelector('h1');
  await page.waitForTimeout(500);

  const heroText = await page.locator('h1').first().innerText();
  assert(heroText.includes('Localized content'), 'Hero copy missing');

  const imageStates = await page.evaluate(() =>
    Array.from(document.images).map((img) => ({
      src: img.getAttribute('src'),
      loaded: img.complete && img.naturalWidth > 0,
    }))
  );
  assert(imageStates.every((img) => img.loaded), `Image load failed: ${JSON.stringify(imageStates.filter((i) => !i.loaded))}`);

  const sticky = await page.evaluate(() =>
    window.getComputedStyle(document.querySelector('.workflow-visual')).position
  );
  assert(sticky === 'sticky', `Workflow visual is not sticky, got ${sticky}`);

  for (const size of SIZES) {
    await page.setViewportSize({ width: size.width, height: size.height });
    await page.waitForTimeout(250);
    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const buttons = Array.from(document.querySelectorAll('.btn')).filter((el) => el.offsetParent !== null);
      const wrappedButtons = buttons.filter((el) => el.scrollWidth > el.clientWidth + 1 || el.getClientRects().length > 1);
      return {
        scrollWidth: doc.scrollWidth,
        innerWidth: window.innerWidth,
        wrappedButtons: wrappedButtons.map((el) => el.textContent.trim()),
      };
    });
    assert(
      metrics.scrollWidth <= metrics.innerWidth + 1,
      `${size.name} horizontal overflow ${metrics.scrollWidth} > ${metrics.innerWidth}`
    );
    assert(metrics.wrappedButtons.length === 0, `${size.name} wrapped buttons: ${metrics.wrappedButtons.join(', ')}`);
  }

  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(200);
  const menuVisible = await page.locator('.nav-menu').isVisible();
  assert(menuVisible, 'Mobile nav menu missing');
  await page.click('.nav-menu');
  await page.waitForTimeout(150);
  const sheetVisible = await page.locator('.nav-sheet').isVisible();
  assert(sheetVisible, 'Mobile nav sheet did not open');

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(200);
  await page.click('.hero-actions [data-register]');
  await page.waitForSelector('.register-modal', { state: 'visible' });
  await page.fill('.register-form input[type="email"]', 'demo@brandpilot.ai');
  await page.fill('.register-form input[type="text"]', 'Aurora');
  await page.selectOption('.register-form select', 'JP');
  await page.click('.register-form .btn[type="submit"]');
  await page.waitForSelector('.modal-success', { state: 'visible' });
  const successText = await page.locator('.modal-success h2').innerText();
  assert(successText.includes('Workspace ready'), 'Registration success state missing');
  const workspaceHref = await page.locator('.modal-success a').getAttribute('href');
  assert(workspaceHref === '../agent-app/index.html', 'Workspace link is wrong');
  await page.click('.modal-close');
  await page.waitForSelector('.register-modal', { state: 'detached' });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(200);
  await page.screenshot({ path: '/tmp/brandpilot-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(200);
  await page.screenshot({ path: '/tmp/brandpilot-mobile.png', fullPage: true });

  assert(errors.length === 0, `Browser errors: ${errors.join(' | ')}`);
  console.log('BRANDPILOT_LANDING_VERIFY_OK');
  console.log('DESKTOP_SHOT /tmp/brandpilot-desktop.png');
  console.log('MOBILE_SHOT /tmp/brandpilot-mobile.png');
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
