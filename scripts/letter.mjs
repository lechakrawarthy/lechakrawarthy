// "letter" — the profile as a handwritten note. Pen-drawn hero + looping signature footer.
import path from 'node:path';
import { THEMES, makeWriter, penFont, penDraw, polyStroke, cycleFade, fadeIn, text, esc } from './lib.mjs';

const DIR = path.dirname(new URL(import.meta.url).pathname).replace(/^\/(\w:)/, '$1');
const write = makeWriter(path.join(DIR, 'fonts'), path.join(DIR, '..', 'Assets', 'letter'));
const pen = penFont(path.join(DIR, 'fonts', 'EMSAllure.svg'));

const wobble = (seed) => (i) => Math.sin(i * 0.31 + seed) * 0.9;

// a small hand-drawn sun: an almost-closed circle, then rays
function sunDoodle(cx, cy, r) {
  const w = wobble(2), pts = [];
  for (let i = 0; i <= 44; i++) {
    const a = -Math.PI / 2 + (i / 40) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * (r + w(i)), cy + Math.sin(a) * (r + w(i))]);
  }
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    return polyStroke([[cx + Math.cos(a) * (r + 7), cy + Math.sin(a) * (r + 7)], [cx + Math.cos(a) * (r + 15), cy + Math.sin(a) * (r + 15)]]);
  });
  return [polyStroke(pts), ...rays];
}

// the pixel dino, traced as one outline + an eye
function dinoDoodle(x, y, s) {
  const P = [[0, 16], [4, 16], [4, 10], [9, 10], [9, 4], [18, 4], [18, 11], [14, 11], [14, 22], [14, 27], [11, 27], [11, 22], [9, 22], [9, 27], [6, 27], [6, 22], [4, 22], [4, 20], [0, 20], [0, 16]];
  const eye = [[15, 6.5], [15.6, 7.1]];
  const arm = [[14, 17], [16.5, 17], [16.5, 18.6]];
  const map = (p) => [x + p[0] * s, y + p[1] * s];
  return [polyStroke(P.map(map)), polyStroke(eye.map(map)), polyStroke(arm.map(map))];
}

async function hero(T) {
  const W = 1000, H = 240, size = 92, base = 122;
  const line = "hi, i'm chakrawarthy";
  const w = pen.widthOf(line, size);
  const x0 = (W - w - 70) / 2;
  const ink = penDraw(pen.layout(line, x0, base, size), { begin: 0.3, speed: 900, lift: 0.02, color: T.ink, width: 2.2 });

  const ux0 = x0 + pen.widthOf("hi, i'm ", size) + 6, ux1 = x0 + w + 4;
  const swoosh = [];
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    swoosh.push([ux0 + (ux1 - ux0) * t, base + 34 - 9 * t + 5 * Math.sin(Math.PI * t)]);
  }
  const under = penDraw([polyStroke(swoosh)], { begin: ink.end + 0.15, speed: 900, color: T.accent, width: 2.6 });
  const sun = penDraw(sunDoodle(x0 + w + 52, base - 56, 12), { begin: under.end + 0.1, speed: 380, lift: 0.02, color: T.accent, width: 2.2 });

  const body = `
  <g>${ink.svg}</g>
  <g>${under.svg}</g>
  <g>${sun.svg}</g>
  <g opacity="0">${fadeIn(sun.end + 0.1, 1)}
    ${text('m', W / 2, 214, 13, T.muted, esc('founder · engineer · community builder  —  hyderabad × bengaluru'), 'text-anchor="middle"')}
  </g>`;
  await write(`hero-${T.name}`, W, H, "hi, i'm chakrawarthy — founder, engineer, community builder", body);
}

async function footer(T) {
  const W = 1000, H = 220, cycle = 16;
  const q1 = 'after all this time?', q2 = 'always.';
  const s1 = 62, s2 = 92;
  const w1 = pen.widthOf(q1, s1), w2 = pen.widthOf(q2, s2);
  const x1 = (W - w1) / 2 - 90, x2 = (W - w2) / 2 + 70;
  const a = penDraw(pen.layout(q1, x1, 82, s1), { begin: 0.6, speed: 480, color: T.muted, width: 1.8, cycle });
  const b = penDraw(pen.layout(q2, x2, 168, s2), { begin: a.end + 0.6, speed: 480, color: T.accent, width: 2.4, cycle });
  const d = penDraw(dinoDoodle(x2 + w2 + 28, 168 - 27 * 1.9, 1.9), { begin: b.end + 0.5, speed: 260, lift: 0.05, color: T.ink, width: 1.8, cycle });
  const body = `<g>${cycleFade(cycle)}${a.svg}${b.svg}${d.svg}</g>`;
  await write(`footer-${T.name}`, W, H, '“after all this time?” “always.”', body);
}

for (const T of Object.values(THEMES)) {
  await hero(T);
  await footer(T);
}
