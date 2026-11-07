// KANSO // DEEP FIELD — shared kit for every generated SVG.
// Text is rendered as real glyph outlines (no web fonts), so it looks identical on every OS
// and survives GitHub's SVG sandbox. Fonts: Michroma, Unbounded, Space Grotesk, JetBrains Mono (all OFL).
import fs from 'node:fs';

const atlas = JSON.parse(fs.readFileSync(new URL('./glyphs.json', import.meta.url), 'utf8'));

export const C = {
  void: '#020309', ink: '#05070f', deep: '#080b1c', indigo: '#0e1233', violetDeep: '#1a0f3d',
  line: '#1c2347', lineHi: '#2b3566',
  text: '#eef2ff', dim: '#9aa3c7', faint: '#5b6490', ghost: '#353d63',
  cyan: '#5ee7ff', blue: '#4f8cff', violet: '#a98bff', magenta: '#ff5fd2', pink: '#ff8fb8',
  gold: '#ffc46b', amber: '#ff9a3c', ember: '#ff5a1f', green: '#5dffa8', red: '#ff4d6d',
};

export const n = (v, d = 2) => {
  const s = (+v).toFixed(d);
  return s.indexOf('.') >= 0 ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
};

export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
export const lerp = (a, b, t) => a + (b - a) * t;
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------- text ----------
function glyph(font, ch) {
  const F = atlas[font];
  if (!F) throw new Error('unknown font ' + font);
  let g = F.glyphs[ch];
  if (g) return { F, g };
  for (const fb of ['jb400', 'unb300', 'sg400']) {
    const FB = atlas[fb];
    if (FB.glyphs[ch]) return { F: FB, g: FB.glyphs[ch], fallback: true };
  }
  return { F, g: F.glyphs['?'] };
}

export function measure(str, { font, size, tracking = 0 }) {
  let w = 0;
  const chars = [...str];
  chars.forEach((ch, i) => {
    const { F, g } = glyph(font, ch);
    w += (g[0] / F.upm) * size;
    if (i < chars.length - 1) w += tracking * size;
  });
  return w;
}

function transformPath(d, s, ox, oy) {
  let out = '';
  const re = /([MLHVQCZ])([^MLHVQCZ]*)/g;
  let m;
  while ((m = re.exec(d))) {
    const cmd = m[1];
    const nums = m[2].trim() ? m[2].trim().split(/[\s,]+/).map(Number) : [];
    out += cmd;
    if (cmd === 'H') out += nums.map((v) => n(v * s + ox)).join(' ');
    else if (cmd === 'V') out += nums.map((v) => n(v * s + oy)).join(' ');
    else if (cmd !== 'Z') out += nums.map((v, i) => n(i % 2 === 0 ? v * s + ox : v * s + oy)).join(' ');
  }
  return out;
}

/** Combined path data for a string, positioned in document space. */
export function textD(str, { font, size, x = 0, y = 0, anchor = 'start', tracking = 0 }) {
  const w = measure(str, { font, size, tracking });
  let cx = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  let d = '';
  for (const ch of str) {
    const { F, g } = glyph(font, ch);
    const s = size / F.upm;
    if (g[1]) d += transformPath(g[1], s, cx, y);
    cx += g[0] * s + tracking * size;
  }
  return d;
}

/** A <path> element of text. extra = attribute string. */
export function text(str, opts, extra = '') {
  return `<path d="${textD(str, opts)}" ${extra}/>`;
}

/** Per-document glyph store for long/mono text: each glyph defined once, then <use>d. */
export class Glyphs {
  constructor(prefix = 'g') { this.prefix = prefix; this.map = new Map(); }
  id(font, ch) {
    const key = font + ':' + ch;
    if (!this.map.has(key)) {
      const { F, g } = glyph(font, ch);
      const id = `${this.prefix}_${this.map.size.toString(36)}`;
      // normalise each glyph to a 1000-unit em so <use> scaling is uniform across fonts
      const k = 1000 / F.upm;
      this.map.set(key, { id, d: g[1] ? transformPath(g[1], k, 0, 0) : '', adv: g[0] * k });
    }
    return this.map.get(key);
  }
  defs() {
    return [...this.map.values()].filter((v) => v.d).map((v) => `<path id="${v.id}" d="${v.d}"/>`).join('');
  }
  /** returns {svg, width}. Glyph uses inside one scaled group. */
  text(str, { font, size, x = 0, y = 0, anchor = 'start', tracking = 0 }, extra = '') {
    const s = size / 1000;
    let cx = 0;
    let uses = '';
    const chars = [...str];
    chars.forEach((ch) => {
      const gl = this.id(font, ch);
      if (gl.d) uses += `<use href="#${gl.id}" x="${n(cx, 1)}"/>`;
      cx += gl.adv + tracking * 1000;
    });
    const width = (cx - tracking * 1000) * s;
    const ox = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
    return { svg: `<g transform="translate(${n(ox)} ${n(y)}) scale(${n(s, 5)})" ${extra}>${uses}</g>`, width };
  }
}

// ---------- scenery ----------
export const TWINKLE_CSS = `
@keyframes tw{0%,100%{opacity:1}50%{opacity:.15}}
@keyframes tw2{0%,100%{opacity:.25}50%{opacity:1}}
.tw{animation:tw 3s ease-in-out infinite}
.tw2{animation:tw2 4s ease-in-out infinite}`;

