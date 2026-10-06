import { writeReport } from './report.mjs';

function illustration(after) {
  const bg = after ? '#f3f6ed' : '#f0f1f5';
  const accent = after ? '#45642f' : '#5964cb';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900">
<rect width="1440" height="900" fill="${bg}"/><rect x="64" y="34" width="1312" height="74" rx="18" fill="white"/>
<g font-family="Arial,sans-serif"><text x="94" y="81" font-size="27" font-weight="bold" fill="#202632">fieldwork.</text><text x="910" y="78" font-size="16" fill="#727a80">Product</text><text x="1010" y="78" font-size="16" fill="#727a80">Stories</text><rect x="1160" y="51" width="180" height="40" rx="20" fill="${accent}"/><text x="1193" y="77" font-size="15" fill="white">Start your project</text>
<text x="94" y="210" font-size="14" letter-spacing="3" fill="${accent}">${after ? 'LESS NOISE. MORE MOMENTUM.' : 'YOUR WORK, ORGANIZED.'}</text>
<text x="90" y="303" font-size="75" font-weight="bold" fill="#222b29">${after ? 'Make room for' : 'A better way'}</text><text x="90" y="391" font-size="75" font-weight="bold" fill="#222b29">${after ? 'your best work.' : 'to get it done.'}</text>
<text x="94" y="458" font-size="21" fill="#727a80">${after ? 'A calm workspace for people with big ideas.' : 'Tasks, projects and notes. All in one place.'}</text><text x="94" y="493" font-size="21" fill="#727a80">${after ? 'Find your focus. Build something that matters.' : 'Bring your team together and move faster.'}</text>
<rect x="94" y="537" width="235" height="62" rx="${after ? '31' : '10'}" fill="${accent}"/><text x="129" y="576" font-size="18" fill="white">${after ? 'Find your flow →' : 'Get started free →'}</text>
<text x="94" y="643" font-size="14" fill="#727a80">No credit card. Just a little headspace.</text>
<rect x="800" y="184" width="544" height="480" rx="${after ? '34' : '12'}" fill="${after ? '#dde7ca' : '#dce0fa'}"/>
${after ? '<circle cx="1248" cy="243" r="102" fill="#bdd098"/><circle cx="874" cy="591" r="105" fill="#cddcb4"/>' : ''}
<rect x="842" y="235" width="460" height="357" rx="16" fill="white"/><text x="871" y="278" font-size="13" letter-spacing="2" fill="${accent}">TODAY / YOUR SPACE</text><text x="871" y="323" font-size="26" font-weight="bold" fill="#202632">${after ? 'Good things take focus.' : 'Let’s get productive.'}</text>
${[0,1,2].map((n)=>`<rect x="871" y="${349+n*68}" width="400" height="52" rx="10" fill="${bg}"/><circle cx="895" cy="${375+n*68}" r="8" fill="${n===0 ? accent : '#b9bfc4'}"/><text x="919" y="${381+n*68}" font-size="16" fill="#505952">${['Sketch the next big idea','Leave space for a walk','Ship something thoughtful'][n]}</text>`).join('')}
<line x1="94" y1="728" x2="1344" y2="728" stroke="#cbd1c7"/><text x="94" y="781" font-size="12" letter-spacing="2" fill="#727a80">BUILT FOR YOUR EVERYDAY</text>
${['A clear place to start','Everything in its place','Progress that feels good'].map((t,n)=>`<text x="${94+n*423}" y="838" font-size="23" font-weight="bold" fill="#303c32">${t}</text>`).join('')}
</g></svg>`;
}

export async function demo(output) {
  const record = after => ({ name: after ? 'calmer-redesign' : 'original-design', url: 'Demo · fictional Fieldwork homepage', viewport: { width: 1440, height: 900 }, capturedAt: 'Sample artwork — no external site captured', mime: 'image/svg+xml', image: Buffer.from(illustration(after)).toString('base64') });
  return writeReport(record(false), record(true), output);
}
