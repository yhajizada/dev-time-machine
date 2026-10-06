import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { parse } from '../src/args.mjs';
import { validateName, validateViewport, validateUrl, saveSnapshot, loadSnapshot } from '../src/store.mjs';
import { renderReport, writeReport } from '../src/report.mjs';
import { capture } from '../src/capture.mjs';

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
const shot = name => ({ name, mime: 'image/png', image: png.toString('base64'), viewport: { width: 1440, height: 900 }, url: 'http://localhost:3000', capturedAt: '2026-01-01T00:00:00.000Z' });
async function temporary(fn) { const dir = await mkdtemp(path.join(os.tmpdir(), 'dtm-')); try { await fn(dir); } finally { await rm(dir, { recursive: true, force: true }); } }

test('snapshot names cannot escape the storage folder', () => {
  for (const name of ['../private', '/tmp/file', '', 'a/b', 'a'.repeat(65)]) assert.throws(() => validateName(name));
  assert.equal(validateName('home-v2_1440'), 'home-v2_1440');
});
test('viewport and URL validation reject invalid input', () => {
  assert.deepEqual(validateViewport('1280x720'), { width: 1280, height: 720 });
  for (const size of ['0x900', '99x100', '9999x900', 'abc']) assert.throws(() => validateViewport(size));
  for (const url of ['file:///secret', 'javascript:alert(1)', 'https://user:pass@example.com', 'example.com']) assert.throws(() => validateUrl(url));
  assert.equal(validateUrl('http://localhost:3000'), 'http://localhost:3000/');
});
test('snapshot round trip preserves image and refuses replacement', async () => temporary(async dir => {
  const { image, ...metadata } = shot('before');
  await saveSnapshot(dir, 'before', metadata, png);
  assert.equal((await loadSnapshot(dir, 'before')).image, image);
  await assert.rejects(saveSnapshot(dir, 'before', metadata, png), /already exists/);
  await assert.rejects(loadSnapshot(dir, 'missing'), /not found/);
  await writeFile(path.join(dir, 'broken.json'), JSON.stringify({ ...shot('broken'), version: 1, image: 'not-a-png' }));
  await assert.rejects(loadSnapshot(dir, 'broken'), /not a valid/);
}));
test('report escapes untrusted metadata and prevents image attribute injection', () => {
  const before = { ...shot('<script>alert(1)</script>'), url: '"><img onerror=alert(1)>' };
  const html = renderReport(before, shot('after'));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(!html.includes('<img onerror'));
  assert.throws(() => renderReport({ ...before, image: '" onload="alert(1)' }, shot('after')), /Unsupported/);
});
test('report rejects mismatched viewports', () => {
  assert.throws(() => renderReport(shot('a'), { ...shot('b'), viewport: { width: 1280, height: 720 } }), /same viewport/);
});
test('portable report embeds images and refuses to overwrite output', async () => temporary(async dir => {
  const output = path.join(dir, 'report.html');
  await writeReport(shot('before'), shot('after'), output);
  const html = await readFile(output, 'utf8');
  assert.equal((html.match(/src="data:image\/png;base64,/g) || []).length, 2);
  assert.ok(!/src="https?:/.test(html));
  await assert.rejects(writeReport(shot('before'), shot('after'), output), /exists/);
}));
test('capture always closes the browser when navigation fails', async () => {
  let closed = false;
  const engine = { launch: async () => ({ newContext: async () => ({ newPage: async () => ({ goto: async () => { throw new Error('unreachable'); } }) }), close: async () => { closed = true; } }) };
  await assert.rejects(capture({ name: 'before', url: 'http://localhost:1', directory: '.' }, engine), /unreachable/);
  assert.equal(closed, true);
});
test('CLI parser rejects misspelled, missing and duplicate options', () => {
  assert.deepEqual(parse(['http://localhost:3000', '--name', 'before'], ['name']), { positionals: ['http://localhost:3000'], options: { name: 'before' } });
  assert.throws(() => parse(['--nmae', 'before'], ['name']), /Unknown option/);
  assert.throws(() => parse(['--name'], ['name']), /needs a value/);
  assert.throws(() => parse(['--name', 'a', '--name', 'b'], ['name']), /twice/);
});
test('capture waits, hides noise and saves the requested screenshot', async () => temporary(async dir => {
  const calls = [];
  const page = {
    goto: async url => calls.push(['url', url]),
    locator: selector => ({ waitFor: async () => calls.push(['ready', selector]) }),
    waitForFunction: async () => calls.push(['fonts']),
    waitForTimeout: async ms => calls.push(['wait', ms]),
    addStyleTag: async style => calls.push(['hide', style.content]),
    screenshot: async options => { calls.push(['screenshot', options]); return png; }
  };
  const engine = { launch: async () => ({ newContext: async () => ({ newPage: async () => page }), close: async () => calls.push(['closed']) }) };
  await capture({ name: 'home', url: 'http://localhost:3000', directory: dir, selector: '#ready', hide: '.clock', wait: 500 }, engine);
  assert.equal((await loadSnapshot(dir, 'home')).image, png.toString('base64'));
  assert.ok(calls.some(([type, value]) => type === 'wait' && value === 500));
  assert.ok(calls.some(([type, value]) => type === 'hide' && value.includes('.clock')));
  assert.ok(calls.some(([type, value]) => type === 'screenshot' && value.fullPage === false));
  assert.equal(calls.at(-1)[0], 'closed');
}));