/** Star field. band: optional fn(x,y)->density multiplier (0..1). */
export function starfield(r, { w, h, count, x0 = 0, y0 = 0, rMin = 0.35, rMax = 1.3, band, twinkle = 0.12, colors, opacity = [0.35, 1] }) {
  const cols = colors || ['#ffffff', '#ffffff', '#ffffff', '#dfe8ff', '#cfe0ff', '#fff1d6', '#ffe0c2', '#d6f6ff'];
  let out = '';
  let placed = 0, guard = 0;
  while (placed < count && guard++ < count * 40) {
    const x = x0 + r() * w, y = y0 + r() * h;
    if (band && r() > band(x, y)) continue;
    placed++;
    const t = Math.pow(r(), 3.2);
    const rad = rMin + (rMax - rMin) * t;
    const op = lerp(opacity[0], opacity[1], Math.pow(r(), 0.7));
    const col = pick(r, cols);
    if (r() < twinkle) {
      const dur = n(2 + r() * 5, 1), del = n(-r() * 6, 1);
      out += `<circle cx="${n(x, 1)}" cy="${n(y, 1)}" r="${n(rad)}" fill="${col}" opacity="${n(op)}" class="${r() < 0.5 ? 'tw' : 'tw2'}" style="animation-duration:${dur}s;animation-delay:${del}s"/>`;
    } else {
      out += `<circle cx="${n(x, 1)}" cy="${n(y, 1)}" r="${n(rad)}" fill="${col}" opacity="${n(op)}"/>`;
    }
  }
  return out;
}

/** JWST-style bright star with 6 diffraction spikes (+ 2 faint horizontal). Needs gradient defs from spikeDefs(). */
export function spikeStar(x, y, size, color = '#ffffff', { cls = '', id = 'sp' } = {}) {
  const L = size, W = Math.max(0.6, size * 0.028);
  const spike = (ang, len, wid, op) =>
    `<path d="M0 ${-wid} L${n(len)} 0 L0 ${wid} L${n(-len)} 0Z" transform="rotate(${ang})" fill="url(#${id}-spike)" opacity="${op}"/>`;
  return `<g transform="translate(${n(x)} ${n(y)})" ${cls ? `class="${cls}"` : ''}>
<circle r="${n(size * 0.42)}" fill="url(#${id}-halo)"/>
${spike(90, L, W * 1.2, 0.95)}${spike(30, L * 0.82, W, 0.8)}${spike(150, L * 0.82, W, 0.8)}${spike(0, L * 0.45, W * 0.7, 0.45)}
<circle r="${n(Math.max(1.1, size * 0.06))}" fill="${color}"/><circle r="${n(Math.max(0.6, size * 0.03))}" fill="#fff"/></g>`;
}
export function spikeDefs(id = 'sp', color = '#cfe6ff') {
  return `<radialGradient id="${id}-halo"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".12" stop-color="${color}" stop-opacity=".55"/><stop offset=".45" stop-color="${color}" stop-opacity=".12"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>
<linearGradient id="${id}-spike" x1="0" x2="1"><stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset=".47" stop-color="#fff" stop-opacity=".9"/><stop offset=".5" stop-color="#fff"/><stop offset=".53" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>`;
}

/** Soft nebula: overlapping rotated radial-gradient ellipses (cheap, no filters). */
export function nebula(r, { cx, cy, w, h, colors, blobs = 14, maxOpacity = 0.35, idp = 'nb' }) {
  let defs = '', body = '';
  colors.forEach((c, i) => {
    defs += `<radialGradient id="${idp}${i}"><stop offset="0" stop-color="${c}" stop-opacity="1"/><stop offset=".35" stop-color="${c}" stop-opacity=".45"/><stop offset=".7" stop-color="${c}" stop-opacity=".1"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
  });
  for (let i = 0; i < blobs; i++) {
    const x = cx + (r() - 0.5) * w, y = cy + (r() - 0.5) * h;
    const rx = 60 + r() * w * 0.32, ry = rx * (0.25 + r() * 0.5);
    const rot = n(r() * 180, 0), ci = Math.floor(r() * colors.length);
    body += `<ellipse cx="0" cy="0" rx="${n(rx, 0)}" ry="${n(ry, 0)}" fill="url(#${idp}${ci})" opacity="${n(0.08 + r() * maxOpacity)}" transform="translate(${n(x, 0)} ${n(y, 0)}) rotate(${rot})"/>`;
  }
  return { defs, body };
}

/** HUD corner brackets around a rect. */
export function brackets(x, y, w, h, { len = 18, color = C.cyan, op = 0.7, sw = 1.5 } = {}) {
  const p = (d) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" opacity="${op}" stroke-linecap="square"/>`;
  return p(`M${x} ${y + len}V${y}H${x + len}`) + p(`M${x + w - len} ${y}H${x + w}V${y + len}`) +
    p(`M${x + w} ${y + h - len}V${y + h}H${x + w - len}`) + p(`M${x + len} ${y + h}H${x}V${y + h - len}`);
}

export function svgDoc({ w, h, title, desc = '', css = '', defs = '', body = '' }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title><desc id="d">${esc(desc)}</desc>
<style>${css.replace(/\s*\n\s*/g, '')}</style>
<defs>${defs}</defs>
${body}
</svg>
`;
}

export function write(path, svg) {
  fs.writeFileSync(path, svg);
  return { path, kb: (Buffer.byteLength(svg) / 1024).toFixed(1) };
}
