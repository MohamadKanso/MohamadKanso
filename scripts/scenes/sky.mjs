// ARSENAL — the tech stack as constellations around Python. TRAJECTORY — the flight path so far.
import { C, n, rng, text, measure, Glyphs, starfield, spikeStar, spikeDefs, nebula, brackets, svgDoc, TWINKLE_CSS } from '../lib/kit.mjs';

function frame(W, H, id, r, { stars = 360, band } = {}) {
  const neb = nebula(r, { cx: W / 2, cy: H / 2, w: W * 1.1, h: H * 0.9, colors: ['#2a1670', '#123a8a', '#5c1a6a', '#0b4a5e'], blobs: 14, maxOpacity: 0.2, idp: id + 'n' });
  return {
    defs: `<clipPath id="${id}c"><rect width="${W}" height="${H}" rx="22"/></clipPath><linearGradient id="${id}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03040b"/><stop offset=".5" stop-color="#060817"/><stop offset="1" stop-color="#03040b"/></linearGradient>` + neb.defs,
    open: `<g clip-path="url(#${id}c)"><rect width="${W}" height="${H}" fill="url(#${id}bg)"/>${neb.body}` + starfield(r, { w: W, h: H, count: stars, band, twinkle: 0.12, rMax: 1.15 }),
    close: brackets(22, 22, W - 44, H - 44, { len: 22, op: 0.45 }) + `</g><rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="22" fill="none" stroke="${C.lineHi}"/>`,
  };
}

// ---------------------------------------------------------------- constellations
const CORE = { name: 'Python', x: 640, y: 338 };
const CLUSTERS = [
  {
    title: 'GENERATIVE AI', color: '#5ee7ff', tx: 70, ty: 66,
    stars: [['LangChain', 150, 132, 4.2], ['RAG', 268, 96, 3.4], ['FAISS', 380, 150, 3], ['ChromaDB', 498, 104, 3], ['Ollama', 470, 232, 3.6], ['Whisper.cpp', 336, 258, 3], ['Llama 3.2', 206, 226, 3], ['Qwen-2.5', 92, 214, 2.8], ['Hugging Face', 592, 168, 2.8]],
    edges: [[0, 1], [1, 2], [2, 3], [2, 4], [4, 5], [5, 6], [6, 0], [6, 7], [7, 0], [3, 8], [8, 4]], link: 4,
  },
  {
    title: 'MACHINE LEARNING', color: '#b79bff', tx: 1210, ty: 66, anchor: 'end',
    stars: [['PyTorch', 800, 118, 4.2], ['TensorFlow', 902, 178, 3.2], ['scikit-learn', 1010, 106, 3.4], ['XGBoost', 1118, 168, 3.2], ['LightGBM', 1168, 252, 2.8], ['MLflow', 1016, 258, 3, 'l']],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 1]], link: 0,
  },
  {
    title: 'DATA & CLOUD', color: '#ffc46b', tx: 70, ty: 600,
    stars: [['PySpark', 128, 446, 3.4], ['Databricks', 262, 470, 4.2], ['Azure Data Factory', 176, 548, 3], ['PostgreSQL', 404, 540, 3.2], ['Azure', 452, 424, 3], ['Linux', 540, 566, 2.6]],
    edges: [[0, 1], [1, 2], [2, 0], [1, 3], [1, 4], [3, 4], [3, 5]], link: 4,
  },
  {
    title: 'ENGINEERING', color: '#5dffa8', tx: 1210, ty: 600, anchor: 'end',
    stars: [['Flask', 812, 430, 3.2], ['Docker', 930, 470, 3.8], ['GitHub Actions', 1060, 424, 3.2], ['pytest', 1166, 470, 3], ['React', 1106, 548, 3], ['Streamlit', 962, 552, 2.8], ['Git', 840, 536, 3], ['Bash', 724, 498, 2.6], ['C++', 736, 404, 2.6], ['JavaScript', 1024, 502, 2.8]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 1], [5, 6], [6, 0], [6, 7], [7, 0], [8, 0], [8, 7], [9, 4], [9, 2]], link: 0,
  },
];

