// Generates the datasheet art in assets/ds/: header (pinout), section rules, footer.
// Every piece is written twice, -dark and -light, and picked with <picture> so it follows the GitHub theme.
// Run: node scripts/build-datasheet.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "ds");
mkdirSync(out, { recursive: true });

const themes = {
  dark: {
    fg: "#e6edf3", mute: "#8b949e", dim: "#6e7681", line: "#30363d", chip: "#161b22", chip2: "#0d1117",
    acc: "#f78166", onAcc: "#0d1117",
    web: "#58a6ff", server: "#3fb950", ml: "#bc8cff", hw: "#d29922", pwr: "#6e7681",
  },
  light: {
    fg: "#1f2328", mute: "#59636e", dim: "#818b98", line: "#d0d7de", chip: "#f6f8fa", chip2: "#e6eaef",
    acc: "#cf4f2a", onAcc: "#ffffff",
    web: "#0969da", server: "#1a7f37", ml: "#8250df", hw: "#9a6700", pwr: "#818b98",
  },
};

const SANS = "'Segoe UI',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const svg = (w, h, title, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>${body}</svg>\n`;

const text = (x, y, s, { size = 16, fill, font = SANS, weight = 400, anchor = "start", ls = 0, extra = "" } = {}) =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${ls ? ` letter-spacing="${ls}"` : ""}${extra}>${esc(s)}</text>`;

// Pin 1 is top left; DIP numbering runs down the left side and back up the right.
const pins = [
  ["TS", "web"], ["REACT", "web"], ["NEXT.JS", "web"], ["NODE", "server"],
  ["FASTAPI", "server"], ["POSTGRES", "server"], ["SUPABASE", "server"], ["GND", "pwr"],
  ["MQTT", "hw"], ["ESP32", "hw"], ["DOCKER", "server"], ["LANGCHAIN", "ml"],
  ["TENSORFLOW", "ml"], ["PYTORCH", "ml"], ["PYTHON", "ml"], ["VCC", "pwr"],
];

function header(t) {
  const W = 1200, H = 540;
  const p = [];
  // running head, like page one of a vendor datasheet
  p.push(`<rect x="4" y="13" width="18" height="20" rx="3" fill="none" stroke="${t.fg}" stroke-width="2"/>`);
  for (const dy of [18, 23, 28]) p.push(`<path d="M0 ${dy}h4M22 ${dy}h4" stroke="${t.fg}" stroke-width="2"/>`);
  p.push(text(36, 29, "lechakrawarthy", { size: 17, fill: t.fg, weight: 700 }));
  p.push(text(W, 29, "LEC27 · OCTOBER 2023 · REVISED NOVEMBER 2026", { size: 14, fill: t.mute, font: MONO, anchor: "end", ls: 0.5 }));
  p.push(`<rect x="0" y="44" width="${W}" height="5" fill="${t.acc}"/>`);

  // title block
  p.push(text(0, 128, "LEC27", { size: 56, fill: t.acc, font: MONO, weight: 700, ls: 1 }));
  p.push(text(0, 184, "Full-Stack & ML Engineer", { size: 40, fill: t.fg, weight: 700 }));
  p.push(text(0, 232, "with Hardware I/O", { size: 40, fill: t.fg, weight: 700 }));
  p.push(text(0, 276, "Chakrawarthy · CS (AI & ML), GITAM · class of 2027", { size: 19, fill: t.mute }));

  // key/value block
  const kv = (y, k) => text(0, y, k, { size: 14, fill: t.dim, font: MONO, ls: 1.5 });
  p.push(`<path d="M0 312H560" stroke="${t.line}" stroke-width="1.5"/>`);
  p.push(kv(350, "STATUS"));
  p.push(`<circle cx="150" cy="345" r="6" fill="${t.server}"><animate attributeName="opacity" values="1;1;.25;1" keyTimes="0;.6;.8;1" dur="2s" repeatCount="indefinite"/></circle>`);
  p.push(text(166, 351, "Active, shipping", { size: 18, fill: t.fg }));
  p.push(kv(392, "LOCATION"));
  p.push(text(142, 393, "Bengaluru, India (UTC+5:30)", { size: 18, fill: t.fg }));
  p.push(kv(434, "PIN GROUPS"));
  let lx = 142;
  for (const [g, label] of [["web", "web"], ["server", "server"], ["ml", "ml"], ["hw", "hardware"]]) {
    p.push(`<rect x="${lx}" y="421" width="14" height="14" rx="2" fill="${t[g]}"/>`);
    p.push(text(lx + 22, 434, label, { size: 17, fill: t.fg }));
    lx += 22 + label.length * 9.5 + 24;
  }
  p.push(`<path d="M0 462H560" stroke="${t.line}" stroke-width="1.5"/>`);
  p.push(text(0, 494, "Figure 1. Pin configuration, 16-pin DIP, top view", { size: 14, fill: t.mute, font: MONO }));

  // pinout
  const bx = 808, bw = 196, by = 84, bh = 404, pitch = 46, first = by + 41;
  const pw = 34, ph = 14;
  p.push(`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="8" fill="${t.chip}" stroke="${t.line}" stroke-width="2"/>`);
  p.push(`<path d="M${bx + bw / 2 - 16} ${by + 1}a16 16 0 0 0 32 0z" fill="${t.chip2}" stroke="${t.line}" stroke-width="2"/>`);
  p.push(`<circle cx="${bx + 22}" cy="${by + 24}" r="5" fill="${t.dim}"/>`);
  p.push(text(bx + bw / 2, by + bh / 2 - 6, "LEC27", { size: 32, fill: t.fg, font: MONO, weight: 700, anchor: "middle", ls: 1 }));
  p.push(text(bx + bw / 2, by + bh / 2 + 22, "BLR · 2027", { size: 14, fill: t.mute, font: MONO, anchor: "middle", ls: 1.5 }));
  pins.forEach(([name, group], i) => {
    const left = i < 8;
    const row = left ? i : 15 - i;
    const cy = first + row * pitch;
    const px = left ? bx - pw : bx + bw;
    const color = t[group];
    p.push(`<rect x="${px}" y="${cy - ph / 2}" width="${pw}" height="${ph}" rx="2" fill="${color}"/>`);
    p.push(text(left ? bx + 12 : bx + bw - 12, cy + 5, String(i + 1), { size: 13, fill: t.dim, font: MONO, anchor: left ? "start" : "end" }));
    p.push(text(left ? px - 12 : px + pw + 12, cy + 6, name, {
      size: 17, fill: group === "pwr" ? t.mute : t.fg, font: MONO, weight: 600, anchor: left ? "end" : "start",
    }));
  });
  p.push(text(bx + bw / 2, 524, "TOP VIEW", { size: 13, fill: t.dim, font: MONO, anchor: "middle", ls: 2 }));

  return svg(W, H, "LEC27, Full-Stack & ML Engineer with Hardware I/O. Pinout: TypeScript, React, Next.js, Node, FastAPI, Postgres, Supabase, Docker, Python, PyTorch, TensorFlow, LangChain, ESP32, MQTT.", p.join(""));
}

function rule(t, num, title, W = 1200) {
  const H = 56;
  const body = [
    `<rect x="0" y="8" width="38" height="38" rx="4" fill="${t.acc}"/>`,
    text(19, 34, num, { size: 21, fill: t.onAcc, font: MONO, weight: 700, anchor: "middle" }),
    text(54, 36, title, { size: 25, fill: t.fg, weight: 700 }),
    `<path d="M0 ${H - 1}H${W}" stroke="${t.line}" stroke-width="2"/>`,
  ];
  return svg(W, H, `${num} ${title}`, body.join(""));
}

function footer(t) {
  const W = 1200, H = 52;
  const body = [
    `<path d="M0 6H${W}" stroke="${t.acc}" stroke-width="3"/>`,
    text(0, 36, "LEC27 · github.com/lechakrawarthy", { size: 14, fill: t.mute, font: MONO, ls: 0.5 }),
    text(W, 36, "Copyright © 2023–2026 Chakrawarthy · Page 1 of 1", { size: 14, fill: t.mute, font: MONO, anchor: "end", ls: 0.5 }),
  ];
  return svg(W, H, "LEC27 datasheet, page 1 of 1", body.join(""));
}

const sections = [
  ["1", "Features", 600],
  ["2", "Applications", 600],
  ["3", "Description"],
  ["4", "Specifications"],
  ["5", "Typical applications"],
  ["6", "Revision history"],
  ["7", "Support resources"],
];

for (const [mode, t] of Object.entries(themes)) {
  writeFileSync(join(out, `header-${mode}.svg`), header(t));
  writeFileSync(join(out, `footer-${mode}.svg`), footer(t));
  for (const [num, title, w] of sections) writeFileSync(join(out, `s${num}-${mode}.svg`), rule(t, num, title, w));
}
console.log("wrote", out);
