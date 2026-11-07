// Builds every static SVG in assets/v2. Run: node scripts/build.mjs [name ...]
import { write } from './lib/kit.mjs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = (f) => path.join(root, 'assets/v2', f);

const scenes = {
  hero: async () => [['hero.svg', (await import('./scenes/hero.mjs')).hero()]],
  panels: async () => {
    const P = await import('./scenes/panels.mjs');
    const out = [
      ['terminal.svg', P.terminal()], ['hermes.svg', P.hermes()], ['footer.svg', P.footer()],
      ['btn-linkedin.svg', P.button('linkedin')], ['btn-email.svg', P.button('email')], ['btn-hermes.svg', P.button('hermes')],
      ['h-briefing.svg', P.header('01', 'MISSION BRIEFING', '// who is transmitting', 11)],
      ['h-missions.svg', P.header('02', 'MISSION LOG', '// every world in the system, up close', 12)],
      ['h-arsenal.svg', P.header('03', 'ARSENAL', '// the constellations I navigate by', 13)],
      ['h-trajectory.svg', P.header('04', 'TRAJECTORY', '// the flight path so far', 14)],
      ['h-telemetry.svg', P.header('05', 'TELEMETRY', '// live signal from GitHub, refreshed daily', 15)],
    ];
    for (const pr of P.PROJECTS) out.push([`card-${pr.key}.svg`, P.card(pr)]);
    return out;
  },
  sky: async () => {
    const S = await import('./scenes/sky.mjs');
    return [['constellations.svg', S.constellations()], ['trajectory.svg', S.trajectory()]];
  },
  universe: async () => [['universe.svg', (await import('./scenes/universe.mjs')).universe()]],
};

const only = process.argv.slice(2);
for (const [name, fn] of Object.entries(scenes)) {
  if (only.length && !only.includes(name)) continue;
  for (const [file, svg] of await fn()) {
    const res = write(out(file), svg);
    console.log(`${file.padEnd(28)} ${res.kb} KB`);
  }
}
