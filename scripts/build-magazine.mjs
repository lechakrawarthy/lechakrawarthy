// Generates the magazine art in assets/mag/: the cover, the inside page headers, a pull quote and the colophon.
// Type is measured with HarfBuzz and the fonts are subset and embedded, so every line sets exactly as designed.
// Inside pieces are written twice, -dark and -light, and picked with <picture> to follow the GitHub theme.
// Run: node scripts/build-magazine.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as hb from "harfbuzzjs";
import subsetFont from "subset-font";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "assets", "mag");
mkdirSync(out, { recursive: true });

// ---------- type ----------
const FONTS = {
  play: { file: "PlayfairDisplay.ttf", axes: { wght: 900 } },
  playI: { file: "PlayfairDisplay-Italic.ttf", axes: { wght: 500 } },
  playIB: { file: "PlayfairDisplay-Italic.ttf", axes: { wght: 800 } },
  anton: { file: "Anton.ttf" },
  inter: { file: "Inter.ttf", axes: { wght: 450, opsz: 18 } },
  interB: { file: "Inter.ttf", axes: { wght: 750, opsz: 18 } },
};
for (const f of Object.values(FONTS)) {
  f.data = readFileSync(join(here, "fonts", f.file));
  const face = new hb.Face(new hb.Blob(f.data));
  f.font = new hb.Font(face);
  if (f.axes) f.font.setVariations(Object.entries(f.axes).map(([t, v]) => new hb.Variation(t, v)));
  f.upem = face.upem;
  f.capH = extentsOf(f, "H");
}
function shapeRun(f, s) {
  const buf = new hb.Buffer();
  buf.addText(s);
  buf.guessSegmentProperties();
  hb.shape(f.font, buf);
  return buf;
}
function extentsOf(f, ch) {
  const buf = shapeRun(f, ch);
  const gid = buf.getGlyphInfos()[0].codepoint;
  return f.font.glyphExtents(gid).yBearing / f.upem;
}
// advance width of s at 1px, plus tracking
function width(key, s, size, ls = 0) {
  const f = FONTS[key];
  const adv = shapeRun(f, s).getGlyphPositions().reduce((a, p) => a + p.xAdvance, 0) / f.upem;
  return adv * size + ls * Math.max(0, [...s].length - 1);
}
const fitSize = (key, s, w, ls = 0) => w / width(key, s, 1, 0) - (ls * ([...s].length - 1)) / width(key, s, 1, 0);
function wrap(key, s, size, maxW, ls = 0) {
  const lines = [];
  let cur = "";
  for (const word of s.split(" ")) {
    const next = cur ? `${cur} ${word}` : word;
    if (cur && width(key, next, size, ls) > maxW) { lines.push(cur); cur = word; } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

class Svg {
  constructor(w, h) { this.w = w; this.h = h; this.parts = []; this.used = {}; }
  raw(s) { this.parts.push(s); return this; }
  text(x, y, s, key, size, fill, { anchor = "start", ls = 0, extra = "" } = {}) {
    (this.used[key] ??= new Set());
    for (const ch of s) this.used[key].add(ch);
    this.parts.push(`<text x="${r(x)}" y="${r(y)}" font-family="${key}" font-size="${r(size)}" fill="${fill}"${anchor !== "start" ? ` text-anchor="${anchor}"` : ""}${ls ? ` letter-spacing="${ls}"` : ""}${extra}>${esc(s)}</text>`);
    return this;
  }
  async render(title) {
    const faces = [];
    for (const [key, chars] of Object.entries(this.used)) {
      const f = FONTS[key];
      const woff2 = await subsetFont(f.data, [...chars].join("") + " ", {
        targetFormat: "woff2",
        ...(f.axes ? { variationAxes: f.axes } : {}),
      });
      faces.push(`@font-face{font-family:${key};src:url(data:font/woff2;base64,${woff2.toString("base64")}) format("woff2")}`);
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}" width="${this.w}" height="${this.h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><style>${faces.join("")}</style>${this.parts.join("")}</svg>\n`;
  }
}
const r = (n) => Math.round(n * 10) / 10;

// ---------- cover ----------
async function cover() {
  const W = 1200, P = 60;
  const ink = "#141210", cream = "#fff3e2", hot = "#7a1d06";
  const s = new Svg(W, 0);
  const bgDefs = (`<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f47b2b"/><stop offset="1" stop-color="#e2541a"/></linearGradient>`
    + `<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .07 0"/></filter></defs>`);

  // folio line
  s.text(P, 70, "VOL. IV  ·  Nº 27  ·  THE SHIPPING ISSUE", "interB", 17, ink, { ls: 3 });
  s.text(W - P, 70, "NOVEMBER 2026  ·  ONE GITHUB STAR", "interB", 17, ink, { ls: 3, anchor: "end" });
  s.raw(`<rect x="${P}" y="88" width="${W - 2 * P}" height="3" fill="${ink}"/>`);

  // masthead, set to the full measure
  const mast = "CHAKRAWARTHY";
  const mSize = fitSize("play", mast, W - 2 * P, -2);
  const mBase = 108 + FONTS.play.capH * mSize;
  s.text(P, mBase, mast, "play", mSize, ink, { ls: -2 });
  let y = mBase + 26;
  s.raw(`<rect x="${P}" y="${r(y)}" width="${W - 2 * P}" height="1.5" fill="${ink}"/>`);
  y += 44;
  s.text(P, y, "Software that leaves the building.", "playI", 30, ink);
  s.text(W - P, y - 3, "FULL-STACK  ·  AI & ML  ·  CLASS OF ’27", "interB", 16, ink, { ls: 3, anchor: "end" });
  y += 26;
  s.raw(`<rect x="${P}" y="${r(y)}" width="${W - 2 * P}" height="3" fill="${ink}"/>`);
  const top = y + 52;

  // main cover line, a justified stack
  const colX = 470, colW = W - P - colX;
  const stack = [[["IT ISN’T REAL", ink]], [["UNTIL ", ink], ["STRANGERS", cream]], [["USE IT.", ink]]];
  let sy = top;
  for (const segs of stack) {
    const size = fitSize("anton", segs.map((g) => g[0]).join(""), colW, 2);
    sy += FONTS.anton.capH * size;
    let x = colX;
    for (const [seg, fill] of segs) { s.text(x, sy, seg, "anton", size, fill, { ls: 2 }); x += width("anton", seg, size, 2) + 2; }
    sy += 26;
  }
  sy += 20;
  for (const l of wrap("inter", "A CS student put a disk-cleanup CLI on npm. 1,700+ installs later, notes on building for people you will never meet.", 24, colW)) {
    sy += 34; s.text(colX, sy, l, "inter", 24, ink);
  }
  sy += 48;
  s.text(colX, sy, "COVER STORY  →  PAGE 1", "interB", 17, cream, { ls: 3 });
  const mainBottom = sy;

  // left rail of cover lines
  const railW = colX - P - 50;
  const rails = [
    ["LIVE", "1,600 PEOPLE. ONE EVENT. NO SECOND TAKE.", "The issue desk that ran a hackathon."],
    ["MONEY", "THE CO-PILOT THAT READS YOUR LAST 90 DAYS", "Inside Twinance, 61 endpoints in."],
    ["SECURITY", "EVERY KEY IN THE CODEBASE, FOUND WITHOUT RUNNING IT", "QubitX made the SIH top 50."],
    ["MODELS", "SEVEN ATTACKS, ONE LSTM", "10.8M network flows, 0.97 ROC-AUC."],
  ];
  let ry = top + 6;
  rails.forEach(([kick, head, deck], i) => {
    s.text(P, ry + 14, kick, "interB", 15, hot, { ls: 4 });
    ry += 28;
    for (const l of wrap("anton", head, 40, railW, 0.5)) { ry += FONTS.anton.capH * 40 + 10; s.text(P, ry, l, "anton", 40, i === 0 ? cream : ink, { ls: 0.5 }); }
    ry += 32;
    s.text(P, ry, deck, "playI", 21, ink);
    ry += 44;
  });

  const bodyBottom = Math.max(mainBottom, ry - 20);
  s.raw(`<rect x="${colX - 26}" y="${top - 4}" width="1.5" height="${r(bodyBottom - top + 8)}" fill="${ink}" opacity=".5"/>`);

  // the free gift, in the space under the deck
  const R = 100, cx = W - P - R - 6, cy = (mainBottom + bodyBottom) / 2 + 8;
  s.raw(`<g transform="rotate(-9 ${r(cx)} ${r(cy)})"><circle cx="${r(cx)}" cy="${r(cy)}" r="${R}" fill="${cream}"/><circle cx="${r(cx)}" cy="${r(cy)}" r="${R - 10}" fill="none" stroke="${hot}" stroke-width="2" stroke-dasharray="2 6" stroke-linecap="round"/>`);
  s.text(cx, cy - 36, "FREE INSIDE", "interB", 14, hot, { anchor: "middle", ls: 3 });
  s.text(cx, cy + 16, "vazr", "playIB", 58, ink, { anchor: "middle" });
  s.text(cx, cy + 46, "one command away", "inter", 14, ink, { anchor: "middle" });
  s.raw(`</g>`);

  // also in this issue
  const by = bodyBottom + 44, H = by + 196;
  s.h = H;
  s.parts.unshift(bgDefs + `<rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" filter="url(#grain)"/>`);
  s.raw(`<rect x="${P}" y="${by}" width="${W - 2 * P}" height="3" fill="${ink}"/>`);
  s.text(P, by + 42, "ALSO IN THIS ISSUE", "interB", 15, hot, { ls: 4 });
  const also = "Applied AI at AdMesh, New York  ·  Interning at 99 Yards  ·  Leading 28 people at GitHub Community GITAM  ·  Two Smart India Hackathons  ·  Technoverse top 1,000 of 4,000+";
  let ay = by + 46;
  for (const l of wrap("playI", also, 23, 760)) { ay += 34; s.text(P, ay, l, "playI", 23, ink); }

  // barcode
  const bx = W - P - 190, bty = by + 30;
  s.raw(`<rect x="${bx - 12}" y="${bty - 12}" width="214" height="134" fill="${cream}"/>`);
  let x = bx, seed = 27;
  while (x < bx + 186) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const w = 1 + (seed % 4);
    s.raw(`<rect x="${x}" y="${bty}" width="${w}" height="88" fill="${ink}"/>`);
    x += w + 1 + ((seed >> 8) % 3);
  }
  s.text(bx + 93, bty + 108, "2027 · LECHAKRAWARTHY", "interB", 11, ink, { anchor: "middle", ls: 2 });

  return s.render("CHAKRAWARTHY magazine, issue 27. Cover story: It isn't real until strangers use it.");
}

// ---------- inside pages ----------
const themes = {
  dark: { fg: "#e6edf3", mute: "#8b949e", line: "#30363d", acc: "#ff8a4c" },
  light: { fg: "#1f2328", mute: "#59636e", line: "#d0d7de", acc: "#c2410c" },
};

async function header(t, kicker, title, page) {
  const W = 1200, size = Math.min(66, fitSize("play", title, W));
  const H = 86 + FONTS.play.capH * size + 34;
  const s = new Svg(W, Math.ceil(H));
  s.raw(`<rect x="0" y="0" width="${W}" height="3" fill="${t.fg}"/><rect x="0" y="7" width="${W}" height="1" fill="${t.fg}"/>`);
  s.text(0, 48, kicker, "interB", 16, t.acc, { ls: 4 });
  if (page) s.text(W, 48, page, "playI", 20, t.mute, { anchor: "end" });
  s.text(0, 86 + FONTS.play.capH * size, title, "play", size, t.fg, { ls: -0.5 });
  return s.render(`${kicker}: ${title}`);
}

async function pullQuote(t, quote, who) {
  const W = 1200, size = 42;
  const lines = wrap("playI", quote, size, W - 150);
  const H = 40 + lines.length * 58 + 70;
  const s = new Svg(W, H);
  s.text(0, 120, "“", "playIB", 170, t.acc);
  lines.forEach((l, i) => s.text(110, 70 + i * 58, l, "playI", size, t.fg));
  s.text(110, 70 + lines.length * 58 + 12, who.toUpperCase(), "interB", 15, t.mute, { ls: 4 });
  return s.render(`“${quote}” ${who}`);
}

async function colophon(t) {
  const W = 1200, H = 150;
  const s = new Svg(W, H);
  s.raw(`<rect x="0" y="0" width="${W}" height="1" fill="${t.fg}"/><rect x="0" y="4" width="${W}" height="3" fill="${t.fg}"/>`);
  s.text(0, 52, "COLOPHON", "interB", 15, t.acc, { ls: 4 });
  s.text(0, 92, "Written, designed, engineered and shipped by one person.", "playI", 28, t.fg);
  s.text(0, 128, "Set in Playfair Display, Anton and Inter. Issue 27, November 2026. Bengaluru.", "inter", 17, t.mute);
  s.text(W, 128, "CHAKRAWARTHY", "play", 22, t.fg, { anchor: "end", ls: 1 });
  return s.render("Colophon: written, designed, engineered and shipped by one person.");
}

const pages = [
  ["contents", "IN THIS ISSUE", "Contents", ""],
  ["cover", "COVER STORY", "It isn’t real until strangers use it", "page 1"],
  ["desk", "FEATURE", "1,600 people, one event, no second take", "page 2"],
  ["twinance", "FEATURE", "The co-pilot that reads your last 90 days", "page 3"],
  ["short", "SHORT READS", "Keys, ciphers and seven kinds of attack", "page 4"],
  ["record", "THE RECORD", "Where the work happened", "page 5"],
  ["letters", "LETTERS", "Write to the editor", "page 6"],
];

writeFileSync(join(out, "cover.svg"), await cover());
for (const [mode, t] of Object.entries(themes)) {
  for (const [id, kicker, title, page] of pages) writeFileSync(join(out, `${id}-${mode}.svg`), await header(t, kicker, title, page));
  writeFileSync(join(out, `quote-${mode}.svg`), await pullQuote(t, "A tool that deletes things should show you everything before it touches a single file.", "On designing vazr"));
  writeFileSync(join(out, `colophon-${mode}.svg`), await colophon(t));
}
console.log("wrote", out);