export function constellations() {
  const W = 1280, H = 660, r = rng(3141);
  const G = new Glyphs('k');
  const band = (x, y) => { const d = Math.abs(y - (600 - x * 0.4)) / 140; return 0.25 + 0.75 * Math.exp(-d * d); };
  const fr = frame(W, H, 'k', r, { stars: 420, band });
  let defs = fr.defs + spikeDefs('ks', '#d6f6ff'), css = TWINKLE_CSS, body = fr.open;
  css += `@keyframes draw{to{stroke-dashoffset:0}}@keyframes flowk{to{stroke-dashoffset:-200}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}.fi{animation:fadeIn 1s ease-out both}
@keyframes glowp{0%,100%{transform:scale(1);opacity:.55}50%{transform:scale(1.6);opacity:.15}}`;

  let delay = 0.2;
  CLUSTERS.forEach((cl, ci) => {
    const cid = `k${ci}`;
    defs += `<radialGradient id="${cid}g"><stop offset="0" stop-color="#fff"/><stop offset=".25" stop-color="${cl.color}" stop-opacity=".7"/><stop offset="1" stop-color="${cl.color}" stop-opacity="0"/></radialGradient>`;
    // link to the core
    const a = cl.stars[cl.link];
    const lk = Math.hypot(CORE.x - a[1], CORE.y - a[2]);
    body += `<path d="M${a[1]} ${a[2]}L${CORE.x} ${CORE.y}" stroke="${cl.color}" stroke-opacity=".22" stroke-dasharray="2 6" fill="none" class="fi" style="animation-delay:${n(delay + 1.6)}s"/>`;
    // constellation lines draw in, then carry a pulse
    cl.edges.forEach(([i, j], k) => {
      const A = cl.stars[i], B = cl.stars[j];
      const L = Math.hypot(B[1] - A[1], B[2] - A[2]);
      body += `<path d="M${A[1]} ${A[2]}L${B[1]} ${B[2]}" stroke="${cl.color}" stroke-opacity=".45" stroke-width="1.1" fill="none" stroke-dasharray="${n(L)}" stroke-dashoffset="${n(L)}" style="animation:draw .7s ease-out ${n(delay + k * 0.12)}s forwards"/>`;
      if (k % 2 === 0) body += `<path d="M${A[1]} ${A[2]}L${B[1]} ${B[2]}" stroke="#fff" stroke-width="1.4" fill="none" stroke-dasharray="6 194" opacity=".7" style="animation:flowk ${n(2.5 + r() * 2.5, 1)}s linear infinite ${n(-r() * 5, 1)}s"/>`;
    });
    // stars + labels
    cl.stars.forEach(([name, x, y, s], k) => {
      body += `<g class="fi" style="animation-delay:${n(delay + 0.1 + k * 0.08)}s"><circle cx="${x}" cy="${y}" r="${n(s * 4)}" fill="url(#${cid}g)" style="animation:glowp ${n(3 + r() * 3, 1)}s ease-in-out infinite ${n(-r() * 4, 1)}s;transform-origin:${x}px ${y}px;transform-box:view-box"/><circle cx="${x}" cy="${y}" r="${n(s * 0.55)}" fill="#fff"/>`;
      const right = x + s * 2.4 + 8;
      const lbl = G.text(name, { font: 'jb600', size: 13.5, x: right, y: y + 4.5, tracking: 0.04 }, `fill="${C.text}"`);
      // keep labels inside the frame
      if (right + lbl.width > W - 40 || cl.stars[k][4] === 'l') body += G.text(name, { font: 'jb600', size: 13.5, x: x - s * 2.4 - 8, y: y + 4.5, anchor: 'end', tracking: 0.04 }, `fill="${C.text}"`).svg;
      else body += lbl.svg;
      body += '</g>';
    });
    // cluster title
    body += `<g class="fi" style="animation-delay:${n(delay)}s">` + text(cl.title, { font: 'michroma', size: 15, x: cl.tx, y: cl.ty, anchor: cl.anchor || 'start', tracking: 0.26 }, `fill="${cl.color}"`);
    body += G.text(`${String(cl.stars.length).padStart(2, '0')} STARS`, { font: 'jb400', size: 10.5, x: cl.tx, y: cl.ty + 18, anchor: cl.anchor || 'start', tracking: 0.24 }, `fill="${C.faint}"`).svg + '</g>';
    delay += 0.5;
  });
  // the core
  defs += `<radialGradient id="kcore"><stop offset="0" stop-color="#ffffff"/><stop offset=".12" stop-color="#e6fbff" stop-opacity=".9"/><stop offset=".35" stop-color="#5ee7ff" stop-opacity=".25"/><stop offset="1" stop-color="#4f8cff" stop-opacity="0"/></radialGradient>`;
  css += `@keyframes kring{0%{transform:scale(.6);opacity:.8}100%{transform:scale(2.4);opacity:0}}`;
  body += `<circle cx="${CORE.x}" cy="${CORE.y}" r="120" fill="url(#kcore)" style="animation:tw2 6s ease-in-out infinite"/>`;
  for (let k = 0; k < 3; k++) body += `<circle cx="${CORE.x}" cy="${CORE.y}" r="30" fill="none" stroke="${C.cyan}" stroke-width="1.2" style="animation:kring 4.5s ease-out infinite ${-k * 1.5}s;transform-origin:${CORE.x}px ${CORE.y}px;transform-box:view-box"/>`;
  body += spikeStar(CORE.x, CORE.y, 70, '#e6fbff', { id: 'ks' });
  body += text('PYTHON', { font: 'michroma', size: 20, x: CORE.x, y: CORE.y + 62, anchor: 'middle', tracking: 0.3 }, `fill="${C.text}"`);
  body += G.text('EVERYTHING ORBITS IT', { font: 'jb400', size: 10.5, x: CORE.x, y: CORE.y + 82, anchor: 'middle', tracking: 0.26 }, `fill="${C.dim}"`).svg;
  body += fr.close;
  defs += G.defs();
  const all = CLUSTERS.flatMap((c) => c.stars.map((s) => s[0])).join(', ');
  return svgDoc({ w: W, h: H, title: 'Arsenal — tech stack constellations', desc: `Python at the centre, linked to four constellations: generative AI, machine learning, data and cloud, and engineering. ${all}.`, css, defs, body });
}

