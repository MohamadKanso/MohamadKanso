// THE KANSO SYSTEM — every planet is a shipped project.
// Orbits are exact ellipses (a rotating frame inside a squashed, tilted plane), periods follow
// Kepler's third law (T² ∝ r³), each planet's lit side tracks the star, planets pass behind the star,
// and the Hermes comet runs a real eccentric Kepler orbit (fast at perihelion) with its tail pointing away from the star.
import { C, n, rng, text, measure, Glyphs, starfield, spikeStar, spikeDefs, nebula, brackets, svgDoc, TWINKLE_CSS } from '../lib/kit.mjs';

const W = 1280, H = 860;
const CX = 640, CY = 500;        // star
const K = 0.3;                   // plane squash (view inclination)
const TILT = -6;                 // plane tilt in degrees
const SAMPLES = 36;

export const PLANETS = [
  { key: 'vsk', name: 'VOICESAFEKIT', sub: 'VOICE PII GUARD', r: 150, size: 17, art: 'ice', color: '#5ee7ff', live: true },
  { key: 'cs', name: 'CODESENTRY', sub: 'LOCAL AI CODE REVIEW', r: 208, size: 19, art: 'emerald', color: '#5dffa8', live: true },
  { key: 'mx', name: 'MURMURX', sub: 'SUB-2S LOCAL VOICE AI', r: 268, size: 18, art: 'pulsar', color: '#ff7ad9' },
  { key: 'ds', name: 'DREAMSENSE', sub: 'WINNER · MULTI-MODAL', r: 330, size: 29, art: 'giant', color: '#b79bff' },
  { key: 'if', name: 'INCIDENTFORGE', sub: 'AI SRE BENCHMARKS', r: 398, size: 19, art: 'lava', color: '#ff7a3c' },
  { key: 'wf', name: 'WORKFLOWFORGE', sub: 'WORKFLOW ENGINE', r: 458, size: 21, art: 'ringed', color: '#ffc46b' },
  { key: 'btc', name: 'BTC LSTM', sub: 'FIRST-CLASS · 76%', r: 515, size: 18, art: 'gold', color: '#ffe08a' },
  { key: 'tml', name: 'TRADING ML', sub: '700+ RUNS ANALYSED', r: 568, size: 20, art: 'ocean', color: '#6fa8ff' },
];

const period = (r) => 15 * Math.pow(r / 150, 1.5); // seconds; Kepler's third law
const plane = (x, y) => {
  // in-plane (x,y) → screen offset from the star
  const a = (TILT * Math.PI) / 180;
  const yy = y * K;
  return [x * Math.cos(a) - yy * Math.sin(a), x * Math.sin(a) + yy * Math.cos(a)];
};

