// HERO — a Gargantua-style black hole with a lensed accretion disk, JWST spike stars,
// the name in glyph outlines with a light sweep, and a typed transmission line.
import { C, n, rng, text, textD, measure, Glyphs, starfield, spikeStar, spikeDefs, nebula, brackets, svgDoc, TWINKLE_CSS } from '../lib/kit.mjs';

const W = 1280, H = 600;
const BX = 985, BY = 296, R = 84; // black hole centre + shadow radius

const MESSAGES = [
  'Building & governing production AI agents',
  'Hermes Agent · 21 + 13 commits on main',
  'Local LLM systems · sub-2s end-to-end',
  '80% cost cut with a fully local LLM stack',
  '-40% latency on 50M-record pipelines',
  'RAG · LangChain · vector DBs · Ollama',
  'CV Challenge + Cognizant Vibe winner',
];

export function hero() {
  const r = rng(7031);
  const G = new Glyphs('h');
  let defs = '', body = '', css = TWINKLE_CSS;

  // ---------- backdrop ----------
  defs += `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03040b"/><stop offset=".55" stop-color="#060817"/><stop offset="1" stop-color="#03040a"/></linearGradient>
<radialGradient id="bhWarm" cx="${BX}" cy="${BY}" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ff9a3c" stop-opacity=".22"/><stop offset=".25" stop-color="#ff6a1f" stop-opacity=".09"/><stop offset=".6" stop-color="#5a1d6e" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<clipPath id="frame"><rect width="${W}" height="${H}" rx="22"/></clipPath>`;
  const neb = nebula(r, { cx: 360, cy: 250, w: 760, h: 420, colors: ['#3b1d8a', '#1b3f9a', '#7a1f6e', '#0f5566'], blobs: 16, maxOpacity: 0.28, idp: 'hn' });
  const neb2 = nebula(r, { cx: 1050, cy: 470, w: 520, h: 260, colors: ['#5a1d6e', '#1b2f7a'], blobs: 6, maxOpacity: 0.22, idp: 'hm' });
  defs += neb.defs + neb2.defs + spikeDefs('sp', '#cfe6ff') + spikeDefs('sg', '#ffd9a8');

  body += `<g clip-path="url(#frame)"><rect width="${W}" height="${H}" fill="url(#bg)"/>${neb.body}${neb2.body}
<rect width="${W}" height="${H}" fill="url(#bhWarm)"/>`;
  // milky-way-ish band rising left→right
  const band = (x, y) => {
    const d = Math.abs(y - (520 - x * 0.36)) / 170;
    return 0.22 + 0.78 * Math.exp(-d * d);
  };
  body += starfield(r, { w: W, h: H, count: 430, band, twinkle: 0.14, rMax: 1.25 });
  body += starfield(r, { w: W, h: H, count: 26, rMin: 1.1, rMax: 1.9, twinkle: 0.5, colors: ['#ffffff', '#d6ecff', '#ffe6c7'] });
  body += spikeStar(150, 92, 46, '#e6f2ff', { id: 'sp', cls: 'pulse' });
  body += spikeStar(612, 512, 28, '#ffe6c2', { id: 'sg' });
  body += spikeStar(1222, 74, 34, '#e6f2ff', { id: 'sp', cls: 'pulse p2' });
  body += spikeStar(452, 40, 16, '#e6f2ff', { id: 'sp' });
  body += spikeStar(760, 82, 14, '#ffe6c2', { id: 'sg' });
  css += `@keyframes pulse{0%,100%{opacity:1}50%{opacity:.55}}.pulse{animation:pulse 5s ease-in-out infinite}.p2{animation-delay:-2.5s}`;

  // shooting stars
  defs += `<linearGradient id="shoot" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>`;
  css += `@keyframes shoot{0%{transform:translate(0,0);opacity:0}2%{opacity:1}10%{transform:translate(-340px,150px);opacity:0}100%{transform:translate(-340px,150px);opacity:0}}
.shoot{animation:shoot 11s linear infinite;opacity:0}`;
  [[560, 60, 0], [1180, 180, -5.5], [330, 300, -8.2]].forEach(([x, y, d]) => {
    body += `<g class="shoot" style="animation-delay:${d}s"><line x1="${x}" y1="${y}" x2="${x + 90}" y2="${y - 40}" stroke="url(#shoot)" stroke-width="1.4" stroke-linecap="round" transform="rotate(180 ${x + 45} ${y - 20})"/></g>`;
  });

  // ---------- black hole ----------
  body += blackHole(r);

  // reticle around the singularity
  css += `@keyframes spin{to{transform:rotate(360deg)}}.ret{animation:spin 80s linear infinite;transform-origin:${BX}px ${BY}px}
.ret2{animation:spin 140s linear infinite reverse;transform-origin:${BX}px ${BY}px}`;
  let ticks = '';
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2, r1 = 236, r2 = i % 6 === 0 ? 228 : 232;
    ticks += `M${n(BX + Math.cos(a) * r1)} ${n(BY + Math.sin(a) * r1)}L${n(BX + Math.cos(a) * r2)} ${n(BY + Math.sin(a) * r2)}`;
  }
  body += `<g opacity=".55"><path d="${ticks}" stroke="${C.cyan}" stroke-width="1" opacity=".5"/>
<circle cx="${BX}" cy="${BY}" r="244" fill="none" stroke="${C.cyan}" stroke-width=".8" stroke-dasharray="1 7" opacity=".6"/></g>
<g opacity=".5"><circle cx="${BX}" cy="${BY}" r="262" fill="none" stroke="${C.cyan}" stroke-width="1" stroke-dasharray="60 24 4 24" opacity=".35"/></g>
<g class="ret"><circle cx="${BX + 244}" cy="${BY}" r="3" fill="${C.cyan}"/><circle cx="${BX + 244}" cy="${BY}" r="7" fill="none" stroke="${C.cyan}" opacity=".5"/></g>
<g class="ret2"><circle cx="${BX - 262}" cy="${BY}" r="2.4" fill="${C.gold}"/></g>`;
  // callout
  const ax = BX - 62, ay = BY - 104, cx1 = BX - 112, cy1 = BY - 186;
  body += `<path d="M${ax} ${ay}L${cx1} ${cy1}H${cx1 - 196}" fill="none" stroke="${C.cyan}" stroke-width="1" opacity=".55"/>
<circle cx="${ax}" cy="${ay}" r="2.5" fill="${C.cyan}"/><circle cx="${ax}" cy="${ay}" r="6" fill="none" stroke="${C.cyan}" opacity=".5"/>`;
  body += G.text('OBJ-001 · EVENT HORIZON', { font: 'jb600', size: 11, x: cx1 - 4, y: cy1 - 8, anchor: 'end', tracking: 0.16 }, `fill="${C.cyan}" opacity=".95"`).svg;
  body += G.text('ESCAPE VELOCITY > c', { font: 'jb400', size: 10.5, x: cx1 - 4, y: cy1 + 16, anchor: 'end', tracking: 0.12 }, `fill="${C.dim}" opacity=".85"`).svg;
  body += G.text('SPIN a* 0.998  ·  Rs 1.000', { font: 'jb400', size: 10.5, x: BX - 120, y: BY + 214, tracking: 0.12 }, `fill="${C.faint}"`).svg;

  // ---------- identity block ----------
  const X = 72;
  css += `@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}.blink{animation:blink 1.1s steps(1) infinite}
@keyframes rise{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
.rise{animation:rise 1.1s cubic-bezier(.2,.7,.1,1) both}
@keyframes fade{from{opacity:0}to{opacity:1}}.fade{animation:fade 1.6s ease-out both}
@keyframes sheen{0%,62%{transform:translateX(-260px)}100%{transform:translateX(820px)}}
.sheen{animation:sheen 7.5s cubic-bezier(.5,0,.3,1) infinite 1.8s}`;

  body += `<g class="fade" style="animation-delay:.2s"><circle cx="${X + 5}" cy="96" r="4.5" fill="${C.cyan}" class="blink"/><circle cx="${X + 5}" cy="96" r="9" fill="none" stroke="${C.cyan}" opacity=".35"/>`;
  body += G.text('INCOMING TRANSMISSION  ·  LONDON  51.5072°N 0.1276°W', { font: 'jb600', size: 12.5, x: X + 22, y: 100.5, tracking: 0.17 }, `fill="${C.cyan}"`).svg + '</g>';

  // name — per-letter paths in document space so one userSpace gradient spans the word
  defs += `<linearGradient id="nameG" gradientUnits="userSpaceOnUse" x1="${X}" y1="130" x2="${X + 560}" y2="290"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#dfe9ff"/><stop offset="1" stop-color="#9fc2ff"/></linearGradient>
<linearGradient id="sheenG" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
  const lines = [['MOHAMAD', 186], ['KANSO', 268]];
  let nameAll = '', letters = '', li = 0;
  for (const [word, y] of lines) {
    let x = X;
    for (const ch of word) {
      const d = textD(ch, { font: 'michroma', size: 64, x, y });
      nameAll += d;
      letters += `<path d="${d}" class="rise" style="animation-delay:${n(0.1 + li * 0.06)}s"/>`;
      x += measure(ch, { font: 'michroma', size: 64 }) + 0.06 * 64;
      li++;
    }
  }
  defs += `<clipPath id="nameClip"><path d="${nameAll}"/></clipPath>`;
  body += `<g fill="url(#nameG)">${letters}</g>
