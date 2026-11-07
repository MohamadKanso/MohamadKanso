// LIVE TELEMETRY — pulls public GitHub stats and renders assets/v2/telemetry.svg.
// Runs daily in .github/workflows/telemetry.yml. Locally: GITHUB_TOKEN=$(gh auth token) node scripts/telemetry.mjs
import { C, n, rng, text, measure, Glyphs, starfield, nebula, brackets, svgDoc, write, TWINKLE_CSS } from './lib/kit.mjs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const LOGIN = process.env.GH_LOGIN || 'MohamadKanso';
const TOKEN = process.env.GITHUB_TOKEN;
const EXCLUDE = new Set(['Jupyter Notebook']);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const QUERY = `query($login: String!) {
  user(login: $login) {
    followers { totalCount }
    pullRequests { totalCount }
    repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false) {
      totalCount
      nodes { stargazerCount languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name color } } } }
    }
    contributionsCollection {
      totalCommitContributions
      contributionCalendar { totalContributions weeks { contributionDays { contributionCount date } } }
    }
  }
}`;

async function fetchStats() {
  if (!TOKEN) throw new Error('GITHUB_TOKEN is required');
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'kanso-telemetry' },
    body: JSON.stringify({ query: QUERY, variables: { login: LOGIN } }),
  });
  const json = await res.json();
  if (json.errors || !json.data?.user) throw new Error('GraphQL error: ' + JSON.stringify(json.errors || json));
  const u = json.data.user;
  const days = u.contributionsCollection.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
  const weeks = u.contributionsCollection.contributionCalendar.weeks.map((w) => w.contributionDays.reduce((a, d) => a + d.contributionCount, 0));
  // streaks
  let longest = 0, run = 0;
  for (const d of days) { run = d.contributionCount > 0 ? run + 1 : 0; longest = Math.max(longest, run); }
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) current++;
    else if (i === days.length - 1) continue; // today may not have started
    else break;
  }
  const langs = {};
  let stars = 0;
  for (const r of u.repositories.nodes) {
    stars += r.stargazerCount;
    for (const e of r.languages.edges) {
      if (EXCLUDE.has(e.node.name)) continue; // notebook JSON (outputs, images) swamps byte counts
      langs[e.node.name] = langs[e.node.name] || { size: 0, color: e.node.color || '#9aa3c7' };
      langs[e.node.name].size += e.size;
    }
  }
  const total = Object.values(langs).reduce((a, l) => a + l.size, 0) || 1;
  const top = Object.entries(langs).sort((a, b) => b[1].size - a[1].size).map(([name, l]) => ({ name, color: l.color, pct: (l.size / total) * 100 }));
  return {
    contributions: u.contributionsCollection.contributionCalendar.totalContributions,
    commits: u.contributionsCollection.totalCommitContributions,
    prs: u.pullRequests.totalCount,
    stars,
    repos: u.repositories.totalCount,
    followers: u.followers.totalCount,
    longest, current, weeks, days, langs: top,
  };
}