export function universe() {
  const r = rng(90210);
  const G = new Glyphs('u');
  let defs = '', css = TWINKLE_CSS, body = '';

  // ---------- shared orbital keyframes ----------
  css += `@keyframes sp{to{transform:rotate(360deg)}}@keyframes usp{to{transform:rotate(-360deg)}}
.sp{animation:sp linear infinite}.usp{animation:usp linear infinite}
@keyframes fr{0%{opacity:1}50%{opacity:0}100%{opacity:0}}@keyframes bk{0%{opacity:0}50%{opacity:1}100%{opacity:1}}
.fr{animation:fr linear infinite;animation-timing-function:step-end}.bk{animation:bk linear infinite;animation-timing-function:step-end}`;
  // depth scale and lit-side direction depend only on orbital phase → one keyframe set for all planets
  let dp = '', sh = '', prev = null, acc = 0;
  for (let i = 0; i <= SAMPLES; i++) {
    const th = (i / SAMPLES) * Math.PI * 2;
    const pct = n((i / SAMPLES) * 100, 3);
    dp += `${pct}%{transform:scale(${n(1 + 0.2 * Math.sin(th), 3)})}`;
    const [px, py] = plane(Math.cos(th), Math.sin(th));
    let ang = (Math.atan2(-py, -px) * 180) / Math.PI;
    if (prev !== null) { while (ang - prev > 180) ang -= 360; while (ang - prev < -180) ang += 360; }
    prev = ang; acc = ang;
    sh += `${pct}%{transform:rotate(${n(ang, 2)}deg)}`;
  }
  css += `@keyframes dp{${dp}}@keyframes sh{${sh}}.dp{animation:dp linear infinite}.sh{animation:sh linear infinite}`;
  css += `@keyframes spin{to{transform:rotate(360deg)}}@keyframes rspin{to{transform:rotate(-360deg)}}@keyframes corona{0%,100%{transform:scale(1);opacity:.22}50%{transform:scale(1.12);opacity:.34}}`;

  // ---------- backdrop ----------
  defs += `<linearGradient id="ubg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#02030a"/><stop offset=".5" stop-color="#050716"/><stop offset="1" stop-color="#02030a"/></linearGradient>
<clipPath id="uframe"><rect width="${W}" height="${H}" rx="22"/></clipPath>`;
  const neb = nebula(r, { cx: 640, cy: 470, w: 1300, h: 600, colors: ['#2a1670', '#123a8a', '#5c1a6a', '#0b4a5e'], blobs: 18, maxOpacity: 0.22, idp: 'un' });
  defs += neb.defs + spikeDefs('us', '#cfe6ff');
  body += `<g clip-path="url(#uframe)"><rect width="${W}" height="${H}" fill="url(#ubg)"/>${neb.body}`;
  const band = (x, y) => { const d = Math.abs(y - (90 + x * 0.42)) / 150; return 0.25 + 0.75 * Math.exp(-d * d); };
  body += starfield(r, { w: W, h: H, count: 520, band, twinkle: 0.13, rMax: 1.2 });
  body += starfield(r, { w: W, h: H, count: 24, rMin: 1, rMax: 1.8, twinkle: 0.5 });
  body += spikeStar(92, 640, 30, '#e6f2ff', { id: 'us' }) + spikeStar(1196, 745, 24, '#e6f2ff', { id: 'us' }) + spikeStar(372, 92, 18, '#e6f2ff', { id: 'us' });
  body += farGalaxy(r, 862, 118);

  // ---------- orbital plane ----------
  const P = `translate(${CX} ${CY}) rotate(${TILT}) scale(1 ${K})`;
  const UNP = `scale(1 ${n(1 / K, 5)}) rotate(${-TILT})`;
  defs += `<clipPath id="backC"><rect x="-700" y="-700" width="1400" height="700"/></clipPath><clipPath id="frontC"><rect x="-700" y="0" width="1400" height="700"/></clipPath>
<radialGradient id="gridFade" cx="0" cy="0" r="640" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".12" stop-color="#fff" stop-opacity=".9"/><stop offset=".7" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="gridM" maskUnits="userSpaceOnUse" x="-660" y="-660" width="1320" height="1320"><rect x="-660" y="-660" width="1320" height="1320" fill="url(#gridFade)"/></mask>`;
  // holographic grid
  let grid = '';
  for (let rr = 60; rr <= 640; rr += 58) grid += `<circle r="${rr}" fill="none"/>`;
  for (let a = 0; a < 360; a += 15) {
    const rad = (a * Math.PI) / 180;
    grid += `<path d="M${n(Math.cos(rad) * 60)} ${n(Math.sin(rad) * 60)}L${n(Math.cos(rad) * 640)} ${n(Math.sin(rad) * 640)}"/>`;
  }
  body += `<g transform="${P}"><g mask="url(#gridM)" stroke="${C.cyan}" stroke-opacity=".09" stroke-width="1" vector-effect="non-scaling-stroke" fill="none">${grid.replace(/\/>/g, ' vector-effect="non-scaling-stroke"/>')}</g></g>`;

  // orbits — back halves (dim, dashed) now; front halves after the star
  const orbitsBack = PLANETS.map((p) => `<circle r="${p.r}" fill="none" stroke="${p.color}" stroke-opacity=".2" stroke-width="1" stroke-dasharray="2 5" vector-effect="non-scaling-stroke"/>`).join('');
  const orbitsFront = PLANETS.map((p) => `<circle r="${p.r}" fill="none" stroke="${p.color}" stroke-opacity=".34" stroke-width="1.1" vector-effect="non-scaling-stroke"/>`).join('');
  body += `<g transform="${P}"><g clip-path="url(#backC)">${orbitsBack}</g></g>`;

  // asteroid belt between DreamSense and IncidentForge
  let belt = '';
  for (let i = 0; i < 260; i++) {
    const a = r() * Math.PI * 2, rr = 362 + (r() + r() - 1) * 14;
    belt += `<circle cx="${n(Math.cos(a) * rr, 1)}" cy="${n(Math.sin(a) * rr, 1)}" r="${n(0.7 + r() * 1.6, 1)}" fill="${r() < 0.7 ? '#9aa3c7' : '#d8c3a5'}" opacity="${n(0.25 + r() * 0.55)}"/>`;
  }
  body += `<g transform="${P}">${belt}</g>`;

  // trails riding just behind each planet
  const timing = PLANETS.map((p, i) => {
    const T = period(p.r);
    const phase = (i * 0.618034 + 0.13) % 1;
    return { T, D: -T * phase };
  });
  const anim = (i) => `animation-duration:${n(timing[i].T, 2)}s;animation-delay:${n(timing[i].D, 2)}s`;
  let trails = '';
  PLANETS.forEach((p, i) => {
    const seg = (len, op, w) => `<circle r="${p.r}" fill="none" stroke="${p.color}" stroke-opacity="${op}" stroke-width="${w}" pathLength="1000" stroke-dasharray="${len} ${1000 - len}" stroke-dashoffset="${len}" vector-effect="non-scaling-stroke" stroke-linecap="round"/>`;
    trails += `<g class="sp" style="${anim(i)}">${seg(150, 0.07, 3)}${seg(80, 0.14, 2.4)}${seg(32, 0.32, 2)}</g>`;
  });
  // (orbit trails dropped: a rotating full-orbit stroke forces a full-frame repaint every frame)

  // planet art (once) + layers
  const arts = PLANETS.map((p) => planetArt(p, r));
  arts.forEach((a) => (defs += a.defs, css += a.css));
  const copy = (p, i, layer) => `<g class="sp" style="${anim(i)}"><g transform="translate(${p.r} 0)"><g class="usp" style="${anim(i)}"><g transform="${UNP}">
<g class="${layer}" style="${anim(i)}">${label(G, p)}<g class="dp" style="${anim(i)}">${arts[i].svg}<g class="sh" style="${anim(i)}"><circle r="${p.size + 0.4}" fill="url(#shade)"/></g>${arts[i].over || ''}</g></g></g></g></g></g>`;
  defs += `<linearGradient id="shade" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#02030a" stop-opacity="0"/><stop offset=".38" stop-color="#02030a" stop-opacity=".05"/><stop offset=".56" stop-color="#02030a" stop-opacity=".62"/><stop offset=".75" stop-color="#02030a" stop-opacity=".86"/><stop offset="1" stop-color="#02030a" stop-opacity=".92"/></linearGradient>`;

  const comet = hermesComet(G, r);
  defs += comet.defs;

  body += comet.orbitLabel;
  // back layer: outer → inner
  body += `<g transform="${P}">${PLANETS.map((p, i) => [p, i]).reverse().map(([p, i]) => copy(p, i, 'bk')).join('')}</g>`;
  body += comet.back;

  // ---------- the star ----------
  body += star(r);
  defs += starDefs();

  // front orbit halves + front planets: inner → outer
  body += `<g transform="${P}"><g clip-path="url(#frontC)">${orbitsFront}</g></g>`;
  body += `<g transform="${P}">${PLANETS.map((p, i) => copy(p, i, 'fr')).join('')}</g>`;
  body += comet.front;

  // star label
  body += G.text('MK-01 · HOST STAR', { font: 'jb600', size: 12, x: CX, y: CY + 78, anchor: 'middle', tracking: 0.2 }, `fill="${C.text}" opacity=".85"`).svg;

  // ---------- HUD ----------
  body += text('THE KANSO SYSTEM', { font: 'michroma', size: 30, x: 64, y: 92, tracking: 0.08 }, 'fill="url(#titleG)"');
  defs += `<linearGradient id="titleG" x1="0" x2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#a9c8ff"/></linearGradient>`;
  body += text('Every world in this system is something I built and shipped.', { font: 'sg400', size: 17, x: 65, y: 124 }, `fill="${C.dim}"`);
  body += `<circle cx="70" cy="153" r="3.5" fill="${C.green}" class="tw"/>`;
  body += G.text('ORBITAL MAP · LIVE · 8 WORLDS · 1 COMET', { font: 'jb600', size: 11, x: 82, y: 157, tracking: 0.2 }, `fill="${C.cyan}" opacity=".9"`).svg;

  // status panel
  const px = W - 330, py = 52;
  body += `<rect x="${px}" y="${py}" width="270" height="128" rx="6" fill="#070a1c" fill-opacity=".72" stroke="${C.lineHi}"/>` + brackets(px - 4, py - 4, 278, 136, { len: 10, op: 0.8 });
  const rows = [['HOST STAR', 'MK-01'], ['WORLDS', '08'], ['COMETS', '01 · HERMES'], ['ORBITS', "KEPLER'S 3RD LAW"], ['STATUS', '● NOMINAL']];
  rows.forEach(([k, v], i) => {
    const y = py + 30 + i * 21;
    body += G.text(k, { font: 'jb400', size: 11, x: px + 18, y, tracking: 0.14 }, `fill="${C.faint}"`).svg;
    body += G.text(v, { font: 'jb600', size: 11, x: px + 252, y, anchor: 'end', tracking: 0.12 }, `fill="${i === 4 ? C.green : C.text}"`).svg;
  });

  // footer HUD
  body += `<path d="M64 ${H - 58}h120M64 ${H - 62}v8M124 ${H - 60}v4M184 ${H - 62}v8" stroke="${C.dim}" stroke-width="1" opacity=".7"/>`;
  body += G.text('1 AU', { font: 'jb600', size: 10.5, x: 196, y: H - 54, tracking: 0.2 }, `fill="${C.dim}"`).svg;
  body += G.text('LIT SIDES TRACK THE STAR · WORLDS PASS BEHIND IT · THE COMET SPEEDS UP AT PERIHELION', { font: 'jb400', size: 11, x: 64, y: H - 30, tracking: 0.14 }, `fill="${C.faint}"`).svg;
  body += G.text('PURE SVG · ZERO JAVASCRIPT', { font: 'jb600', size: 12.5, x: W - 64, y: H - 30, anchor: 'end', tracking: 0.22 }, `fill="${C.cyan}" opacity=".75"`).svg;
  body += brackets(22, 22, W - 44, H - 44, { len: 26, op: 0.5 });
  body += `</g><rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="22" fill="none" stroke="${C.lineHi}"/>`;

  defs += G.defs();
  return svgDoc({
    w: W, h: H, title: 'The Kanso System — an animated solar system of Mohamad Kanso’s projects',
    desc: 'A blue-white star orbited by eight planets, one per project: VoiceSafeKit, CodeSentry, MurmurX, DreamSense, IncidentForge, WorkflowForge, the BTC LSTM dissertation and Trading ML research, plus the Hermes Agent comet.',
    css, defs, body,
  });
}