<g clip-path="url(#nameClip)"><rect class="sheen" x="${X - 120}" y="120" width="150" height="170" fill="url(#sheenG)" transform="skewX(-18)" opacity=".75"/></g>`;
  // accent rule under the name
  body += `<g class="fade" style="animation-delay:1.2s"><rect x="${X}" y="296" width="44" height="3" fill="${C.cyan}"/><rect x="${X + 52}" y="296" width="10" height="3" fill="${C.cyan}" opacity=".5"/><rect x="${X + 70}" y="296" width="4" height="3" fill="${C.cyan}" opacity=".3"/></g>`;

  const role = G.text('SENIOR FORWARD DEPLOYED AI ASSOCIATE', { font: 'jb600', size: 14, x: X, y: 336, tracking: 0.2 }, `fill="${C.text}"`);
  body += `<g class="fade" style="animation-delay:1.3s">${role.svg}`;
  body += G.text('@ 7IM', { font: 'jb800', size: 14, x: X + role.width + 14, y: 336, tracking: 0.2 }, `fill="${C.cyan}"`).svg + '</g>';

  // typed transmission line
  body += `<g class="fade" style="animation-delay:1.6s">` + typer(G, X, 386) + '</g>';

  // capability chips
  let cx = X;
  let chips = '';
  for (const label of ['PRODUCTION AI AGENTS', 'LLM SYSTEMS', 'AI GOVERNANCE']) {
    const w = measure(label, { font: 'jb600', size: 11.5, tracking: 0.16 }) + 30;
    chips += `<rect x="${n(cx)}" y="430" width="${n(w)}" height="30" rx="3" fill="${C.cyan}" fill-opacity=".05" stroke="${C.cyan}" stroke-opacity=".35"/>`;
    chips += brackets(cx - 3, 427, w + 6, 36, { len: 6, op: 0.9, sw: 1.2 });
    chips += G.text(label, { font: 'jb600', size: 11.5, x: cx + 15, y: 449.5, tracking: 0.16 }, `fill="${C.text}"`).svg;
    cx += w + 16;
  }
  body += `<g class="fade" style="animation-delay:1.9s">${chips}</g>`;

  // ---------- HUD chrome ----------
  body += brackets(22, 22, W - 44, H - 44, { len: 26, op: 0.55, sw: 1.5 });
  let rule = '';
  for (let i = 0; i <= 120; i++) {
    const x = 70 + i * ((W - 140) / 120), h = i % 10 === 0 ? 7 : i % 5 === 0 ? 4.5 : 2.5;
    rule += `M${n(x)} ${H - 52}v${-h}`;
  }
  body += `<path d="${rule}" stroke="${C.cyan}" stroke-width=".8" opacity=".3"/>`;
  body += `<rect x="70" y="${H - 52}" width="${W - 140}" height=".8" fill="${C.cyan}" opacity=".2"/>`;
  css += `@keyframes scan{from{transform:translateX(0)}to{transform:translateX(${W - 140}px)}}.scan{animation:scan 9s ease-in-out infinite alternate}`;
  body += `<g class="scan"><rect x="68" y="${H - 64}" width="3" height="14" fill="${C.cyan}" opacity=".9"/><rect x="58" y="${H - 64}" width="22" height="14" fill="${C.cyan}" opacity=".08"/></g>`;
  body += G.text('KANSO//OS  2.0', { font: 'jb600', size: 10.5, x: 70, y: H - 30, tracking: 0.22 }, `fill="${C.faint}"`).svg;
  body += G.text('DEEP FIELD · CHANNEL 07 · UPLINK STABLE', { font: 'jb400', size: 10.5, x: W / 2, y: H - 30, anchor: 'middle', tracking: 0.22 }, `fill="${C.faint}"`).svg;
  const sig = G.text('SIGNAL', { font: 'jb600', size: 10.5, x: W - 160, y: H - 30, tracking: 0.22 }, `fill="${C.faint}"`);
  body += sig.svg;
  css += `@keyframes bar{0%,100%{opacity:1}50%{opacity:.25}}.bar{animation:bar 1.6s ease-in-out infinite}`;
  for (let i = 0; i < 5; i++) {
    body += `<rect x="${W - 160 + sig.width + 12 + i * 7}" y="${H - 30 - 3 - i * 2}" width="4" height="${4 + i * 2}" fill="${i < 4 ? C.cyan : C.ghost}" ${i === 3 ? 'class="bar"' : ''} opacity=".85"/>`;
  }
  body += G.text('REC', { font: 'jb600', size: 10.5, x: W - 70, y: 54, anchor: 'end', tracking: 0.22 }, `fill="${C.faint}"`).svg;
  body += `<circle cx="${W - 58}" cy="50.5" r="4" fill="${C.red}" class="blink"/>`;
  body += `</g>`; // frame clip
  body += `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="22" fill="none" stroke="${C.lineHi}" opacity=".9"/>`;

  defs += G.defs();
  return svgDoc({
    w: W, h: H,
    title: 'Mohamad Kanso — Senior Forward Deployed AI Associate at 7IM',
    desc: 'A black hole with a glowing, lensed accretion disk beside the name Mohamad Kanso. Building and governing production AI agents.',
    css, defs, body,
  });
}

function blackHole(r) {
  let defs = '', s = '', css = '';
  const TILT = -8;
  const RX = R * 3.95, RY = RX * 0.15;      // outer disk
  const inner = (R * 1.3) / RX;              // ISCO as a fraction of the outer radius
  const dash = (sum = 125, dMin = 14, dMax = 46, gMin = 8, gMax = 34) => {
    const parts = []; let left = sum;
    while (left > 0) {
      const a = Math.min(left, Math.round(dMin + r() * (dMax - dMin))); parts.push(a); left -= a;
      const b = Math.min(left, Math.round(gMin + r() * (gMax - gMin))); parts.push(b); left -= b;
    }
    return parts.join(' ');
  };
  defs += `<radialGradient id="diskRG"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="${n(inner - 0.01, 3)}" stop-color="#fff" stop-opacity="0"/><stop offset="${n(inner + 0.005, 3)}" stop-color="#fffaf0"/><stop offset="${n(inner + 0.06, 3)}" stop-color="#ffe2b0"/><stop offset="${n(inner + 0.17, 3)}" stop-color="#ffb055" stop-opacity=".92"/><stop offset="${n(inner + 0.36, 3)}" stop-color="#f06a22" stop-opacity=".55"/><stop offset=".9" stop-color="#9c2c14" stop-opacity=".18"/><stop offset="1" stop-color="#5a1408" stop-opacity="0"/></radialGradient>
