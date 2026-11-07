// Section headers, the mission-briefing terminal, project cards, the Hermes banner, contact buttons, footer.
import { C, n, rng, text, textD, measure, Glyphs, starfield, spikeStar, spikeDefs, nebula, brackets, svgDoc, TWINKLE_CSS } from '../lib/kit.mjs';
import { PLANETS, planetArt } from './universe.mjs';

const SPIN_CSS = `@keyframes spin{to{transform:rotate(360deg)}}@keyframes rspin{to{transform:rotate(-360deg)}}`;

function wrap(str, { font, size, tracking = 0 }, maxW) {
  const words = str.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (measure(t, { font, size, tracking }) > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

function panelBg(w, h, id, { rx = 20, glow = C.cyan } = {}) {
  return {
    defs: `<linearGradient id="${id}-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a0e24"/><stop offset=".6" stop-color="#060815"/><stop offset="1" stop-color="#04050d"/></linearGradient>
<radialGradient id="${id}-gl"><stop offset="0" stop-color="${glow}" stop-opacity=".16"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient>
<clipPath id="${id}-clip"><rect width="${w}" height="${h}" rx="${rx}"/></clipPath>`,
    open: `<g clip-path="url(#${id}-clip)"><rect width="${w}" height="${h}" fill="url(#${id}-bg)"/>`,
    close: `</g><rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${rx}" fill="none" stroke="${C.lineHi}"/>`,
  };
}

// ---------------------------------------------------------------- section header
export function header(num, title, sub, seed = 1) {
  const W = 1280, H = 112, r = rng(seed);
  const G = new Glyphs('s');
  const bg = panelBg(W, H, 'hd', { rx: 16 });
  let body = bg.open, css = TWINKLE_CSS;
  body += starfield(r, { w: W, h: H, count: 90, twinkle: 0.2, rMax: 1.1, opacity: [0.2, 0.8] });
  body += `<path d="${textD(num, { font: 'michroma', size: 46, x: 44, y: 76, tracking: 0.04 })}" fill="none" stroke="${C.cyan}" stroke-width="1.2" opacity=".85"/>`;
  const nw = measure(num, { font: 'michroma', size: 46, tracking: 0.04 });
  const tx = 44 + nw + 30;
  body += `<rect x="${n(tx - 16)}" y="34" width="1.5" height="46" fill="${C.cyan}" opacity=".5"/>`;
  body += text(title, { font: 'michroma', size: 25, x: tx, y: 62, tracking: 0.12 }, 'fill="url(#hdT)"');
  body += G.text(sub, { font: 'jb400', size: 12.5, x: tx + 1, y: 85, tracking: 0.12 }, `fill="${C.dim}"`).svg;
  const tw = measure(title, { font: 'michroma', size: 25, tracking: 0.12 });
  const lx = Math.max(tx + tw + 40, 720), rx = W - 60;
  let ticks = '';
  for (let x = lx; x <= rx; x += 12) ticks += `M${n(x)} 56v${(x - lx) % 60 === 0 ? -7 : -3}`;
  body += `<path d="${ticks}" stroke="${C.cyan}" stroke-width=".8" opacity=".35"/><rect x="${n(lx)}" y="56" width="${n(rx - lx)}" height="1" fill="${C.cyan}" opacity=".3"/>`;
  css += `@keyframes hs{from{transform:translateX(0)}to{transform:translateX(${n(rx - lx - 40)}px)}}.hs{animation:hs 6s cubic-bezier(.6,0,.4,1) infinite alternate}`;
  body += `<g class="hs"><rect x="${n(lx)}" y="53" width="40" height="7" fill="url(#hdS)"/><circle cx="${n(lx + 40)}" cy="56.5" r="2.5" fill="${C.cyan}"/></g>`;
  body += G.text(`SECTOR ${num}`, { font: 'jb600', size: 10.5, x: rx, y: 82, anchor: 'end', tracking: 0.24 }, `fill="${C.faint}"`).svg;
  body += bg.close;
  const defs = bg.defs + `<linearGradient id="hdT" x1="0" x2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#b4ceff"/></linearGradient>
<linearGradient id="hdS" x1="0" x2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset="1" stop-color="${C.cyan}" stop-opacity=".9"/></linearGradient>` + G.defs();
  return svgDoc({ w: W, h: H, title: `${num} — ${title}`, desc: sub, css, defs, body });
}

// ---------------------------------------------------------------- mission briefing terminal
export function terminal() {
  const W = 1280, H = 580, r = rng(404);
  const G = new Glyphs('t');
  const bg = panelBg(W, H, 'tm', { rx: 20 });
  let body = bg.open, css = TWINKLE_CSS, defs = bg.defs;
  body += starfield(r, { w: W, h: H, count: 140, twinkle: 0.1, rMax: 1, opacity: [0.12, 0.5] });
  body += `<circle cx="1100" cy="80" r="620" fill="url(#tm-gl)"/>`;
  // title bar
  body += `<rect width="${W}" height="52" fill="#0b1030" fill-opacity=".85"/><rect y="52" width="${W}" height="1" fill="${C.lineHi}"/>`;
  [['#ff5f57', 32], ['#febc2e', 56], ['#28c840', 80]].forEach(([c, x]) => (body += `<circle cx="${x}" cy="26" r="6.5" fill="${c}" opacity=".85"/>`));
  body += G.text('kanso@deep-field: ~/mission', { font: 'jb600', size: 13, x: W / 2, y: 31, anchor: 'middle', tracking: 0.06 }, `fill="${C.dim}"`).svg;
  body += G.text('zsh · uplink 07', { font: 'jb400', size: 12, x: W - 32, y: 31, anchor: 'end', tracking: 0.08 }, `fill="${C.faint}"`).svg;

  const SIZE = 16.5, CW = SIZE * 0.6, LH = 27.5, X0 = 44;
  const T = C.text, D = C.dim, F = C.faint, CY = C.cyan, GR = C.green, GO = C.gold;
  const ts = (s) => [`[${s}]`, F];
  const L = [
    [['kanso@deep-field', GR], [' ~ % ', D], ['./briefing --verbose', T]],
    [ts('  0.000'), ['  uplink established · channel 07 · ', D], ['signal locked', CY]],
    [ts('  0.084'), ['  ── IDENTITY ──────────────────────────────────────────', CY]],
    [['             name ........ ', D], ['Mohamad Kanso', T]],
    [['             role ........ ', D], ['Senior Forward Deployed AI Associate ', T], ['@ 7IM', CY]],
    [['             base ........ ', D], ['London, UK', T]],
    [['             degree ...... ', D], ['MSci Data Science · City, University of London', T]],
    [ts('  0.212'), ['  ── MISSION ───────────────────────────────────────────', CY]],
    [['             ', D], ['Building & governing production AI agents.', T]],
    [ts('  0.355'), ['  ── RECORD ────────────────────────────────────────────', CY]],
    [['           ✓ ', GR], ['40%', GO], [' latency reduction across 50M-record Databricks pipelines', T]],
    [['           ✓ ', GR], ['80%', GO], [' cost reduction with a fully local LLM stack', T]],
    [['           ✓ ', GR], ['Hermes Agent', CY], [' · 21 authored + 13 co-authored commits on main', T]],
    [['           ✓ ', GR], ['First-Class', GO], [' dissertation (76%) · BTC/USD time-series LSTM', T]],
    [['           ✓ ', GR], ['Winner', GO], [' · Computer Vision Challenge · Cognizant Vibe Challenge', T]],
    [ts('  0.498'), ['  all systems ', D], ['nominal', GR], [' · awaiting next mission', D]],
  ];
  // timeline: each line types in, the whole thing holds, then clears and replays
  const CYCLE = 30;
  let t = 0.5;
  L.forEach((segs, i) => {
    const y = 96 + i * LH;
    const str = segs.map((s) => s[0]).join('');
    const len = [...str].length;
    const typeDur = i === 0 ? len * 0.05 : Math.max(0.12, len * 0.006);
    const t0 = t, t1 = t + typeDur;
    t = t1 + (i === 0 ? 0.45 : 0.1);
    const w = len * CW + 4;
    const kt = (v) => n(v / CYCLE, 4);
    defs += `<clipPath id="tl${i}"><rect x="${X0 - 2}" y="${y - SIZE}" width="0" height="${LH}"><animate attributeName="width" values="0;0;${n(w)};${n(w)};0;0" keyTimes="0;${kt(t0)};${kt(t1)};${kt(CYCLE - 1.2)};${kt(CYCLE - 0.9)};1" dur="${CYCLE}s" repeatCount="indefinite"${i === 0 ? ' calcMode="discrete"' : ''}/></rect></clipPath>`;
    let x = X0, g = '';
    for (const [s, col] of segs) {
      if (s.includes('✓')) {
        const pre = s.indexOf('✓');
        const cx = x + pre * CW;
        g += `<path d="M${n(cx + 1)} ${n(y - 6)}l${n(CW * 0.32)} ${n(CW * 0.36)}l${n(CW * 0.55)} -${n(CW * 0.85)}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
      } else if (s.trim()) {
        g += G.text(s, { font: i === 0 || col === CY || col === GO || col === GR ? 'jb600' : 'jb400', size: SIZE, x, y }, `fill="${col}"`).svg;
      }
      x += [...s].length * CW;
    }
    // the typed line 0 uses discrete width steps of whole characters
    if (i === 0) {
      const steps = [];
      for (let k = 0; k <= len; k++) steps.push(n(k * CW + 2));
      const kts = [];
      for (let k = 0; k <= len; k++) kts.push(n((t0 + (k / len) * typeDur) / CYCLE, 4));
      defs = defs.replace(new RegExp(`<clipPath id="tl0">[\\s\\S]*?</clipPath>`), `<clipPath id="tl0"><rect x="${X0 - 2}" y="${y - SIZE}" width="0" height="${LH}"><animate attributeName="width" values="0;${steps.join(';')};${steps[steps.length - 1]};0" keyTimes="0;${kts.join(';')};${n((CYCLE - 1.2) / CYCLE, 4)};${n((CYCLE - 0.9) / CYCLE, 4)}" dur="${CYCLE}s" repeatCount="indefinite" calcMode="discrete"/></rect></clipPath>`);
    }
    body += `<g clip-path="url(#tl${i})">${g}</g>`;
  });
  // final blinking cursor appears after the last line
  const lastY = 96 + (L.length - 1) * LH;
  const lastLen = [...L[L.length - 1].map((s) => s[0]).join('')].length;
  css += `@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}.blink{animation:blink 1.05s steps(1) infinite}`;
  body += `<g opacity="0"><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;${n(t / CYCLE, 4)};${n((CYCLE - 1.2) / CYCLE, 4)};${n((CYCLE - 0.9) / CYCLE, 4)}" dur="${CYCLE}s" repeatCount="indefinite" calcMode="discrete"/><rect x="${n(X0 + lastLen * CW + 8)}" y="${lastY - SIZE * 0.82}" width="${n(CW)}" height="${SIZE * 1.05}" fill="${C.cyan}" class="blink"/></g>`;
  // side HUD: an orbit-scope
  const ox = 1110, oy = 300;
  css += `.o1{animation:spin 6s linear infinite;transform-origin:${ox}px ${oy}px}.o2{animation:spin 11s linear infinite;transform-origin:${ox}px ${oy}px}.o3{animation:rspin 17s linear infinite;transform-origin:${ox}px ${oy}px}` + SPIN_CSS;
  body += `<circle cx="${ox}" cy="${oy}" r="104" fill="none" stroke="${C.cyan}" stroke-opacity=".14"/><circle cx="${ox}" cy="${oy}" r="74" fill="none" stroke="${C.cyan}" stroke-opacity=".18" stroke-dasharray="2 4"/><circle cx="${ox}" cy="${oy}" r="44" fill="none" stroke="${C.cyan}" stroke-opacity=".22"/>`;
  body += `<circle cx="${ox}" cy="${oy}" r="9" fill="${C.cyan}" opacity=".9"/><circle cx="${ox}" cy="${oy}" r="18" fill="${C.cyan}" opacity=".12"/>`;
  body += `<g class="o1"><circle cx="${ox + 44}" cy="${oy}" r="4" fill="${C.green}"/></g><g class="o2"><circle cx="${ox}" cy="${oy - 74}" r="5" fill="${C.violet}"/></g><g class="o3"><circle cx="${ox - 104}" cy="${oy}" r="4" fill="${C.gold}"/></g>`;
  body += G.text('ORBIT-SCOPE', { font: 'jb600', size: 11, x: ox, y: oy + 136, anchor: 'middle', tracking: 0.24 }, `fill="${C.faint}"`).svg;
  body += brackets(16, 66, W - 32, H - 82, { len: 18, op: 0.4 });
  body += bg.close;
  defs += G.defs();
  return svgDoc({
    w: W, h: H, title: 'Mission briefing — Mohamad Kanso',
    desc: 'Terminal briefing. Senior Forward Deployed AI Associate at 7IM, London. MSci Data Science, City, University of London. Building and governing production AI agents. 40% latency reduction across 50M-record Databricks pipelines; 80% cost reduction with a fully local LLM stack; Hermes Agent 21 authored + 13 co-authored commits on main; First-Class dissertation (76%); winner of the Computer Vision Challenge and the Cognizant Vibe Challenge.',
    css, defs, body,
  });
}

// ---------------------------------------------------------------- project cards
export const PROJECTS = [
  { key: 'vsk', idx: '01', name: 'VoiceSafeKit', tag: 'VOICE SAFETY LAYER', status: 'LIVE', sc: C.green, url: 'https://github.com/MohamadKanso/VoiceSafeKit',
    desc: 'Privacy and safety layer for voice assistants. Classifies transcripts SAFE / REDACT / REVIEW / BLOCK before an LLM sees them, with in-browser Whisper and PII redaction.',
    chips: ['Python', 'Whisper.js', 'JavaScript', 'pytest'] },
  { key: 'cs', idx: '02', name: 'CodeSentry', tag: 'LOCAL AI CODE REVIEW', status: 'LIVE', sc: C.green, url: 'https://github.com/MohamadKanso/CodeSentry',
    desc: 'Local AI code review and auto-fix. Scans whole codebases for bugs and security issues, caches unchanged files, git-aware hooks, patch-based fixes. Zero cloud.',
    chips: ['Ollama', 'React', 'Flask', 'GitHub Actions'] },
  { key: 'mx', idx: '03', name: 'MurmurX', tag: 'FULLY LOCAL VOICE AI', status: 'SUB-2S', sc: C.pink, url: 'https://github.com/MohamadKanso/MurmurX',
    desc: 'Voice-first AI pipeline that never leaves the laptop. WebRTC VAD → Whisper.cpp → Qwen-2.5 3B → TTS, sub-2s end to end on an M1 Pro. No cloud, no APIs.',
    chips: ['Python', 'Whisper.cpp', 'Qwen-2.5', 'WebRTC VAD'] },
  { key: 'ds', idx: '04', name: 'DreamSense', tag: 'MULTI-MODAL GENAI', status: 'WINNER', sc: C.gold, url: 'https://github.com/MohamadKanso/DreamSense',
    desc: 'Led a 9-person Cognizant grad team to orchestrate Zephyr-7B, Stable Diffusion and Google TTS in one pipeline. Won the Cognizant Vibe Coding Challenge 2025.',
    chips: ['Zephyr-7B', 'Stable Diffusion', 'Google TTS'] },
  { key: 'if', idx: '05', name: 'IncidentForge', tag: 'AI SRE EVALUATION', status: 'ACTIVE', sc: C.green, url: 'https://github.com/MohamadKanso/IncidentForge',
    desc: 'Generates realistic production incidents and root-cause scenarios to benchmark LLM-driven SRE agents under pressure. Built for rigorous, reproducible evaluation.',
    chips: ['Python', 'LLM evals', 'AI SRE'] },
  { key: 'wf', idx: '06', name: 'WorkflowForge', tag: 'WORKFLOW INTELLIGENCE', status: 'NEW', sc: C.gold, url: 'https://github.com/MohamadKanso/WorkflowForge',
    desc: 'Turns messy operational context into structured, repeatable execution systems. Bridges unstructured operational knowledge and reliable automated workflows.',
    chips: ['Python', 'Open source', 'Automation'] },
  { key: 'btc', idx: '07', name: 'BTC LSTM', tag: 'MSCI DISSERTATION', status: 'FIRST · 76%', sc: C.gold, url: 'https://github.com/MohamadKanso/Dissertation',
    desc: 'LSTM and regression models on intraday BTC/USD with walk-forward validation, strict anti-lookahead protocols and regime-aware features, tested against linear baselines.',
    chips: ['PyTorch', 'LSTM', 'Walk-forward'] },
  { key: 'tml', idx: '08', name: 'Trading ML', tag: 'QUANT RESEARCH LIBRARY', status: '700+ RUNS', sc: C.blue, url: 'https://github.com/MohamadKanso/trading-ml-research',
    desc: 'Analytics for sequential decision simulations: 700+ recorded runs under 5% max drawdown and 1,500+ replayed time-series samples, tagged to surface repeatable errors.',
    chips: ['Python', 'Statistics', 'Time series'] },
];

export function card(pr) {
  const W = 600, H = 340;
  const p = PLANETS.find((q) => q.key === pr.key);
  const r = rng(pr.idx.charCodeAt(1) * 977);
  const G = new Glyphs('c');
  const bg = panelBg(W, H, 'cd', { rx: 18, glow: p.color });
  let defs = bg.defs, css = TWINKLE_CSS + SPIN_CSS, body = bg.open;
  body += starfield(r, { w: W, h: H, count: 70, twinkle: 0.15, rMax: 1, opacity: [0.15, 0.6] });
  body += `<circle cx="86" cy="92" r="300" fill="url(#cd-gl)"/>`;
  // planet, lit from the upper left
  const big = { ...p, size: 34 };
  const art = planetArt(big, r);
  defs += art.defs + `<linearGradient id="cshade" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#02030a" stop-opacity="0"/><stop offset=".45" stop-color="#02030a" stop-opacity=".1"/><stop offset=".7" stop-color="#02030a" stop-opacity=".7"/><stop offset="1" stop-color="#02030a" stop-opacity=".9"/></linearGradient>`;
  css += art.css;
  const k = p.art === 'ringed' ? 0.74 : p.art === 'giant' ? 0.9 : 1;
  body += `<g transform="translate(86 92) scale(${k})">${art.svg}<circle r="34.4" fill="url(#cshade)" transform="rotate(-140)"/>${art.over}</g>`;
  // header text
  body += text(pr.name, { font: 'sg700', size: 33, x: 156, y: 86 }, `fill="${C.text}"`);
  body += G.text(pr.tag, { font: 'jb600', size: 11.5, x: 157, y: 112, tracking: 0.18 }, `fill="${p.color}"`).svg;
  body += G.text(pr.idx, { font: 'jb600', size: 12, x: W - 34, y: 44, anchor: 'end', tracking: 0.2 }, `fill="${C.faint}"`).svg;
  // status chip
  const sw = measure(pr.status, { font: 'jb800', size: 10.5, tracking: 0.16 }) + 30;
  body += `<rect x="${n(W - 34 - sw)}" y="58" width="${n(sw)}" height="24" rx="12" fill="${pr.sc}" fill-opacity=".1" stroke="${pr.sc}" stroke-opacity=".55"/><circle cx="${n(W - 34 - sw + 12)}" cy="70" r="3" fill="${pr.sc}" class="tw"/>`;
  body += G.text(pr.status, { font: 'jb800', size: 10.5, x: W - 34 - sw + 21, y: 74, tracking: 0.16 }, `fill="${pr.sc}"`).svg;
  // description
  const lines = wrap(pr.desc, { font: 'sg400', size: 17.5 }, W - 72);
  lines.slice(0, 4).forEach((ln, i) => (body += G.text(ln, { font: 'sg400', size: 17.5, x: 36, y: 168 + i * 26 }, `fill="${C.dim}"`).svg));
  // chips
  let cx = 36;
  for (const c of pr.chips) {
    const w = measure(c, { font: 'jb600', size: 11.5, tracking: 0.06 }) + 22;
    body += `<rect x="${n(cx)}" y="${H - 58}" width="${n(w)}" height="26" rx="5" fill="#0f1534" stroke="${C.lineHi}"/>`;
    body += G.text(c, { font: 'jb600', size: 11.5, x: cx + 11, y: H - 40.5, tracking: 0.06 }, `fill="${C.text}" opacity=".85"`).svg;
    cx += w + 8;
  }
  body += G.text('OPEN ↗', { font: 'jb800', size: 11.5, x: W - 34, y: H - 40.5, anchor: 'end', tracking: 0.2 }, `fill="${p.color}"`).svg;
  body += bg.close;
  // animated border sweep
  // a glint gliding along the top edge (small repaint area, unlike animating the whole border)
  defs += `<linearGradient id="cdB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.color}" stop-opacity=".55"/><stop offset=".35" stop-color="${p.color}" stop-opacity=".08"/><stop offset=".7" stop-color="${p.color}" stop-opacity=".04"/><stop offset="1" stop-color="${p.color}" stop-opacity=".35"/></linearGradient>
<linearGradient id="cdG" x1="0" x2="1"><stop offset="0" stop-color="${p.color}" stop-opacity="0"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="${p.color}" stop-opacity="0"/></linearGradient>`;
  css += `@keyframes glint{0%{transform:translateX(0)}55%,100%{transform:translateX(${W - 60}px)}}`;
  body += `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="17.5" fill="none" stroke="url(#cdB)" stroke-width="1.4"/>`;
  body += `<rect x="20" y="0.4" width="120" height="1.6" fill="url(#cdG)" style="animation:glint 6s cubic-bezier(.5,0,.3,1) infinite ${n(-(+pr.idx) * 0.7, 1)}s"/>`;
  body += brackets(10, 10, W - 20, H - 20, { len: 12, op: 0.35, color: p.color });
  defs += G.defs();
  return svgDoc({ w: W, h: H, title: `${pr.name} — ${pr.tag.toLowerCase()}`, desc: pr.desc, css, defs, body });
}

// ---------------------------------------------------------------- Hermes banner
export function hermes() {
  const W = 1280, H = 250, r = rng(1337);
  const G = new Glyphs('m');
  const bg = panelBg(W, H, 'hm', { rx: 20 });
  let defs = bg.defs, css = TWINKLE_CSS, body = bg.open;
  const neb = nebula(r, { cx: 900, cy: 120, w: 700, h: 240, colors: ['#123a8a', '#0b4a5e', '#2a1670'], blobs: 8, maxOpacity: 0.3, idp: 'hn' });
  defs += neb.defs;
  body += neb.body + starfield(r, { w: W, h: H, count: 180, twinkle: 0.15, rMax: 1.15 });
  // comet streaking across
  defs += `<linearGradient id="hmTail" x1="1" x2="0"><stop offset="0" stop-color="#ffffff"/><stop offset=".08" stop-color="#bff3ff" stop-opacity=".85"/><stop offset=".5" stop-color="#5ee7ff" stop-opacity=".25"/><stop offset="1" stop-color="#4f8cff" stop-opacity="0"/></linearGradient>
<radialGradient id="hmComa"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="#bff3ff" stop-opacity=".7"/><stop offset="1" stop-color="#5ee7ff" stop-opacity="0"/></radialGradient>`;
  css += `@keyframes fly{0%{transform:translate(-200px,60px)}100%{transform:translate(1500px,-150px)}}.fly{animation:fly 9s linear infinite}`;
  body += `<g class="fly"><g transform="rotate(-7)"><path d="M0 -7L-420 -1.5L-420 1.5L0 7Z" fill="url(#hmTail)"/><path d="M0 -9Q-160 -12 -300 -40L-300 -26Q-160 0 0 9Z" fill="url(#hmTail)" opacity=".4"/><circle r="22" fill="url(#hmComa)"/><circle r="4" fill="#fff"/></g></g>`;
  body += G.text('OPEN SOURCE · CONTRIBUTOR RECORD', { font: 'jb600', size: 12, x: 56, y: 70, tracking: 0.22 }, `fill="${C.cyan}"`).svg;
  body += text('HERMES AGENT', { font: 'michroma', size: 40, x: 54, y: 124, tracking: 0.08 }, 'fill="url(#hdT)"');
  defs += `<linearGradient id="hdT" x1="0" x2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#b4ceff"/></linearGradient>`;
  body += text('Commits merged to main in the open-source Hermes Agent.', { font: 'sg400', size: 18, x: 56, y: 162 }, `fill="${C.dim}"`);
  body += G.text('VIEW THE FULL RECORD ↗', { font: 'jb800', size: 12, x: 56, y: 206, tracking: 0.2 }, `fill="${C.cyan}"`).svg;
  body += `<rect x="56" y="214" width="${n(measure('VIEW THE FULL RECORD ↗', { font: 'jb800', size: 12, tracking: 0.2 }))}" height="1.2" fill="${C.cyan}" opacity=".6"/>`;
  // stats
  const stat = (x, num, lab) => {
    body += text(num, { font: 'unb500', size: 74, x, y: 146, anchor: 'end' }, 'fill="url(#hmN)"');
    body += G.text(lab, { font: 'jb600', size: 11.5, x, y: 178, anchor: 'end', tracking: 0.2 }, `fill="${C.dim}"`).svg;
  };
  defs += `<linearGradient id="hmN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#5ee7ff"/></linearGradient>`;
  stat(1000, '21', 'AUTHORED');
  body += `<path d="${textD('+', { font: 'unb300', size: 48, x: 1052, y: 132, anchor: 'middle' })}" fill="${C.faint}"/>`;
  stat(1214, '13', 'CO-AUTHORED');
  body += G.text('COMMITS ON MAIN', { font: 'jb600', size: 11.5, x: 1214, y: 70, anchor: 'end', tracking: 0.24 }, `fill="${C.faint}"`).svg;
  body += brackets(14, 14, W - 28, H - 28, { len: 16, op: 0.5 });
  body += bg.close;
  defs += G.defs();
  return svgDoc({ w: W, h: H, title: 'Hermes Agent — 21 authored + 13 co-authored commits on main', desc: 'Open-source contributor record for Hermes Agent.', css, defs, body });
}

// ---------------------------------------------------------------- contact buttons
export function button(kind) {
  const W = 420, H = 84;
  const G = new Glyphs('b');
  const conf = {
    linkedin: { label: 'LINKEDIN', sub: '/in/mohamadkanso', color: '#5ab0ff' },
    email: { label: 'EMAIL', sub: 'kanso1245@gmail.com', color: C.cyan },
    hermes: { label: 'HERMES RECORD', sub: 'open-source commits', color: C.violet },
  }[kind];
  const bg = panelBg(W, H, 'bt', { rx: 14, glow: conf.color });
  let defs = bg.defs, body = bg.open, css = '';
  body += `<circle cx="42" cy="42" r="200" fill="url(#bt-gl)"/>`;
  // icon
  body += `<circle cx="42" cy="42" r="22" fill="${conf.color}" fill-opacity=".1" stroke="${conf.color}" stroke-opacity=".6"/>`;
  if (kind === 'linkedin') body += text('in', { font: 'sg700', size: 21, x: 42, y: 49, anchor: 'middle' }, `fill="${conf.color}"`);
  if (kind === 'email') body += `<path d="M31 34h22v16H31zM31 35l11 8 11-8" fill="none" stroke="${conf.color}" stroke-width="1.8" stroke-linejoin="round"/>`;
  if (kind === 'hermes') body += `<path d="M48 30L34 52M48 30l-4 7M48 30l-7 2" fill="none" stroke="${conf.color}" stroke-width="2" stroke-linecap="round"/><circle cx="33" cy="53" r="3" fill="${conf.color}"/>`;
  body += text(conf.label, { font: 'michroma', size: 17, x: 82, y: 40, tracking: 0.1 }, `fill="${C.text}"`);
  body += G.text(conf.sub, { font: 'jb400', size: 12.5, x: 83, y: 62, tracking: 0.04 }, `fill="${C.dim}"`).svg;
  body += G.text('↗', { font: 'jb800', size: 20, x: W - 30, y: 50, anchor: 'end' }, `fill="${conf.color}"`).svg;
  body += bg.close;
  defs += `<linearGradient id="btB" x1="0" x2="1"><stop offset="0" stop-color="${conf.color}" stop-opacity=".6"/><stop offset=".5" stop-color="${conf.color}" stop-opacity=".12"/><stop offset="1" stop-color="${conf.color}" stop-opacity=".45"/></linearGradient>
<linearGradient id="btG" x1="0" x2="1"><stop offset="0" stop-color="${conf.color}" stop-opacity="0"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="${conf.color}" stop-opacity="0"/></linearGradient>`;
  body += `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="13.5" fill="none" stroke="url(#btB)" stroke-width="1.4"/>`;
  body += `<rect x="14" y="${H - 2}" width="90" height="1.6" fill="url(#btG)" style="animation:bglint 5s cubic-bezier(.5,0,.3,1) infinite"/>`;
  css = `@keyframes bglint{0%{transform:translateX(0)}60%,100%{transform:translateX(${W - 118}px)}}`;
  defs += G.defs();
  return svgDoc({ w: W, h: H, title: `${conf.label} — ${conf.sub}`, desc: conf.sub, css, defs, body });
}

// ---------------------------------------------------------------- footer
export function footer() {
  const W = 1280, H = 330, r = rng(2027);
  const G = new Glyphs('f');
  let defs = '', css = TWINKLE_CSS, body = '';
  defs += `<clipPath id="ft"><rect width="${W}" height="${H}" rx="22"/></clipPath>
<linearGradient id="ftBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#02030a"/><stop offset="1" stop-color="#071033"/></linearGradient>
<radialGradient id="atmo" cx="640" cy="1520" r="1300" gradientUnits="userSpaceOnUse"><stop offset=".915" stop-color="#5ee7ff" stop-opacity="0"/><stop offset=".935" stop-color="#4f8cff" stop-opacity=".25"/><stop offset=".962" stop-color="#5ee7ff" stop-opacity=".9"/><stop offset=".968" stop-color="#e6fbff"/><stop offset=".975" stop-color="#5ee7ff" stop-opacity=".5"/><stop offset="1" stop-color="#4f8cff" stop-opacity="0"/></radialGradient>
<radialGradient id="planetG" cx="640" cy="1520" r="1262" gradientUnits="userSpaceOnUse"><stop offset=".9" stop-color="#050a1e"/><stop offset=".985" stop-color="#0b1a44"/><stop offset="1" stop-color="#1b3a7a"/></radialGradient>
<radialGradient id="sunrise" cx="640" cy="262" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".05" stop-color="#e6fbff" stop-opacity=".7"/><stop offset=".25" stop-color="#5ee7ff" stop-opacity=".18"/><stop offset="1" stop-color="#4f8cff" stop-opacity="0"/></radialGradient>
<linearGradient id="flareF" x1="0" x2="1"><stop offset="0" stop-color="#5ee7ff" stop-opacity="0"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#5ee7ff" stop-opacity="0"/></linearGradient>` + spikeDefs('fs', '#cfe6ff');
  body += `<g clip-path="url(#ft)"><rect width="${W}" height="${H}" fill="url(#ftBg)"/>`;
  body += starfield(r, { w: W, h: 250, count: 260, twinkle: 0.18, rMax: 1.2 });
  body += spikeStar(214, 64, 26, '#e6f2ff', { id: 'fs' }) + spikeStar(1090, 104, 20, '#e6f2ff', { id: 'fs' });
  // sunrise over the limb
  css += `@keyframes rise2{0%,100%{opacity:.85}50%{opacity:1}}.sun{animation:rise2 6s ease-in-out infinite}`;
  body += `<circle cx="640" cy="262" r="420" fill="url(#sunrise)"/><g class="sun"><ellipse cx="640" cy="259" rx="560" ry="1.6" fill="url(#flareF)"/><ellipse cx="640" cy="259" rx="260" ry="8" fill="url(#flareF)" opacity=".18"/></g>`;
  body += `<circle cx="640" cy="1520" r="1300" fill="url(#atmo)"/><circle cx="640" cy="1520" r="1262" fill="url(#planetG)"/>`;
  // city lights on the night side
  let lights = '';
  for (let i = 0; i < 160; i++) {
    const a = -Math.PI / 2 + (r() - 0.5) * 0.9, rr = 1262 - 6 - r() * 70;
    const x = 640 + Math.cos(a) * rr, y = 1520 + Math.sin(a) * rr;
    if (y > H) continue;
    lights += `<circle cx="${n(x, 1)}" cy="${n(y, 1)}" r="${n(0.5 + r() * 0.9, 1)}" fill="#ffd9a0" opacity="${n(0.25 + r() * 0.6)}"/>`;
  }
  body += lights;
  body += G.text('END OF TRANSMISSION', { font: 'jb600', size: 12.5, x: W / 2, y: 92, anchor: 'middle', tracking: 0.42 }, `fill="${C.cyan}"`).svg;
  body += text("Let's build something that matters.", { font: 'sg500', size: 30, x: W / 2, y: 142, anchor: 'middle' }, `fill="${C.text}"`);
  body += G.text('— MOHAMAD KANSO · LONDON', { font: 'jb400', size: 12, x: W / 2, y: 176, anchor: 'middle', tracking: 0.26 }, `fill="${C.dim}"`).svg;
  // signal waveform
  let wave = '';
  for (let x = 0; x <= 240; x += 3) wave += `${x ? 'L' : 'M'}${n(520 + x)} ${n(206 + Math.sin(x * 0.11) * 6 * Math.sin((x / 240) * Math.PI))}`;
  css += `@keyframes wv{to{stroke-dashoffset:-60}}.wv{animation:wv 2.4s linear infinite}`;
  body += `<path d="${wave}" fill="none" stroke="${C.cyan}" stroke-width="1.5" stroke-dasharray="30 6 4 6" class="wv" opacity=".7"/>`;
  body += brackets(22, 22, W - 44, H - 44, { len: 22, op: 0.45 });
  body += `</g><rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="22" fill="none" stroke="${C.lineHi}"/>`;
  defs += G.defs();
  return svgDoc({ w: W, h: H, title: 'End of transmission', desc: 'A planet horizon at sunrise. Let’s build something that matters. — Mohamad Kanso, London.', css, defs, body });
}