function label(G, p) {
  const y = -(p.size * 1.2 + 16);
  const t = G.text(p.name, { font: 'jb600', size: 14, x: 0, y, anchor: 'middle', tracking: 0.14 }, `fill="${p.color}"`);
  const s = G.text(p.sub, { font: 'jb400', size: 10.5, x: 0, y: y + 14.5, anchor: 'middle', tracking: 0.12 }, `fill="${C.dim}"`);
  const w = Math.max(t.width, s.width) + 16;
  return `<rect x="${n(-w / 2)}" y="${n(y - 15.5)}" width="${n(w)}" height="35" rx="3" fill="#03040c" fill-opacity=".55"/>${t.svg}${s.svg}<path d="M0 ${n(y + 20)}V${n(-p.size * 1.2 - 3)}" stroke="${p.color}" stroke-opacity=".5"/>${p.live ? `<circle cx="${n(w / 2 - 1)}" cy="${n(y - 14)}" r="3" fill="${C.green}" class="tw"/>` : ''}`;
}

export function planetArt(p, r) {
  const id = p.key, s = p.size;
  let defs = '', css = '', svg = '', over = '';
  const glow = `<radialGradient id="${id}-glow"><stop offset="0" stop-color="${p.color}" stop-opacity=".45"/><stop offset=".4" stop-color="${p.color}" stop-opacity=".12"/><stop offset="1" stop-color="${p.color}" stop-opacity="0"/></radialGradient>`;
  defs += glow + `<clipPath id="${id}-clip"><circle r="${s}"/></clipPath>`;
  svg += `<circle r="${n(s * 2.6)}" fill="url(#${id}-glow)"/>`;
  const sphere = (c0, c1, c2, c3 = '#050510') => `<radialGradient id="${id}-b" cx=".38" cy=".34" r=".75"><stop offset="0" stop-color="${c0}"/><stop offset=".35" stop-color="${c1}"/><stop offset=".78" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></radialGradient>`;
  const spin = (sec, rev = false) => `animation:${rev ? 'rspin' : 'spin'} ${sec}s linear infinite`;

  if (p.art === 'ice') {
    defs += sphere('#f2feff', '#9af0ff', '#2a8fb0', '#0a3346');
    svg += `<circle r="${s}" fill="url(#${id}-b)"/>`;
    svg += `<g clip-path="url(#${id}-clip)" opacity=".35"><path d="M${-s} ${-s * 0.3}Q0 ${-s * 0.55} ${s} ${-s * 0.25}M${-s} ${s * 0.25}Q0 ${s * 0.05} ${s} ${s * 0.35}" stroke="#fff" stroke-width="1.4" fill="none"/></g>`;
    css += `@keyframes ${id}p{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.9);opacity:0}}`;
    over += `<circle r="${n(s * 1.5)}" fill="none" stroke="${p.color}" stroke-width="1.2" stroke-dasharray="3 3" opacity=".7" style="${spin(14)}"/>`;
    over += `<circle r="${n(s * 1.15)}" fill="none" stroke="${p.color}" stroke-width="1" style="animation:${id}p 3s ease-out infinite"/>`;
  } else if (p.art === 'emerald') {
    defs += sphere('#eafff3', '#7dffb9', '#13915a', '#04261a');
    defs += `<linearGradient id="${id}-scan" x1="0" x2="1"><stop offset="0" stop-color="${p.color}" stop-opacity="0"/><stop offset="1" stop-color="${p.color}" stop-opacity=".85"/></linearGradient>`;
    svg += `<circle r="${s}" fill="url(#${id}-b)"/>`;
    svg += `<g clip-path="url(#${id}-clip)" opacity=".28" stroke="#eafff3" stroke-width="1" fill="none"><path d="M${-s} ${-s * 0.4}H${s}M${-s} 0H${s}M${-s} ${s * 0.4}H${s}M${-s * 0.4} ${-s}V${s}M${s * 0.4} ${-s}V${s}"/></g>`;
    over += `<g style="${spin(4)}"><path d="M0 0L${n(s * 1.75)} 0A${n(s * 1.75)} ${n(s * 1.75)} 0 0 0 ${n(s * 1.75 * Math.cos(-0.7))} ${n(s * 1.75 * Math.sin(-0.7))}Z" fill="url(#${id}-scan)" opacity=".35"/></g>`;
    over += `<circle r="${n(s * 1.75)}" fill="none" stroke="${p.color}" stroke-opacity=".35" stroke-width="1"/>`;
  } else if (p.art === 'pulsar') {
    defs += sphere('#fff0fa', '#ff9ae6', '#b0248f', '#3a0630');
    svg += `<circle r="${s}" fill="url(#${id}-b)"/>`;
    css += `@keyframes ${id}w{0%{transform:scale(1);opacity:.85}100%{transform:scale(2.6);opacity:0}}`;
    for (let k = 0; k < 3; k++) over += `<circle r="${s}" fill="none" stroke="${p.color}" stroke-width="1.4" style="animation:${id}w 2.4s ease-out infinite ${-k * 0.8}s"/>`;
    let wave = '';
    for (let x = -s; x <= s; x += 2) wave += `${x === -s ? 'M' : 'L'}${x} ${n(Math.sin(x * 0.7) * s * 0.22 * Math.cos((x / s) * 1.5))}`;
    svg += `<g clip-path="url(#${id}-clip)"><path d="${wave}" stroke="#fff" stroke-width="1.6" fill="none" opacity=".75"/></g>`;
  } else if (p.art === 'giant') {
    defs += sphere('#efe8ff', '#b9a2ff', '#5b3fb8', '#160b3a');
    svg += `<circle r="${s}" fill="url(#${id}-b)"/>`;
    const cols = ['#e9e2ff', '#8a6fe0', '#c8b6ff', '#5a3fb0', '#f0c8ff', '#7d64d8', '#b49cff', '#4a3192'];
    let bands = '';
    let y = -s;
    let i = 0;
    while (y < s) { const h = 2 + r() * 5.5; bands += `<rect x="${-s * 3}" y="${n(y)}" width="${s * 6}" height="${n(h)}" fill="${cols[i++ % cols.length]}" opacity="${n(0.35 + r() * 0.35)}"/>`; y += h; }
    // great spot
    bands += `<ellipse cx="${n(s * 0.35)}" cy="${n(s * 0.32)}" rx="${n(s * 0.28)}" ry="${n(s * 0.13)}" fill="#ffb0e8" opacity=".75"/><ellipse cx="${n(s * 0.35 - s * 2)}" cy="${n(s * 0.32)}" rx="${n(s * 0.28)}" ry="${n(s * 0.13)}" fill="#ffb0e8" opacity=".75"/>`;
    css += `@keyframes ${id}d{from{transform:translateX(0)}to{transform:translateX(${s * 2}px)}}`;
    svg += `<g clip-path="url(#${id}-clip)"><g style="animation:${id}d 16s linear infinite">${bands}</g></g>`;
    svg += `<circle r="${s}" fill="url(#${id}-b)" opacity=".35"/>`;
    // moon on a tiny tilted orbit
    defs += `<radialGradient id="${id}-m" cx=".35" cy=".35"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#8a8fb0"/></radialGradient>`;
    over += `<g transform="rotate(-18) scale(1 .35)"><circle r="${n(s * 1.9)}" fill="none" stroke="#c8b6ff" stroke-opacity=".3" vector-effect="non-scaling-stroke"/><g style="${spin(7)}"><g transform="translate(${n(s * 1.9)} 0)"><g style="${spin(7, true)}"><g transform="scale(1 2.857)"><circle r="3.6" fill="url(#${id}-m)"/></g></g></g></g></g>`;
  } else if (p.art === 'lava') {
    defs += sphere('#5a1a0c', '#3a0e06', '#1e0603', '#0a0202');
    svg += `<circle r="${s}" fill="url(#${id}-b)"/>`;
    let cracks = '';
    for (let k = 0; k < 7; k++) {
      let x = (r() - 0.5) * s * 1.8, y = (r() - 0.5) * s * 1.8, d = `M${n(x)} ${n(y)}`;
      for (let j = 0; j < 4; j++) { x += (r() - 0.5) * s * 0.9; y += (r() - 0.5) * s * 0.9; d += `L${n(x)} ${n(y)}`; }
      cracks += `<path d="${d}"/>`;
    }
    css += `@keyframes ${id}g{0%,100%{opacity:.65}50%{opacity:1}}`;
    svg += `<g clip-path="url(#${id}-clip)" fill="none" stroke-linecap="round" stroke-linejoin="round" style="animation:${id}g 2.8s ease-in-out infinite"><g stroke="#ff5a1f" stroke-width="3.2" opacity=".55">${cracks}</g><g stroke="#ffd08a" stroke-width="1.1">${cracks}</g></g>`;
    svg += `<circle r="${s}" fill="none" stroke="#ff6a1f" stroke-opacity=".5" stroke-width="1.2"/>`;
  } else if (p.art === 'ringed') {
    defs += sphere('#fff4dc', '#ffc46b', '#b06a1c', '#3a1c06');
    defs += `<linearGradient id="${id}-ring" x1="0" x2="1"><stop offset="0" stop-color="#ffe2a8" stop-opacity=".2"/><stop offset=".5" stop-color="#ffe9c2" stop-opacity=".9"/><stop offset="1" stop-color="#ffe2a8" stop-opacity=".2"/></linearGradient>
<clipPath id="${id}-rb"><rect x="${-s * 3}" y="${-s * 3}" width="${s * 6}" height="${s * 3}"/></clipPath><clipPath id="${id}-rf"><rect x="${-s * 3}" y="0" width="${s * 6}" height="${s * 3}"/></clipPath>`;
    const rings = `<g transform="rotate(-16)"><ellipse rx="${n(s * 2.15)}" ry="${n(s * 0.55)}" fill="none" stroke="url(#${id}-ring)" stroke-width="${n(s * 0.32)}"/><ellipse rx="${n(s * 1.62)}" ry="${n(s * 0.41)}" fill="none" stroke="url(#${id}-ring)" stroke-width="${n(s * 0.16)}" opacity=".8"/><ellipse rx="${n(s * 2.55)}" ry="${n(s * 0.65)}" fill="none" stroke="#ffe2a8" stroke-opacity=".35" stroke-width="1"/></g>`;
    svg += `<g clip-path="url(#${id}-rb)">${rings}</g><circle r="${s}" fill="url(#${id}-b)"/>`;
    svg += `<g clip-path="url(#${id}-clip)" opacity=".3"><rect x="${-s}" y="${-s * 0.45}" width="${s * 2}" height="${s * 0.22}" fill="#fff4dc"/><rect x="${-s}" y="${s * 0.12}" width="${s * 2}" height="${s * 0.3}" fill="#8a4a12"/></g>`;
    over += `<g clip-path="url(#${id}-rf)">${rings}</g>`;
  } else if (p.art === 'gold') {
    defs += sphere('#fffbe6', '#ffe08a', '#c08a1c', '#3a2606');
    svg += `<circle r="${s}" fill="url(#${id}-b)"/>`;
    svg += `<g clip-path="url(#${id}-clip)" opacity=".35" fill="#fff8d6">${Array.from({ length: 6 }, () => `<circle cx="${n((r() - 0.5) * s * 1.6)}" cy="${n((r() - 0.5) * s * 1.6)}" r="${n(1 + r() * 2.8)}"/>`).join('')}</g>`;
    over += `<g style="${spin(9)}"><g transform="translate(${n(s * 1.7)} 0)"><circle r="2.8" fill="#fff3c4"/></g></g>`;
  } else if (p.art === 'ocean') {
    defs += sphere('#eef4ff', '#8ab4ff', '#2350b8', '#0a1640');
    svg += `<circle r="${s}" fill="url(#${id}-b)"/>`;
    // a price-chart aurora across the disc
    let d = '', x = -s, y = s * 0.1;
    while (x <= s) { d += `${x === -s ? 'M' : 'L'}${n(x)} ${n(y)}`; x += 3; y += (r() - 0.55) * 5; y = Math.max(-s * 0.6, Math.min(s * 0.6, y)); }
    css += `@keyframes ${id}c{0%,100%{stroke-dashoffset:0}50%{stroke-dashoffset:-40}}`;
    svg += `<g clip-path="url(#${id}-clip)"><path d="${d}" stroke="#d6fffb" stroke-width="1.6" fill="none" opacity=".85"/><path d="M${-s} ${s * 0.55}Q0 ${s * 0.35} ${s} ${s * 0.6}" stroke="#fff" stroke-opacity=".3" fill="none"/></g>`;
    over += `<circle r="${n(s * 1.25)}" fill="none" stroke="${p.color}" stroke-opacity=".4" stroke-dasharray="1 4"/>`;
  }
  // terminator rim highlight
  svg += `<circle r="${s}" fill="none" stroke="#fff" stroke-opacity=".12"/>`;
  return { defs, css, svg, over };
}