<radialGradient id="diskGlow"><stop offset="0" stop-color="#ffe7c2" stop-opacity=".7"/><stop offset=".35" stop-color="#ff9a3c" stop-opacity=".28"/><stop offset=".7" stop-color="#ff5a1f" stop-opacity=".08"/><stop offset="1" stop-color="#ff5a1f" stop-opacity="0"/></radialGradient>
<radialGradient id="lensRG"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".56" stop-color="#fff" stop-opacity="0"/><stop offset=".585" stop-color="#ffffff"/><stop offset=".615" stop-color="#fff0d0"/><stop offset=".66" stop-color="#ffc878" stop-opacity=".85"/><stop offset=".76" stop-color="#ff9a3c" stop-opacity=".42"/><stop offset=".9" stop-color="#d0491c" stop-opacity=".14"/><stop offset="1" stop-color="#d0491c" stop-opacity="0"/></radialGradient>
<linearGradient id="dop" x1="${-RX}" x2="${RX}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity=".38"/></linearGradient>
<linearGradient id="dopDark" x1="0" x2="1"><stop offset="0" stop-color="#03040b" stop-opacity="0"/><stop offset=".5" stop-color="#03040b" stop-opacity="0"/><stop offset="1" stop-color="#03040b" stop-opacity=".62"/></linearGradient>
<linearGradient id="arcFade" x1="0" x2="1"><stop offset="0" stop-color="#fff3dc" stop-opacity="0"/><stop offset=".22" stop-color="#fff3dc"/><stop offset=".78" stop-color="#fff3dc"/><stop offset="1" stop-color="#fff3dc" stop-opacity="0"/></linearGradient>
<linearGradient id="arcFadeW" x1="0" x2="1"><stop offset="0" stop-color="#ffcf8a" stop-opacity="0"/><stop offset=".25" stop-color="#fff6e6"/><stop offset=".75" stop-color="#fff6e6"/><stop offset="1" stop-color="#ffcf8a" stop-opacity="0"/></linearGradient>
<mask id="dopM" maskUnits="userSpaceOnUse" x="${-R * 5}" y="${-R * 3}" width="${R * 10}" height="${R * 6}"><rect x="${-R * 5}" y="${-R * 3}" width="${R * 10}" height="${R * 6}" fill="url(#dop)"/></mask>
<clipPath id="backHalf"><rect x="${-R * 6}" y="${-R * 4}" width="${R * 12}" height="${R * 4}"/></clipPath>
<clipPath id="frontHalf"><rect x="${-R * 6}" y="0" width="${R * 12}" height="${R * 4}"/></clipPath>
<radialGradient id="photon"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".84" stop-color="#ffd9a0" stop-opacity="0"/><stop offset=".9" stop-color="#fff8ea"/><stop offset=".935" stop-color="#ffcf8a" stop-opacity=".6"/><stop offset="1" stop-color="#ff8a2e" stop-opacity="0"/></radialGradient>
<linearGradient id="lensMaskG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="#fff" stop-opacity=".9"/><stop offset=".5" stop-color="#fff" stop-opacity=".35"/><stop offset=".65" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity=".5"/></linearGradient>
<mask id="lensM" maskUnits="userSpaceOnUse" x="${-R * 2.2}" y="${-R * 2.2}" width="${R * 4.4}" height="${R * 4.4}"><rect x="${-R * 2.2}" y="${-R * 1.9}" width="${R * 4.4}" height="${R * 3.8}" fill="url(#lensMaskG)"/></mask>`;
  css += `@keyframes flow{to{stroke-dashoffset:-1000}}.flow{animation:flow 8s linear infinite}
