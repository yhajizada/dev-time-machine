#!/usr/bin/env node
import path from 'node:path';
import { capture } from '../src/capture.mjs';
import { loadSnapshot } from '../src/store.mjs';
import { writeReport } from '../src/report.mjs';
import { demo } from '../src/demo.mjs';
import { parse } from '../src/args.mjs';

const help = `DevTimeMachine — travel between two versions of your UI.

  node bin/dtm.mjs demo [--out demo.html]
  node bin/dtm.mjs capture <url> --name <snapshot> [options]
  node bin/dtm.mjs compare <before> <after> [--out comparison.html]

Options:
  --dir <path>          Snapshot folder (default: .time-machine)
  --viewport <WxH>     Capture size (default: 1440x900)
  --wait <ms>          Wait after load (default: 300, maximum: 30000)
  --selector <css>     Wait for an element to become visible
  --hide <css>         Hide dynamic elements while preserving layout
  --out <path>         Save the standalone HTML comparison

Quick start: npm install && npm run setup
No-install preview: node bin/dtm.mjs demo
Snapshots and reports never overwrite existing files.`;

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === '--help' || command === '-h') { console.log(help); return; }
  if (command === 'demo') {
    const { positionals, options } = parse(args, ['out']);
    if (positionals.length) throw new Error('Demo accepts only --out.');
    console.log(`Demo ready: ${await demo(options.out ?? 'demo.html')}`);
    return;
  }
  if (command === 'capture') {
    const { positionals, options } = parse(args, ['name', 'dir', 'viewport', 'wait', 'selector', 'hide']);
    if (positionals.length !== 1 || !options.name) throw new Error('Usage: capture <url> --name <snapshot>');
    const shot = await capture({ ...options, url: positionals[0], directory: options.dir ?? '.time-machine' });
    console.log(`Captured "${shot.name}" (${shot.viewport.width}×${shot.viewport.height}) in ${path.resolve(options.dir ?? '.time-machine')}`);
    return;
  }
  if (command === 'compare') {
    const { positionals, options } = parse(args, ['dir', 'out']);
    if (positionals.length !== 2) throw new Error('Usage: compare <before> <after>');
    const directory = options.dir ?? '.time-machine';
    const [before, after] = await Promise.all(positionals.map(name => loadSnapshot(directory, name)));
    console.log(`Comparison ready: ${await writeReport(before, after, options.out ?? 'comparison.html')}`);
    return;
  }
  throw new Error(`Unknown command "${command}". Use --help for usage.`);
}

main().catch(error => { console.error(`DevTimeMachine: ${error.message}`); process.exitCode = 1; });