function starDefs() {
  return `<radialGradient id="stGlow"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".08" stop-color="#e6f6ff" stop-opacity=".7"/><stop offset=".22" stop-color="#8fd6ff" stop-opacity=".28"/><stop offset=".5" stop-color="#4f8cff" stop-opacity=".08"/><stop offset="1" stop-color="#4f8cff" stop-opacity="0"/></radialGradient>
<radialGradient id="stCore" cx=".45" cy=".42" r=".6"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#f2fbff"/><stop offset=".85" stop-color="#bfe8ff"/><stop offset="1" stop-color="#7cc8ff"/></radialGradient>
<linearGradient id="ray" x1="0" x2="1"><stop offset="0" stop-color="#e6f6ff" stop-opacity=".8"/><stop offset="1" stop-color="#8fd6ff" stop-opacity="0"/></linearGradient>
<linearGradient id="flare" x1="0" x2="1"><stop offset="0" stop-color="#8fd6ff" stop-opacity="0"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".95"/><stop offset="1" stop-color="#8fd6ff" stop-opacity="0"/></linearGradient>
<radialGradient id="ghost"><stop offset="0" stop-color="#8fd6ff" stop-opacity="0"/><stop offset=".7" stop-color="#8fd6ff" stop-opacity=".12"/><stop offset="1" stop-color="#8fd6ff" stop-opacity="0"/></radialGradient>`;
}