`;

  // motion streaks riding on the disk: thin, long, low-contrast dashes (pathLength 1000 → seamless loop)
  let streaks = '';
  for (let i = 0; i < 34; i++) {
    const t = i / 33;
    const rx = R * 1.34 + t * (RX - R * 1.5) + (r() - 0.5) * 4;
    const col = t < 0.25 ? '#fff6e2' : t < 0.55 ? '#ffd296' : '#ffab62';
    streaks += `<ellipse rx="${n(rx)}" ry="${n(rx * 0.15)}" pathLength="1000" fill="none" stroke="${col}" stroke-width="${n(0.6 + r() * 1.3)}" stroke-opacity="${n(0.55 - t * 0.38 + r() * 0.12)}" stroke-dasharray="${dash()}" class="flow" style="animation-duration:${n(4 + Math.pow(rx / (R * 1.3), 1.5) * 2.6, 1)}s;animation-delay:${n(-r() * 20, 1)}s"/>`;
  }
  // lensed far side of the disk: bright arcs over the top, a thin secondary image underneath
  const arc = (rr, cy, a1, a2) => {
    const ry = rr * 0.94, rad = (a) => (a * Math.PI) / 180;
    const x1 = rr * Math.cos(rad(a1)), y1 = cy + ry * Math.sin(rad(a1)), x2 = rr * Math.cos(rad(a2)), y2 = cy + ry * Math.sin(rad(a2));
    return `M${n(x1)} ${n(y1)}A${n(rr)} ${n(ry)} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${n(x2)} ${n(y2)}`;
  };
  let lensStreaks = '';
  for (let i = 0; i < 10; i++) {
    const t = i / 9, rr = R * (1.06 + t * 0.55), cy = -3 - t * 3;
    lensStreaks += `<path d="${arc(rr, cy, 168, 372)}" pathLength="1000" fill="none" stroke="url(#arcFade)" stroke-width="${n(0.8 + r() * 1.1)}" stroke-opacity="${n(0.75 - t * 0.45)}" stroke-dasharray="${dash()}" class="flow" style="animation-duration:${n(5 + t * 7, 1)}s;animation-delay:${n(-r() * 10, 1)}s"/>`;
    if (i < 4) lensStreaks += `<path d="${arc(rr, cy, 25, 155)}" pathLength="1000" fill="none" stroke="url(#arcFade)" stroke-width="${n(0.6 + r() * 0.6)}" stroke-opacity="${n(0.4 - t * 0.2)}" stroke-dasharray="${dash()}" class="flow" style="animation-duration:${n(6 + t * 6, 1)}s;animation-delay:${n(-r() * 10, 1)}s"/>`;
  }
  // solid lensed arcs underneath the streaks
  let lensBase = '';
  for (let i = 0; i < 5; i++) {
    const t = i / 4, rr = R * (1.08 + t * 0.42);
    lensBase += `<path d="${arc(rr, -3 - t * 3, 170, 370)}" fill="none" stroke="url(#arcFadeW)" stroke-width="${n(4.5 - t * 3)}" stroke-opacity="${n(0.55 - t * 0.35)}"/>`;
  }
  const disk = `<ellipse rx="${n(RX)}" ry="${n(RY)}" fill="url(#diskRG)"/>${streaks}`;
  s += `<g transform="translate(${BX} ${BY}) rotate(${TILT})">