// ---------------------------------------------------------------- trajectory
const MILESTONES = [
  { f: 0.0, year: '2020', title: 'UKMT SENIOR MATHS CHALLENGE', desc: ['Silver · national mathematics', 'competition'], color: '#9aa3c7', at: 'above', anchor: 'start' },
  { f: 0.2, year: '2023', title: 'COMPUTER VISION CHALLENGE', desc: ['Winner · ranked #1 at City,', 'University of London'], color: '#5ee7ff', at: 'below', anchor: 'start' },
  { f: 0.43, year: '2024', title: 'FIRST-CLASS DISSERTATION', desc: ['76% · BTC/USD time-series LSTM', 'MSci Data Science'], color: '#ffc46b', at: 'above', anchor: 'end' },
  { f: 0.61, year: '2025', title: 'COGNIZANT VIBE CHALLENGE', desc: ['Winner · led a 9-person grad', 'team to build DreamSense'], color: '#b79bff', at: 'below', anchor: 'start' },
  { f: 0.8, year: 'NOW', title: 'SENIOR FORWARD DEPLOYED AI · 7IM', desc: ['Building & governing', 'production AI agents'], color: '#5dffa8', at: 'above', anchor: 'end' },
  { f: 1.0, year: 'NEXT', title: 'UNCHARTED', desc: ['The next mission.'], color: '#ffffff', at: 'left', anchor: 'end' },
];

