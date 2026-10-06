import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export function validateName(name) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(name ?? '')) {
    throw new Error('Use a snapshot name with 1–64 letters, numbers, dashes or underscores.');
  }
  return name;
}

export function validateViewport(value = '1440x900') {
  const match = /^(\d{2,4})x(\d{2,4})$/.exec(value);
  if (!match) throw new Error('Viewport must look like 1440x900.');
  const [width, height] = match.slice(1).map(Number);
  if (width < 100 || height < 100 || width > 3840 || height > 3840) {
    throw new Error('Viewport dimensions must be between 100 and 3840 pixels.');
  }
  return { width, height };
}

export function validateUrl(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error('Provide a full http:// or https:// URL.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Use an HTTP(S) URL without embedded credentials.');
  }
  return url.href;
}

export async function saveSnapshot(directory, name, metadata, image) {
  validateName(name);
  await mkdir(directory, { recursive: true });
  // A single JSON record keeps the image and metadata together on interrupted writes.
  const record = { ...metadata, name, version: 1, image: image.toString('base64') };
  try {
    await writeFile(path.join(directory, `${name}.json`), JSON.stringify(record, null, 2), { flag: 'wx' });
  } catch (error) {
    if (error.code === 'EEXIST') throw new Error(`Snapshot "${name}" already exists. Choose a new name.`);
    throw error;
  }
  return record;
}

export async function loadSnapshot(directory, name) {
  validateName(name);
  let record;
  try { record = JSON.parse(await readFile(path.join(directory, `${name}.json`), 'utf8')); }
  catch (error) {
    if (error.code === 'ENOENT') throw new Error(`Snapshot "${name}" was not found. Capture it first.`);
    throw new Error(`Cannot read snapshot "${name}": ${error.message}`);
  }
  if (record.version !== 1 || record.name !== name || record.mime !== 'image/png' ||
      !record.viewport || !Number.isInteger(record.viewport.width) || !Number.isInteger(record.viewport.height) ||
      record.viewport.width < 100 || record.viewport.width > 3840 ||
      record.viewport.height < 100 || record.viewport.height > 3840 ||
      typeof record.image !== 'string' || !record.image ||
      !Buffer.from(record.image, 'base64').subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) {
    throw new Error(`Snapshot "${name}" is not a valid DevTimeMachine PNG record.`);
  }
  return record;
}