<ellipse rx="${n(RX * 1.08)}" ry="${n(R * 1.1)}" fill="url(#diskGlow)" opacity=".6"/>
<circle r="${n(R * 2.3)}" fill="url(#diskGlow)" opacity=".35"/>
<g clip-path="url(#backHalf)">${disk}</g>
<ellipse cy="-4" rx="${n(R * 1.78)}" ry="${n(R * 1.66)}" fill="url(#lensRG)" opacity=".85"/>${lensBase}${lensStreaks}
<circle r="${n(R * 1.12)}" fill="url(#photon)"/>
<circle r="${R}" fill="#000"/>
<circle r="${n(R * 1.008)}" fill="none" stroke="#fff4e0" stroke-width="1.2" opacity=".85"/>
<g clip-path="url(#frontHalf)">${disk}</g>
<ellipse rx="${n(RX * 1.02)}" ry="${n(R * 1.9)}" fill="url(#dopDark)"/>
</g>`;
  return `<defs>${defs}</defs><style>${css}</style>` + s;
}

function typer(G, X, Y) {
  const SIZE = 19, CW = SIZE * 0.6;
  const prompt = G.text('▸', { font: 'jb800', size: SIZE, x: X, y: Y }, `fill="${C.cyan}"`);
  const x0 = X + 28;
  // timeline
  const TYPE = 0.055, HOLD = 2.3, DEL = 0.018, GAP = 0.4;
  const slots = [];
  let t = 0.3;
  for (const m of MESSAGES) {
    const L = [...m].length;
    const start = t, typed = start + L * TYPE, held = typed + HOLD, gone = held + L * DEL;
    slots.push({ m, L, start, typed, held, gone });
    t = gone + GAP;
  }
  const T = t;
  const kt = (v) => n(v / T, 5);
  let out = prompt.svg;
  let defs = '';
  const cursorKeys = [[0, 0]];
  slots.forEach((sl, i) => {
    const keys = [[0, 0]];
    for (let k = 1; k <= sl.L; k++) keys.push([sl.start + k * TYPE, k]);
    for (let k = sl.L - 1; k >= 0; k--) keys.push([sl.held + (sl.L - k) * DEL, k]);
    keys.forEach(([tt, k]) => cursorKeys.push([tt, k]));
    const vals = keys.map(([, k]) => n(k * CW, 1)).join(';');
    const times = keys.map(([tt]) => kt(tt)).join(';');
    defs += `<clipPath id="ty${i}"><rect x="${x0}" y="${Y - SIZE}" width="0" height="${SIZE * 1.4}"><animate attributeName="width" values="${vals}" keyTimes="${times}" dur="${n(T, 3)}s" calcMode="discrete" repeatCount="indefinite"/></rect></clipPath>`;
    out += `<g clip-path="url(#ty${i})">${G.text(sl.m, { font: 'jb400', size: SIZE, x: x0, y: Y }, `fill="${C.text}"`).svg}</g>`;
  });
  cursorKeys.sort((a, b) => a[0] - b[0]);
  const cv = cursorKeys.map(([, k]) => `${n(k * CW, 1)} 0`).join(';');
  const ct = cursorKeys.map(([tt]) => kt(tt)).join(';');
  out += `<g><animateTransform attributeName="transform" type="translate" values="${cv}" keyTimes="${ct}" dur="${n(T, 3)}s" calcMode="discrete" repeatCount="indefinite"/><rect x="${x0 + 1}" y="${Y - SIZE * 0.8}" width="${n(CW * 0.9)}" height="${n(SIZE * 1.02)}" fill="${C.cyan}" class="blink" opacity=".9"/></g>`;
  return `<defs>${defs}</defs>` + out;
}