export function trajectory() {
  const W = 1280, H = 520, r = rng(2718);
  const G = new Glyphs('j');
  const fr = frame(W, H, 'j', r, { stars: 300 });
  let defs = fr.defs, css = TWINKLE_CSS, body = fr.open;
  // flight path: cubic bezier
  const P0 = [110, 360], P1 = [470, 372], P2 = [820, 292], P3 = [1150, 104];
  const bez = (t) => {
    const u = 1 - t;
    return [0, 1].map((k) => u * u * u * P0[k] + 3 * u * u * t * P1[k] + 3 * u * t * t * P2[k] + t * t * t * P3[k]);
  };
  // arc-length table
  const N = 600, tab = [[0, 0]];
  let len = 0, prev = bez(0);
  for (let i = 1; i <= N; i++) { const p = bez(i / N); len += Math.hypot(p[0] - prev[0], p[1] - prev[1]); tab.push([i / N, len]); prev = p; }
  const at = (f) => { const target = f * len; const row = tab.find((t) => t[1] >= target) || tab[N]; return bez(row[0]); };
  const d = `M${P0}C${P1} ${P2} ${P3}`;
  // perspective grid floor
  let grid = '';
  for (let i = 0; i <= 14; i++) grid += `M${n(i * (W / 14))} ${H}L${n(W / 2 + (i * (W / 14) - W / 2) * 0.25)} 300`;
  for (let k = 0; k < 7; k++) { const y = 300 + Math.pow(k / 6, 1.8) * (H - 300); grid += `M0 ${n(y)}H${W}`; }
  defs += `<linearGradient id="jgf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".9"/></linearGradient><mask id="jgm"><rect y="300" width="${W}" height="${H - 300}" fill="url(#jgf)"/></mask>`;
  body += `<path d="${grid}" stroke="${C.cyan}" stroke-opacity=".07" fill="none" mask="url(#jgm)"/>`;
  defs += `<linearGradient id="jpath" x1="${P0[0]}" y1="0" x2="${P3[0]}" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#9aa3c7" stop-opacity=".25"/><stop offset=".5" stop-color="#5ee7ff" stop-opacity=".6"/><stop offset="1" stop-color="#ffffff" stop-opacity=".9"/></linearGradient>`;
  body += `<path d="${d}" fill="none" stroke="url(#jpath)" stroke-width="2"/>`;
  body += `<path d="${d}" fill="none" stroke="${C.cyan}" stroke-opacity=".12" stroke-width="10"/>`;
  // future: dashed continuation beyond NEXT
  body += `<path d="M${P3}L${P3[0] + 90} ${P3[1] - 64}" stroke="#fff" stroke-opacity=".45" stroke-dasharray="3 6"/>`;
  const DUR = 13;
  css += `@keyframes trail{from{stroke-dashoffset:140}to{stroke-dashoffset:${n(140 - len)}}}
@keyframes wp{0%{transform:scale(2.6);opacity:1}14%{transform:scale(1);opacity:.35}100%{transform:scale(1);opacity:.35}}`;
  // milestones
  MILESTONES.forEach((m, i) => {
    const [x, y] = at(m.f);
    body += `<circle cx="${n(x)}" cy="${n(y)}" r="14" fill="${m.color}" opacity=".35" style="animation:wp ${DUR}s ease-out infinite ${n(m.f * DUR)}s;transform-origin:${n(x)}px ${n(y)}px;transform-box:view-box"/>`;
    body += `<circle cx="${n(x)}" cy="${n(y)}" r="6" fill="#03040b" stroke="${m.color}" stroke-width="2"/><circle cx="${n(x)}" cy="${n(y)}" r="2.4" fill="${m.color}"/>`;
    let yy, lx = x;
    if (m.at === 'left') {
      lx = x - 28; yy = y - 10;
    } else if (m.at === 'above') {
      const ly = y - 46;
      body += `<path d="M${n(x)} ${n(y - 8)}V${n(ly + 14)}" stroke="${m.color}" stroke-opacity=".5" stroke-dasharray="2 3"/>`;
      yy = ly - 26 - m.desc.length * 18;
    } else {
      const ly = y + 56;
      body += `<path d="M${n(x)} ${n(y + 8)}V${n(ly - 34)}" stroke="${m.color}" stroke-opacity=".5" stroke-dasharray="2 3"/>`;
      yy = ly - 16;
    }
    const anchor = m.anchor;
    body += text(m.year, { font: 'unb500', size: 26, x: lx + (anchor === 'end' ? 0 : -2), y: yy, anchor }, `fill="${m.color}"`);
    body += G.text(m.title, { font: 'jb600', size: 12, x: lx, y: yy + 24, anchor, tracking: 0.12 }, `fill="${C.text}"`).svg;
    m.desc.forEach((ln, k) => (body += G.text(ln, { font: 'sg400', size: 15, x: lx, y: yy + 44 + k * 19, anchor }, `fill="${C.dim}"`).svg));
  });
  // the probe
  defs += `<radialGradient id="jprobe"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="#bff3ff" stop-opacity=".7"/><stop offset="1" stop-color="#5ee7ff" stop-opacity="0"/></radialGradient>`;
  defs += `<linearGradient id="jtail" x1="1" x2="0"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".3" stop-color="#bff3ff" stop-opacity=".45"/><stop offset="1" stop-color="#5ee7ff" stop-opacity="0"/></linearGradient>`;
  body += `<g><animateMotion path="${d}" dur="${DUR}s" repeatCount="indefinite" rotate="auto"/><path d="M-4 -2.2L-150 -0.6L-150 0.6L-4 2.2Z" fill="url(#jtail)"/><circle r="22" fill="url(#jprobe)"/><path d="M10 0L-7 -6L-3 0L-7 6Z" fill="#fff"/></g>`;
  body += G.text('FLIGHT PATH · 2020 → ∞', { font: 'jb600', size: 11, x: 64, y: 70, tracking: 0.24 }, `fill="${C.cyan}" opacity=".85"`).svg;
  body += fr.close;
  defs += G.defs();
  return svgDoc({
    w: W, h: H, title: 'Trajectory — milestones from 2020 to now',
    desc: MILESTONES.map((m) => `${m.year}: ${m.title.toLowerCase()} — ${m.desc.join(' ')}`).join('. '),
    css, defs, body,
  });
}
