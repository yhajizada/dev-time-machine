import { validateName, validateUrl, validateViewport, saveSnapshot } from './store.mjs';

export async function capture(options, engine) {
  const name = validateName(options.name);
  const url = validateUrl(options.url);
  const viewport = validateViewport(options.viewport);
  const wait = Number(options.wait ?? 300);
  if (!Number.isInteger(wait) || wait < 0 || wait > 30000) throw new Error('--wait must be an integer from 0 to 30000 milliseconds.');
  if (!engine) {
    try { engine = (await import('playwright')).chromium; }
    catch { throw new Error('Install dependencies with npm install, then run npm run setup.'); }
  }
  let browser;
  try { browser = await engine.launch({ headless: true }); }
  catch { throw new Error('Chromium could not start. Run npm run setup and try again.'); }
  try {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'reduce', locale: 'en-US', timezoneId: 'UTC' });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    if (options.selector) await page.locator(options.selector).waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForFunction(() => document.fonts.status === 'loaded', { }, { timeout: 15000 });
    await page.waitForTimeout(wait);
    if (options.hide) await page.addStyleTag({ content: `${options.hide} { visibility: hidden !important; }` });
    const image = await page.screenshot({ type: 'png', fullPage: false, animations: 'disabled', caret: 'hide', timeout: 15000 });
    return await saveSnapshot(options.directory, name, {
      url, viewport, capturedAt: new Date().toISOString(), mime: 'image/png'
    }, image);
  } finally { await browser.close(); }
}