function render(s) {
  const W = 1280, H = 476, r = rng(1977);
  const G = new Glyphs('y');
  const neb = nebula(r, { cx: 640, cy: 260, w: 1300, h: 500, colors: ['#123a8a', '#2a1670', '#0b4a5e'], blobs: 12, maxOpacity: 0.18, idp: 'yn' });
  let defs = `<clipPath id="yc"><rect width="${W}" height="${H}" rx="22"/></clipPath><linearGradient id="ybg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03040b"/><stop offset="1" stop-color="#060817"/></linearGradient>` + neb.defs;
  let css = TWINKLE_CSS, body = `<g clip-path="url(#yc)"><rect width="${W}" height="${H}" fill="url(#ybg)"/>${neb.body}` + starfield(r, { w: W, h: H, count: 220, twinkle: 0.1, rMax: 1, opacity: [0.15, 0.6] });

  const now = new Date();
  const stamp = now.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
  body += `<circle cx="70" cy="62" r="4" fill="${C.green}" class="tw"/>`;
  body += G.text(`LIVE TELEMETRY · SYNCED ${stamp}`, { font: 'jb600', size: 11.5, x: 84, y: 66, tracking: 0.2 }, `fill="${C.cyan}"`).svg;
  body += G.text('SOURCE · GITHUB GRAPHQL API · REFRESHED DAILY BY GITHUB ACTIONS', { font: 'jb400', size: 10.5, x: W - 64, y: 66, anchor: 'end', tracking: 0.16 }, `fill="${C.faint}"`).svg;

  // ---------- odometer stats ----------
  const stats = [
    ['CONTRIBUTIONS', s.contributions, 'LAST 12 MONTHS'],
    ['COMMITS', s.commits, 'LAST 12 MONTHS'],
    ['PULL REQUESTS', s.prs, 'ALL TIME'],
    ['STARS EARNED', s.stars, 'ACROSS REPOS'],
    ['PUBLIC REPOS', s.repos, 'ORIGINAL WORK'],
    ['LONGEST STREAK', s.longest, `DAYS · NOW ${s.current}`],
  ];
  const SIZE = 44, LH = 56;
  const digitW = Math.max(...'0123456789'.split('').map((d) => measure(d, { font: 'unb500', size: SIZE })));
  let roll = '';
  for (let d = 0; d <= 9; d++) roll += `@keyframes r${d}{from{transform:translateY(0)}to{transform:translateY(${-(10 + d) * LH}px)}}`;
  css += roll;
  defs += `<linearGradient id="yN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#8fd6ff"/></linearGradient>`;
  const colW = (W - 128) / stats.length;
  stats.forEach(([label, value, sub], i) => {
    const x0 = 64 + i * colW;
    const y0 = 150;
    if (i) body += `<rect x="${n(x0 - 14)}" y="104" width="1" height="92" fill="${C.lineHi}" opacity=".7"/>`;
    body += G.text(label, { font: 'jb600', size: 11, x: x0, y: 112, tracking: 0.18 }, `fill="${C.dim}"`).svg;
    const str = Number(value).toLocaleString('en-GB');
    let cx = x0;
    let k = 0;
    const digits = [...str].filter((c) => /\d/.test(c)).length;
    for (const ch of str) {
      if (!/\d/.test(ch)) {
        body += text(ch, { font: 'unb500', size: SIZE, x: cx, y: y0 + 16 }, 'fill="url(#yN)"');
        cx += measure(ch, { font: 'unb500', size: SIZE }) + 2;
        continue;
      }
      const d = +ch;
      const id = `yd${i}_${k}`;
      defs += `<clipPath id="${id}"><rect x="${n(cx - 2)}" y="${y0 + 16 - SIZE * 0.86}" width="${n(digitW + 4)}" height="${n(SIZE * 1.0)}"/></clipPath>`;
      let strip = '';
      for (let j = 0; j < 20; j++) strip += G.text(String(j % 10), { font: 'unb500', size: SIZE, x: cx + digitW / 2, y: y0 + 16 + j * LH, anchor: 'middle' }).svg;
      const delay = n(0.25 + (digits - 1 - k) * 0.12 + i * 0.1, 2);
      body += `<g clip-path="url(#${id})" fill="url(#yN)"><g style="animation:r${d} 2.4s cubic-bezier(.15,.75,.15,1) ${delay}s both">${strip}</g></g>`;
      cx += digitW + 2;
      k++;
    }
    body += G.text(sub, { font: 'jb400', size: 10.5, x: x0, y: 192, tracking: 0.16 }, `fill="${C.faint}"`).svg;
  });

  // ---------- signal waveform: weekly contributions ----------
  const gx = 64, gy = 248, gw = 760, gh = 190;
  const wk = s.weeks.slice(-53);
  const max = Math.max(1, ...wk);
  const px = (i) => gx + (i / (wk.length - 1)) * gw;
  const py = (v) => gy + gh - 14 - (v / max) * (gh - 40);
  // smooth path (Catmull-Rom → Bezier)
  const pts = wk.map((v, i) => [px(i), py(v)]);
  let d = `M${n(pts[0][0])} ${n(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${n(c1[0])} ${n(Math.min(gy + gh - 14, c1[1]))} ${n(c2[0])} ${n(Math.min(gy + gh - 14, c2[1]))} ${n(p2[0])} ${n(p2[1])}`;
  }
  const area = `${d}L${n(gx + gw)} ${gy + gh - 14}L${gx} ${gy + gh - 14}Z`;
  defs += `<linearGradient id="yA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity=".35"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>
<linearGradient id="yBeam" x1="0" x2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset="1" stop-color="${C.cyan}" stop-opacity=".35"/></linearGradient>
<clipPath id="yG"><rect x="${gx}" y="${gy}" width="${gw}" height="${gh}"/></clipPath>`;
  body += `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" rx="8" fill="#050816" fill-opacity=".7" stroke="${C.lineHi}"/>`;
  let gridL = '';
  for (let i = 1; i < 4; i++) gridL += `M${gx} ${n(gy + (i * gh) / 4)}H${gx + gw}`;
  for (let i = 1; i < 12; i++) gridL += `M${n(gx + (i * gw) / 12)} ${gy}V${gy + gh}`;
  body += `<path d="${gridL}" stroke="${C.cyan}" stroke-opacity=".06"/>`;
  const L = 3000;
  css += `@keyframes ydraw{from{stroke-dashoffset:${L}}to{stroke-dashoffset:0}}@keyframes ybeam{from{transform:translateX(0)}to{transform:translateX(${gw}px)}}`;
  body += `<g clip-path="url(#yG)"><path d="${area}" fill="url(#yA)" style="animation:fadeY 2s ease-out .4s both"/><path d="${d}" fill="none" stroke="${C.cyan}" stroke-width="5" stroke-opacity=".15"/><path d="${d}" fill="none" stroke="#bff3ff" stroke-width="1.8" stroke-dasharray="${L}" style="animation:ydraw 3s ease-out .3s both"/>
<g style="animation:ybeam 6s linear infinite"><rect x="${gx - 60}" y="${gy}" width="60" height="${gh}" fill="url(#yBeam)"/><rect x="${gx - 1}" y="${gy}" width="1.2" height="${gh}" fill="${C.cyan}" opacity=".7"/></g></g>`;
  css += `@keyframes fadeY{from{opacity:0}to{opacity:1}}`;
  const peak = wk.indexOf(max);
  body += `<circle cx="${n(px(peak))}" cy="${n(py(max))}" r="4" fill="#fff"/><circle cx="${n(px(peak))}" cy="${n(py(max))}" r="9" fill="none" stroke="${C.cyan}" class="tw"/>`;
  body += G.text(`PEAK ${max}/WK`, { font: 'jb600', size: 10.5, x: n(Math.min(px(peak) + 12, gx + gw - 90)), y: n(Math.max(py(max) - 8, gy + 18)), tracking: 0.14 }, `fill="${C.cyan}"`).svg;
  body += G.text('SIGNAL · WEEKLY CONTRIBUTIONS · 12 MONTHS', { font: 'jb600', size: 10.5, x: gx + 14, y: gy + 22, tracking: 0.16 }, `fill="${C.dim}"`).svg;
  // month ticks
  const months = [];
  let lastM = -1;
  const weeksDays = s.days.slice(-wk.length * 7);
  for (let i = 0; i < wk.length; i++) {
    const day = weeksDays[i * 7];
    if (!day) continue;
    const m = new Date(day.date).getUTCMonth();
    if (m !== lastM) { months.push([i, m]); lastM = m; }
  }
  const MN = 'JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC'.split(' ');
  months.forEach(([i, m]) => { if (i > 0 && i < wk.length - 2) body += G.text(MN[m], { font: 'jb400', size: 9.5, x: n(px(i)), y: gy + gh + 18, anchor: 'middle', tracking: 0.12 }, `fill="${C.faint}"`).svg; });

  // ---------- spectral analysis: languages ----------
  const sx = 868, sy = 248, sw = W - 64 - sx;
  body += `<rect x="${sx}" y="${sy}" width="${sw}" height="${gh}" rx="8" fill="#050816" fill-opacity=".7" stroke="${C.lineHi}"/>`;
  body += G.text('LANGUAGES · EXCL. NOTEBOOKS', { font: 'jb600', size: 10.5, x: sx + 16, y: sy + 22, tracking: 0.16 }, `fill="${C.dim}"`).svg;
  const top = s.langs.slice(0, 6);
  const otherPct = Math.max(0, 100 - top.reduce((a, l) => a + l.pct, 0));
  const bands = otherPct > 0.5 ? [...top, { name: 'Other', color: '#5b6490', pct: otherPct }] : top;
  let bx = sx + 16;
  const bw = sw - 32, by = sy + 40;
  defs += `<linearGradient id="ySheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient><clipPath id="ySp"><rect x="${sx + 16}" y="${by}" width="${bw}" height="22" rx="4"/></clipPath>`;
  let spectrum = '';
  bands.forEach((l) => {
    const w = (l.pct / 100) * bw;
    spectrum += `<rect x="${n(bx)}" y="${by}" width="${n(Math.max(w, 1))}" height="22" fill="${l.color}"/>`;
    for (let k = 0; k < Math.min(10, Math.floor(w / 6)); k++) spectrum += `<rect x="${n(bx + r() * w)}" y="${by}" width="1" height="22" fill="#000" opacity="${n(0.15 + r() * 0.3)}"/>`;
    bx += w;
  });
  css += `@keyframes ywipe{from{transform:scaleX(0)}to{transform:scaleX(1)}}`;
  body += `<g clip-path="url(#ySp)"><g style="animation:ywipe 1.6s cubic-bezier(.2,.7,.1,1) .5s both;transform-origin:${sx + 16}px 0">${spectrum}</g><rect x="${sx + 16}" y="${by}" width="${bw}" height="22" fill="url(#ySheen)"/></g>`;
  bands.slice(0, 6).forEach((l, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const lx = sx + 16 + col * (bw / 2), ly = by + 54 + row * 30;
    body += `<rect x="${n(lx)}" y="${ly - 9}" width="10" height="10" rx="2" fill="${l.color}"/>`;
    body += G.text(l.name, { font: 'jb600', size: 12, x: lx + 18, y: ly, tracking: 0.04 }, `fill="${C.text}"`).svg;
    body += G.text(`${l.pct.toFixed(1)}%`, { font: 'jb400', size: 12, x: lx + bw / 2 - 18, y: ly, anchor: 'end' }, `fill="${C.dim}"`).svg;
  });

  body += brackets(22, 22, W - 44, H - 44, { len: 22, op: 0.45 });
  body += `</g><rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="22" fill="none" stroke="${C.lineHi}"/>`;
  defs += G.defs();
  return svgDoc({
    w: W, h: H, title: 'Live GitHub telemetry for MohamadKanso',
    desc: `${s.contributions} contributions and ${s.commits} commits in the last 12 months, ${s.prs} pull requests, ${s.stars} stars, ${s.repos} public repos, longest streak ${s.longest} days. Top languages: ${s.langs.slice(0, 5).map((l) => `${l.name} ${l.pct.toFixed(1)}%`).join(', ')}.`,
    css, defs, body,
  });
}

const stats = await fetchStats();
const res = write(path.join(root, 'assets/v2/telemetry.svg'), render(stats));
console.log(`telemetry.svg ${res.kb} KB ·`, JSON.stringify({ ...stats, weeks: undefined, days: undefined, langs: stats.langs.slice(0, 6).map((l) => `${l.name} ${l.pct.toFixed(1)}%`) }));