function star(r) {
  const R = 40;
  let rays1 = '', rays2 = '';
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * 360 + r() * 8, L = R * (2.2 + r() * 1.8), w = 1.2 + r() * 2.2;
    rays1 += `<path d="M${R * 0.7} ${-w}L${n(L)} 0L${R * 0.7} ${w}Z" fill="url(#ray)" transform="rotate(${n(a, 1)})" opacity="${n(0.25 + r() * 0.4)}"/>`;
  }
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * 360 + r() * 12, L = R * (1.8 + r() * 1.2), w = 2 + r() * 3;
    rays2 += `<path d="M${R * 0.7} ${-w}L${n(L)} 0L${R * 0.7} ${w}Z" fill="url(#ray)" transform="rotate(${n(a, 1)})" opacity="${n(0.15 + r() * 0.3)}"/>`;
  }
  const ghosts = [[0.55, 10], [-0.42, 16], [-0.9, 7], [1.25, 22]].map(([t, rr]) => `<circle cx="${n(t * 260)}" cy="${n(t * 120)}" r="${rr}" fill="url(#ghost)"/>`).join('');
  return `<g transform="translate(${CX} ${CY})">
<circle r="300" fill="url(#stGlow)"/>
<g>${rays1}</g><g>${rays2}</g>
<circle r="${R + 10}" fill="#bfe8ff" opacity=".25" style="animation:corona 4s ease-in-out infinite;transform-origin:0 0"/>
<circle r="${R}" fill="url(#stCore)"/>
<ellipse rx="560" ry="1.6" fill="url(#flare)" opacity=".85"/><ellipse rx="300" ry="9" fill="url(#flare)" opacity=".16"/>
<path d="M0 -120L1.4 0L0 120L-1.4 0Z" fill="url(#flare)" opacity=".35" transform="rotate(90) rotate(90)"/>
${ghosts}</g>`;
}

