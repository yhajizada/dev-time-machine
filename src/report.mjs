import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

export function renderReport(before, after) {
  if (before.viewport.width !== after.viewport.width || before.viewport.height !== after.viewport.height) {
    throw new Error('Snapshots need the same viewport. Capture both using the same --viewport.');
  }
  for (const shot of [before, after]) {
    if (!['image/png', 'image/svg+xml'].includes(shot.mime) || !/^[A-Za-z0-9+/=\r\n]+$/.test(shot.image)) {
      throw new Error('Unsupported image in comparison.');
    }
  }
  const e = escapeHtml;
  const stamp = shot => e(shot.capturedAt || 'Demo snapshot');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><title>DevTimeMachine · ${e(before.name)} → ${e(after.name)}</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#0b0d14;color:#eef0f7;font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif}button,input{font:inherit}button:focus-visible,a:focus-visible,input:focus-visible{outline:3px solid #b6ff69;outline-offset:5px}header,main,footer{max-width:1200px;margin:auto;padding:24px}header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #242735}.brand{font-weight:800;letter-spacing:-.7px;font-size:21px}.mark{color:#b6ff69}.privacy{color:#969cad;font-size:12px}.intro{display:flex;justify-content:space-between;align-items:end;gap:24px;margin:28px 0}.eyebrow{text-transform:uppercase;letter-spacing:3px;font-size:11px;color:#b6ff69}h1{font-size:clamp(30px,5vw,54px);letter-spacing:-2px;margin:10px 0}p{color:#969cad;line-height:1.6;margin:0}.pill{white-space:nowrap;font-size:12px;border:1px solid #303443;border-radius:999px;padding:10px 14px;color:#c9cfde}.viewer{position:relative;background:#171b28;border:1px solid #303443;border-radius:16px;overflow:hidden;aspect-ratio:${before.viewport.width}/${before.viewport.height};--split:50%}.viewer img{display:block;width:100%;height:100%;object-fit:contain}.after{position:absolute;inset:0;clip-path:inset(0 0 0 var(--split))}.divider{position:absolute;left:var(--split);top:0;bottom:0;width:2px;background:#b6ff69;pointer-events:none;transform:translateX(-1px)}.handle{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:44px;height:44px;display:grid;place-items:center;background:#b6ff69;color:#101609;border-radius:50%;font-weight:bold;box-shadow:0 4px 25px #0006}.tag{position:absolute;top:14px;padding:7px 10px;background:#10131ce8;border:1px solid #ffffff25;border-radius:7px;font-size:11px;letter-spacing:1px}.tag.left{left:14px}.tag.right{right:14px}.controls{background:#121520;border:1px solid #282c3b;border-radius:12px;padding:18px;margin:16px 0}.control-top{display:flex;justify-content:space-between;gap:16px;align-items:center;font-size:13px}.buttons{display:flex;gap:6px}button{background:#202534;color:#d2d8e7;border:1px solid #343a4c;border-radius:7px;padding:7px 12px;cursor:pointer}button:hover{background:#30374b}button[aria-pressed="true"]{color:#b6ff69;border-color:#819d58}input[type=range]{display:block;width:100%;margin:16px 0 0;accent-color:#b6ff69;cursor:ew-resize}.meta{display:grid;grid-template-columns:1fr 1fr;gap:16px}.card{border:1px solid #282c3b;border-radius:12px;padding:20px;overflow-wrap:anywhere}.card small{font-size:10px;color:#b6ff69;letter-spacing:2px}.card h2{font-size:18px;margin:10px 0}.card p{font-size:12px}.card time{display:block;margin-top:12px;color:#747d92;font-size:11px}footer{color:#747d92;font-size:12px;display:flex;justify-content:space-between;gap:20px}.hint{font-size:11px;color:#747d92;margin-top:12px}.blink .after{clip-path:none}.blink.show-before .after{visibility:hidden}.blink .divider{display:none}@media(max-width:650px){header,main,footer{padding:16px}.intro{display:block;margin:20px 0}.pill{display:inline-block;margin-top:14px}.meta{grid-template-columns:1fr}.control-top{align-items:start;flex-direction:column}.privacy{max-width:110px;text-align:right}.tag{font-size:9px}footer{flex-direction:column}.handle{width:30px;height:30px}}
</style></head><body>
<header><div class="brand"><span class="mark">↶</span> DevTimeMachine<span class="mark">.</span></div><span class="privacy">Local capture. Portable report.</span></header>
<main><section class="intro"><div><div class="eyebrow">Your UI, through time</div><h1>See what changed.</h1><p>Two moments. One slider. No account required.</p></div><span class="pill">${before.viewport.width} × ${before.viewport.height} · viewport capture</span></section>
<div class="viewer" id="viewer"><img src="data:${before.mime};base64,${before.image}" alt="Before: ${e(before.name)}" draggable="false"><div class="after"><img src="data:${after.mime};base64,${after.image}" alt="After: ${e(after.name)}" draggable="false"></div><div class="divider"><span class="handle">↔</span></div><span class="tag left">BEFORE</span><span class="tag right">AFTER</span></div>
<section class="controls" aria-label="Comparison controls"><div class="control-top"><label for="slider">Drag to travel through time <span id="position">· 50%</span></label><div class="buttons"><button type="button" id="reset">Center</button><button type="button" id="blink" aria-pressed="false">Blink</button></div></div><input id="slider" type="range" min="0" max="100" value="50" aria-label="Before and after divider position"><p class="hint">Arrow keys move the divider. Blink alternates full images; it pauses when this tab is hidden.</p></section>
<section class="meta"><article class="card"><small>01 / BEFORE</small><h2>${e(before.name)}</h2><p>${e(before.url)}</p><time>${stamp(before)}</time></article><article class="card"><small>02 / AFTER</small><h2>${e(after.name)}</h2><p>${e(after.url)}</p><time>${stamp(after)}</time></article></section></main>
<footer><span>Made with DevTimeMachine · Open source / MIT</span><span>Images are embedded. Open this file offline.</span></footer>
<script>
const viewer=document.getElementById('viewer'),slider=document.getElementById('slider'),position=document.getElementById('position'),blink=document.getElementById('blink');let timer;const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function stop(){clearInterval(timer);timer=undefined;viewer.classList.remove('blink','show-before');blink.setAttribute('aria-pressed','false');blink.textContent='Blink';slider.disabled=false}
function update(){viewer.style.setProperty('--split',slider.value+'%');position.textContent='· '+slider.value+'%'}
slider.addEventListener('input',()=>{stop();update()});document.getElementById('reset').addEventListener('click',()=>{stop();slider.value=50;update()});
blink.addEventListener('click',()=>{if(timer){stop();return}if(reduced.matches){viewer.classList.toggle('blink');viewer.classList.toggle('show-before',viewer.classList.contains('blink'));blink.setAttribute('aria-pressed',String(viewer.classList.contains('blink')));blink.textContent=viewer.classList.contains('blink')?'Back to slider':'Blink';return}viewer.classList.add('blink');slider.disabled=true;blink.setAttribute('aria-pressed','true');blink.textContent='Stop blink';timer=setInterval(()=>viewer.classList.toggle('show-before'),800)});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});reduced.addEventListener('change',stop);
</script></body></html>`;
}

export async function writeReport(before, after, output) {
  const html = renderReport(before, after);
  await mkdir(path.dirname(path.resolve(output)), { recursive: true });
  // Avoid replacing an existing file by accident.
  try { await writeFile(output, html, { flag: 'wx' }); }
  catch (error) {
    if (error.code === 'EEXIST') throw new Error(`Output "${output}" exists. Choose a new --out path.`);
    throw error;
  }
  return path.resolve(output);
}
