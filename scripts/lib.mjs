// Shared helpers for the profile SVG builders: themes, inlined subset fonts,
// and a single-stroke (pen) text engine for handwriting animations.

import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import subsetFont from 'subset-font';

export const THEMES = {
  dark: {
    name: 'dark', bg: '#0d1117', ink: '#e6edf3', soft: '#c9d1d9', muted: '#8b949e',
    faint: '#30363d', line: '#6e7681', accent: '#f78166', amber: '#ffb454', star: '#e6edf3',
  },
  light: {
    name: 'light', bg: '#ffffff', ink: '#1f2328', soft: '#424a53', muted: '#656d76',
    faint: '#d0d7de', line: '#8c959f', accent: '#e5603f', amber: '#e09b1a', star: '#57606a',
  },
};

const FACES = {
  m: { family: 'JBM', weight: 400, file: 'JetBrainsMono-Regular.ttf' },
  d: { family: 'SG', weight: 700, file: 'SpaceGrotesk-Bold.woff2' },
  dm: { family: 'SG', weight: 500, file: 'SpaceGrotesk-Medium.woff2' },
};

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const mono = (s, size) => s.length * size * 0.6;
export const text = (cls, x, y, size, fill, content, extra = '') =>
  `<text class="${cls}" x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${content}</text>`;
export const ts = (fill, s) => `<tspan fill="${fill}">${esc(s)}</tspan>`;

export function rng(seed) {
  return () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

// fade-in that starts at `begin` seconds and holds
export const fadeIn = (begin, dur = 0.8, to = 1) =>
  `<animate attributeName="opacity" from="0" to="${to}" begin="${begin}s" dur="${dur}s" fill="freeze"/>`;

export function makeWriter(fontDir, outDir) {
  const cache = {};
  async function fontCss(markup) {
    const chars = {};
    for (const m of markup.matchAll(/<text class="(\w+)"[^>]*>([\s\S]*?)<\/text>/g)) {
      const raw = m[2].replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      chars[m[1]] = (chars[m[1]] || '') + raw;
    }
    let css = '';
    for (const [cls, chunk] of Object.entries(chars)) {
      const f = FACES[cls];
      cache[f.file] ??= await fs.readFile(path.join(fontDir, f.file));
      const woff2 = await subsetFont(cache[f.file], [...new Set(chunk + ' ')].join(''), { targetFormat: 'woff2' });
      const fam = `${f.family}${cls}`;
      css += `@font-face{font-family:${fam};font-weight:${f.weight};src:url(data:font/woff2;base64,${woff2.toString('base64')}) format('woff2')}`;
      css += `.${cls}{font-family:${fam},ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-weight:${f.weight}}`;
    }
    return css;
  }
  return async function write(name, w, h, label, body, css = '') {
    const out = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">
<title>${esc(label)}</title>
<style>${await fontCss(body)}${css}</style>
${body}
</svg>
`;
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(path.join(outDir, `${name}.svg`), out);
    console.log(`  ${name}.svg  ${(out.length / 1024).toFixed(1)} KB`);
  };
}

// ───────────── pen text: SVG single-stroke fonts (EMS / Hershey) ─────────────

export function penFont(file) {
  const src = readFileSync(file, 'utf8');
  const defAdv = +src.match(/<font [^>]*horiz-adv-x="([\d.]+)"/)[1];
  const glyphs = {};
  for (const m of src.matchAll(/<glyph unicode="([^"]+)"[^>]*?horiz-adv-x="([\d.]+)"(?:[^>]*?\sd="([^"]*)")?/g)) {
    const ch = m[1].replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
      .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&apos;/g, "'");
    glyphs[ch] = { adv: +m[2], d: m[3] || '' };
  }
  const widthOf = (str, size) => [...str].reduce((a, c) => a + (glyphs[c]?.adv ?? defAdv), 0) * size / 1000;

  // returns strokes in output coordinates: [{ d, len }]
  function layout(str, x, baseline, size) {
    const s = size / 1000, strokes = [];
    let cx = x;
    for (const ch of str) {
      const g = glyphs[ch] ?? { adv: defAdv, d: '' };
      const toks = g.d.match(/[MLC]|-?[\d.]+(?:e-?\d+)?/g) || [];
      let cur = null, cmd = null, px = 0, py = 0, i = 0;
      const pt = () => [cx + +toks[i++] * s, baseline - +toks[i++] * s];
      while (i < toks.length) {
        if (/[MLC]/.test(toks[i])) cmd = toks[i++];
        if (cmd === 'M') {
          const [X, Y] = pt();
          cur = { d: `M${X.toFixed(1)} ${Y.toFixed(1)}`, len: 0 };
          strokes.push(cur); px = X; py = Y; cmd = 'L';
        } else if (cmd === 'L') {
          const [X, Y] = pt();
          cur.d += `L${X.toFixed(1)} ${Y.toFixed(1)}`; cur.len += Math.hypot(X - px, Y - py); px = X; py = Y;
        } else if (cmd === 'C') {
          const p1 = pt(), p2 = pt(), p3 = pt();
          cur.d += `C${[p1, p2, p3].map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')}`;
          cur.len += Math.hypot(p1[0] - px, p1[1] - py) + Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) + Math.hypot(p3[0] - p2[0], p3[1] - p2[1]);
          [px, py] = p3;
        } else i++;
      }
      cx += g.adv * s;
    }
    return strokes.filter((k) => k.len > 0.5);
  }
  return { layout, widthOf };
}

// animate strokes as if drawn by a pen; returns { svg, end }.
// With `cycle` (seconds) the drawing replays forever on that period instead of playing once.
export function penDraw(strokes, { begin = 0, speed = 520, lift = 0.035, color, width = 2, cycle = 0 }) {
  let t = begin, svg = '';
  for (const k of strokes) {
    const L = Math.ceil(k.len + 1), dur = Math.max(0.04, k.len / speed);
    const anim = cycle
      ? `<animate attributeName="stroke-dashoffset" values="${L};${L};0;0" keyTimes="0;${(t / cycle).toFixed(4)};${((t + dur) / cycle).toFixed(4)};1" dur="${cycle}s" repeatCount="indefinite"/>`
      : `<animate attributeName="stroke-dashoffset" from="${L}" to="0" begin="${t.toFixed(3)}s" dur="${dur.toFixed(3)}s" fill="freeze"/>`;
    svg += `<path d="${k.d}" stroke="${color}" stroke-width="${width}" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${L}" stroke-dashoffset="${L}">${anim}</path>`;
    t += dur + lift;
  }
  return { svg, end: t };
}

// group opacity for a looping drawing: visible, then fades out just before the cycle restarts
export const cycleFade = (cycle) =>
  `<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;${((cycle - 1.4) / cycle).toFixed(4)};${((cycle - 0.5) / cycle).toFixed(4)};1" dur="${cycle}s" repeatCount="indefinite"/>`;

// polyline points -> stroke with measured length (for hand-drawn doodles)
export function polyStroke(points) {
  let len = 0;
  for (let i = 1; i < points.length; i++) len += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  return { d: 'M' + points.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L'), len };
}