function farGalaxy(r, x, y) {
  let dots = '';
  for (let arm = 0; arm < 2; arm++) {
    for (let i = 0; i < 160; i++) {
      const t = i / 160, th = t * 3.6 * Math.PI + arm * Math.PI, rr = 6 + t * 82;
      const jx = (r() - 0.5) * (5 + t * 14), jy = (r() - 0.5) * (5 + t * 14);
      dots += `<circle cx="${n(Math.cos(th) * rr + jx, 1)}" cy="${n(Math.sin(th) * rr + jy, 1)}" r="${n(0.5 + r() * 1.1, 1)}" fill="${r() < 0.75 ? '#d6e6ff' : '#ffd6f2'}" opacity="${n(0.3 + (1 - t) * 0.6)}"/>`;
    }
  }
  return `<defs><radialGradient id="galCore"><stop offset="0" stop-color="#fff6e6" stop-opacity=".9"/><stop offset=".25" stop-color="#ffd6a8" stop-opacity=".35"/><stop offset=".6" stop-color="#a98bff" stop-opacity=".1"/><stop offset="1" stop-color="#a98bff" stop-opacity="0"/></radialGradient></defs>
<g transform="translate(${x} ${y}) rotate(-28) scale(.72 .3)" opacity=".85"><circle r="110" fill="url(#galCore)"/><g style="animation:spin 240s linear infinite">${dots}</g></g>`;
}

function hermesComet(G, r) {
  // Kepler orbit with the star at one focus.
  const a = 330, e = 0.66, w = (205 * Math.PI) / 180, T = 64, N = 90;
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const M = (i / N) * Math.PI * 2;
    let E = M;
    for (let k = 0; k < 30; k++) E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
    const rr = a * (1 - e * Math.cos(E));
    const xp = rr * Math.cos(nu + w), yp = rr * Math.sin(nu + w);
    const [sx, sy] = plane(xp, yp);
    pts.push({ x: CX + sx, y: CY + sy, depth: yp, rr });
  }
  const kt = pts.map((_, i) => n(i / N, 4)).join(';');
  const tv = pts.map((p) => `${n(p.x, 1)} ${n(p.y, 1)}`).join(';');
  let prev = null;
  const rot = pts.map((p) => {
    let ang = (Math.atan2(p.y - CY, p.x - CX) * 180) / Math.PI;
    if (prev !== null) { while (ang - prev > 180) ang -= 360; while (ang - prev < -180) ang += 360; }
    prev = ang;
    return n(ang, 1);
  }).join(';');
  const sc = pts.map((p) => n(Math.min(1.9, 0.75 + 90 / p.rr), 2)).join(';');
  const vis = (front) => pts.map((p) => ((p.depth >= 0) === front ? 1 : 0)).join(';');
  const dur = `dur="${T}s" repeatCount="indefinite"`;
  const defs = `<radialGradient id="coma"><stop offset="0" stop-color="#ffffff"/><stop offset=".25" stop-color="#bff3ff" stop-opacity=".8"/><stop offset="1" stop-color="#5ee7ff" stop-opacity="0"/></radialGradient>
<linearGradient id="ionTail" x1="0" x2="1"><stop offset="0" stop-color="#bff3ff" stop-opacity=".9"/><stop offset="1" stop-color="#4f8cff" stop-opacity="0"/></linearGradient>
<linearGradient id="dustTail" x1="0" x2="1"><stop offset="0" stop-color="#fff3d6" stop-opacity=".6"/><stop offset="1" stop-color="#ffc46b" stop-opacity="0"/></linearGradient>`;
  const body = (front) => `<g opacity="${front ? 1 : 0}"><animate attributeName="opacity" values="${vis(front)}" keyTimes="${kt}" ${dur} calcMode="discrete"/>
<g><animateTransform attributeName="transform" type="translate" values="${tv}" keyTimes="${kt}" ${dur}/>
<g><animateTransform attributeName="transform" type="rotate" values="${rot}" keyTimes="${kt}" ${dur}/>
<g><animateTransform attributeName="transform" type="scale" values="${sc}" keyTimes="${kt}" ${dur}/>
<path d="M0 -5L150 -1.2L150 1.2L0 5Z" fill="url(#ionTail)"/><path d="M0 -6Q60 -4 120 -22L118 -10Q60 2 0 6Z" fill="url(#dustTail)"/>
</g></g><circle r="16" fill="url(#coma)"/><circle r="3" fill="#fff"/>
${true ? G.text('HERMES AGENT', { font: 'jb600', size: 14, x: 0, y: -27, anchor: 'middle', tracking: 0.16 }, `fill="${C.cyan}"`).svg + G.text('21 + 13 COMMITS ON MAIN', { font: 'jb400', size: 10.5, x: 0, y: -12, anchor: 'middle', tracking: 0.12 }, `fill="${C.dim}"`).svg : ''}
</g></g>`;
  // faint orbit path
  let d = '';
  pts.forEach((p, i) => (d += `${i ? 'L' : 'M'}${n(p.x, 1)} ${n(p.y, 1)}`));
  const orbitLabel = `<path d="${d}Z" fill="none" stroke="${C.cyan}" stroke-opacity=".22" stroke-dasharray="1 5"/>`;
  return { defs, back: body(false), front: body(true), orbitLabel };
}
