// Generates the profile: art in assets/v1/ and the README markup that stitches it together.
// The header and the body are each drawn as one scene, then cut into horizontal bands. Bands with links are
// split again so every link is its own <a>; slices sit flush (align=top, no whitespace) and read as one image.
// Type is measured with HarfBuzz and subset fonts are embedded. Motion is CSS inside the SVGs and turns off
// under prefers-reduced-motion. Every slice is written -dark and -light and picked with <picture>.
// Run: node scripts/build-readme.mjs [readme path, default readme-concepts/06-v1.md]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as hb from "harfbuzzjs";
import subsetFont from "subset-font";
import { execFileSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const out = join(root, "assets", "v1");
const readmePath = join(root, process.argv[2] ?? "readme-concepts/06-v1.md");
mkdirSync(out, { recursive: true });

// ---------- live data, fetched at build time ----------
const USER = "lechakrawarthy";
const gql = (query) => JSON.parse(execFileSync("gh", ["api", "graphql", "-f", `query=${query}`], { encoding: "utf8" })).data.user;
const CAL = "contributionCalendar{weeks{contributionDays{contributionCount date}}}";
const profile = gql(`query{user(login:"${USER}"){createdAt repositories(ownerAffiliations:OWNER,privacy:PUBLIC){totalCount} repositoriesContributedTo(contributionTypes:[COMMIT,PULL_REQUEST,ISSUE,REPOSITORY]){totalCount} contributionsCollection{${CAL}}}}`);
const DAYS = profile.contributionsCollection.contributionCalendar.weeks.map((w) => w.contributionDays);
const flat = DAYS.flat();
// all time: one query per calendar year since the account was created
const since = new Date(profile.createdAt), seen = new Map(), sums = { commits: 0, prs: 0, issues: 0 };
for (let y = since.getUTCFullYear(); y <= new Date().getUTCFullYear(); y++) {
  const from = new Date(Math.max(Date.UTC(y, 0, 1), since)).toISOString();
  const to = new Date(Math.min(Date.UTC(y, 11, 31, 23, 59, 59), Date.now())).toISOString();
  const c = gql(`query{user(login:"${USER}"){contributionsCollection(from:"${from}",to:"${to}"){totalCommitContributions totalPullRequestContributions totalIssueContributions ${CAL}}}}`).contributionsCollection;
  sums.commits += c.totalCommitContributions; sums.prs += c.totalPullRequestContributions; sums.issues += c.totalIssueContributions;
  for (const d of c.contributionCalendar.weeks.flatMap((w) => w.contributionDays)) seen.set(d.date, d.contributionCount);
}
const history = [...seen].sort(([a], [b]) => a.localeCompare(b)).map(([date, n]) => ({ date, n }));
const total = history.reduce((a, d) => a + d.n, 0);
const best = { len: 0, end: "" };
let run = 0;
for (const d of history) { run = d.n ? run + 1 : 0; if (run > best.len) Object.assign(best, { len: run, end: d.date }); }
let k = history.length - 1;
if (k >= 0 && !history[k].n) k--; // today can still be empty without breaking the streak
const cur = { len: 0, end: history[k]?.date };
while (k >= 0 && history[k].n) { cur.len++; k--; }
const today = new Date().toISOString().slice(0, 10);
const addDays = (date, n) => new Date(Date.parse(date + "T00:00:00Z") + n * 864e5).toISOString().slice(0, 10);
const fmt = (date, opts) => new Date(date + "T00:00:00Z").toLocaleString("en-US", { timeZone: "UTC", ...opts });
const span = ({ len, end }) => len
  ? `${fmt(addDays(end, 1 - len), { month: "short", day: "numeric" })} – ${fmt(end, { month: "short", day: "numeric", ...(end.slice(0, 4) !== today.slice(0, 4) ? { year: "numeric" } : {}) })}`
  : "starts with the next commit";
const npm = await (await fetch(`https://api.npmjs.org/downloads/point/2015-01-01:${today}/@lechakrawarthy/vazr`)).json();
const floor100 = (n) => (Math.floor(n / 100) * 100).toLocaleString("en-US") + "+";
const n = (x) => x.toLocaleString("en-US");
const langs = {};
for (let after = null, more = true; more;) {
  const page = gql(`query{user(login:"${USER}"){repositories(ownerAffiliations:OWNER,isFork:false,first:100${after ? `,after:"${after}"` : ""}){pageInfo{hasNextPage endCursor} nodes{primaryLanguage{name}}}}}`).repositories;
  for (const repo of page.nodes) if (repo.primaryLanguage) langs[repo.primaryLanguage.name] = (langs[repo.primaryLanguage.name] ?? 0) + 1;
  ({ hasNextPage: more, endCursor: after } = page.pageInfo);
}
const langTotal = Object.values(langs).reduce((a, b) => a + b, 0);
const sorted = Object.entries(langs).sort((a, b) => b[1] - a[1]);
const LANGS = [...sorted.slice(0, 4), ["Other", sorted.slice(4).reduce((a, [, c]) => a + c, 0)]].filter(([, c]) => c).map(([name, c]) => [name, c / langTotal]);
const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0].map((wd) => [["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][wd], history.filter((d) => new Date(d.date + "T00:00:00Z").getUTCDay() === wd).reduce((a, d) => a + d.n, 0)]);
const GITHUB = [
  [n(sums.commits), "commits"],
  [n(sums.prs), "pull requests"],
  [n(sums.issues), "issues"],
  [n(profile.repositories.totalCount), "public repos"],
  [n(profile.repositoriesContributedTo.totalCount), "contributed to"],
  [n(history.filter((d) => d.n).length), "active days"],
];

// ---------- content ----------
const LINKS = [
  ["lechakrawarthy.tech", "https://lechakrawarthy.tech"],
  ["linkedin.com/in/lechakrawarthy", "https://linkedin.com/in/lechakrawarthy"],
  ["chakravarthi1597@gmail.com", "mailto:chakravarthi1597@gmail.com"],
];
const PROJECTS = [
  ["vazr", "Developer Tool", `npm CLI for disk cleanup. ${floor100(npm.downloads)} installs.`, "https://github.com/lechakrawarthy/vazr"],
  ["Twinance", "FinTech", "Personal finance with an AI co-pilot.", "https://twinance.vercel.app"],
  ["AdMesh / AdPlex", "AI × Ads", "AI-native ad decision engine.", "https://admesh.co"],
  ["Issue Desk", "Event Platform", "Live hackathon desk. 278 teams, 1,600+ people.", "https://sihsupport.vercel.app"],
  ["QubitX", "Security", "Finds every key and cipher in a codebase, without running it.", ""],
];
const STATS = [
  [floor100(npm.downloads), "npm installs", "vazr"],
  ["1,600+", "live participants", "Issue Desk"],
  ["2,500+", "students at Epoch 3.0", "GitHub Community"],
  ["28", "core team led", "GitHub Community"],
  ["Top 35", "Smart India Hackathon", "2025"],
  ["Top 50", "Smart India Hackathon", "2026"],
  ["Top 1K", "of 4,000+ teams", "Cognizant Technoverse ’26"],
  ["0.97", "macro ROC-AUC", "DDoS-LSTM"],
];
const STACK = [
  ["Languages", "Python · TypeScript · SQL"],
  ["Frontend", "React · Next.js · Tailwind CSS"],
  ["Backend", "Node.js · Express · FastAPI"],
  ["AI / ML", "PyTorch · TensorFlow · LangChain"],
  ["Data", "PostgreSQL · MongoDB · Supabase"],
  ["Infra & Tools", "Docker · AWS · Linux"],
];
const BEYOND = [
  ["Founder @ SolarNexa", "Building solar trees with EV charging for dense cities."],
  ["President @ GitHub Community", "Led a 28-member core team and ran Epoch 3.0 for 2,500+ students."],
  ["99 Yards, New York", "React and Next.js for a fashion-tech platform, remote."],
];

// ---------- type ----------
const FONTS = {
  display: { file: "Inter.ttf", axes: { wght: 760, opsz: 32 } },
  sansB: { file: "Inter.ttf", axes: { wght: 650, opsz: 18 } },
  serifI: { file: "InstrumentSerif-Italic.ttf" },
  mono: { file: "IBMPlexMono-Regular.ttf" },
  monoI: { file: "IBMPlexMono-Italic.ttf" },
  monoSB: { file: "IBMPlexMono-SemiBold.ttf" },
};
for (const f of Object.values(FONTS)) {
  f.data = readFileSync(join(here, "fonts", f.file));
  const face = new hb.Face(new hb.Blob(f.data));
  f.font = new hb.Font(face);
  if (f.axes) f.font.setVariations(Object.entries(f.axes).map(([t, v]) => new hb.Variation(t, v)));
  f.upem = face.upem;
}
function width(key, s, size, ls = 0) {
  const f = FONTS[key];
  const buf = new hb.Buffer();
  buf.addText(s);
  buf.guessSegmentProperties();
  hb.shape(f.font, buf);
  const adv = buf.getGlyphPositions().reduce((a, p) => a + p.xAdvance, 0) / f.upem;
  return adv * size + ls * [...s].length;
}
// greedy line breaking over styled runs: [{key, text}] -> lines of [{key, word, x}]
function layout(runs, size, maxW) {
  const lines = [[]];
  let x = 0;
  for (const { key, text } of runs) {
    for (const word of text.split(" ").filter(Boolean)) {
      const w = width(key, word, size), sp = lines.at(-1).length ? width("mono", " ", size) : 0;
      if (lines.at(-1).length && x + sp + w > maxW) { lines.push([{ key, word, x: 0 }]); x = w; }
      else { lines.at(-1).push({ key, word, x: x + sp }); x += sp + w; }
    }
  }
  return lines;
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const r = (n) => Math.round(n * 100) / 100;

class Scene {
  constructor(w, h, css) { this.w = w; this.h = h; this.css = css; this.parts = []; this.used = {}; }
  raw(s) { this.parts.push(s); return this; }
  text(x, y, s, key, size, fill, { anchor = "start", ls = 0, cls = "", style = "" } = {}) {
    (this.used[key] ??= new Set());
    for (const ch of s) this.used[key].add(ch);
    this.parts.push(`<text x="${r(x)}" y="${r(y)}" font-family="${key}" font-size="${r(size)}" fill="${fill}"${anchor !== "start" ? ` text-anchor="${anchor}"` : ""}${ls ? ` letter-spacing="${ls}"` : ""}${cls ? ` class="${cls}"` : ""}${style ? ` style="${style}"` : ""}>${esc(s)}</text>`);
    return this;
  }
  async fonts() {
    if (this._faces) return this._faces;
    const faces = [];
    for (const [key, chars] of Object.entries(this.used)) {
      const f = FONTS[key];
      const woff2 = await subsetFont(f.data, [...chars].join("") + " ", { targetFormat: "woff2", ...(f.axes ? { variationAxes: f.axes } : {}) });
      faces.push(`@font-face{font-family:${key};src:url(data:font/woff2;base64,${woff2.toString("base64")}) format("woff2")}`);
    }
    return (this._faces = faces.join(""));
  }
  // one slice of the scene: same drawing, cropped by the viewBox
  async slice([x, y, w, h], title) {
    const still = "@media (prefers-reduced-motion:reduce){*{animation:none!important}}";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(x)} ${r(y)} ${r(w)} ${r(h)}" width="${r(w)}" height="${r(h)}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><style>${await this.fonts()}${this.css}${still}</style>${this.parts.join("")}</svg>\n`;
  }
}

// ---------- theme ----------
const THEMES = {
  dark: { fg: "#ededed", soft: "#c4c4c4", mute: "#8d8d8d", line: "#2f2f2f", rule: "#bdbdbd", glow: "#d8d8d8", grain: 1 },
  light: { fg: "#111111", soft: "#333333", mute: "#5f5f5f", line: "#dcdcdc", rule: "#444444", glow: "#3a3a3a", grain: 0 },
};
const W = 1000;

const MOTION = `
.rise{opacity:0;animation:rise .9s cubic-bezier(.2,.7,.2,1) forwards}
@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.fade{opacity:0;animation:fade .8s ease forwards}
@keyframes fade{to{opacity:1}}
.blink{animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.draw{stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.8s cubic-bezier(.6,0,.2,1) .3s forwards}
@keyframes draw{to{stroke-dashoffset:0}}
.breathe{animation:breathe 5s ease-in-out infinite}
@keyframes breathe{50%{opacity:.55}}
.spin{transform-box:fill-box;transform-origin:center;animation:spin 8s cubic-bezier(.7,0,.3,1) infinite}
@keyframes spin{0%,70%{transform:rotate(0)}85%,100%{transform:rotate(90deg)}}
.grow{transform-box:fill-box;transform-origin:left;transform:scaleX(0);animation:grow 1.2s cubic-bezier(.6,0,.2,1) .2s forwards}
@keyframes grow{to{transform:scaleX(1)}}
.nudge{animation:nudge 5s ease-in-out infinite}
@keyframes nudge{0%,78%,100%{transform:none}86%{transform:translate(4px,-4px)}}
.pulse{animation:pulse 3.6s ease-in-out infinite}
.slot{transform:translateY(56px);animation:slot 1s cubic-bezier(.2,.7,.2,1) forwards}
@keyframes slot{to{transform:none}}
.led{opacity:.18;animation:led 6.4s infinite}
@keyframes led{0%,2%{opacity:.18}5%,11%{opacity:1}16%,100%{opacity:.18}}
.cell{opacity:0;animation:fade .5s ease forwards}
.scan{animation:scan 9s linear infinite}
@keyframes scan{from{transform:translateX(-120px)}to{transform:translateX(1120px)}}
.growy{transform-box:fill-box;transform-origin:bottom;transform:scaleY(0);animation:growy 1.1s cubic-bezier(.2,.7,.2,1) forwards}
@keyframes growy{to{transform:scaleY(1)}}
@keyframes pulse{0%,100%{opacity:.35}12%,30%{opacity:1}45%{opacity:.35}}
`;

// ---------- header ----------
const HB = { a: 186, link: 34 }; // band A height, link band height
const IX = 492; // info column x
const LINK_W = 304;

function header(t, mode) {
  const H = 362;
  const s = new Scene(W, H, MOTION);
  s.text(0, 22, "LECHAKRAWARTHY  /  README", "mono", 13.5, t.fg, { ls: 3.2, cls: "fade" });
  s.text(W, 22, "V1.0", "mono", 13.5, t.fg, { anchor: "end", ls: 2, cls: "fade" });
  s.raw(`<rect x="0" y="40" width="${W}" height="1" fill="${t.rule}" opacity=".55" class="grow"/>`);

  s.text(-3, 126, "Chakrawarthy", "display", 64, t.fg, { ls: -2, cls: "rise", style: "animation-delay:.1s" });
  s.text(-3, 184, "Sreenivas.", "display", 64, t.fg, { ls: -2, cls: "rise", style: "animation-delay:.22s" });
  s.text(0, 240, "Builder. Engineer. Founder.", "serifI", 42, t.soft, { cls: "rise", style: "animation-delay:.42s" });
  s.raw(`<rect x="0" y="266" width="38" height="1.5" fill="${t.fg}" class="grow" style="animation-delay:.7s"/>`);
  const l1 = "I build products, systems and communities", l2 = "at the intersection of software, AI and real impact.";
  s.text(0, 304, l1, "mono", 15, t.soft, { cls: "fade", style: "animation-delay:.8s" });
  s.text(0, 328, l2, "mono", 15, t.soft, { cls: "fade", style: "animation-delay:.95s" });
  s.raw(`<rect x="${r(width("mono", l2, 15) + 6)}" y="316" width="8" height="15" fill="${t.fg}" class="blink"/>`);

  s.raw(`<rect x="${IX - 28}" y="84" width="1" height="250" fill="${t.line}"/>`);
  s.text(IX, 104, "Full-stack & AI engineer", "mono", 15, t.fg, { cls: "fade", style: "animation-delay:.3s" });
  s.text(IX, 129, "Building Twinance · shipping vazr", "mono", 15, t.fg, { cls: "fade", style: "animation-delay:.38s" });
  s.raw(`<g class="fade" style="animation-delay:.46s"><path d="M${IX + 6} 170.5c-3.6-4.3-5.5-7.3-5.5-9.6a5.5 5.5 0 0 1 11 0c0 2.3-1.9 5.3-5.5 9.6z" fill="none" stroke="${t.fg}" stroke-width="1.4"/><circle cx="${IX + 6}" cy="160.8" r="1.9" fill="${t.fg}"/></g>`);
  s.text(IX + 22, 167, "Hyderabad × Bengaluru, India", "mono", 15, t.fg, { cls: "fade", style: "animation-delay:.46s" });
  LINKS.forEach(([label], i) => {
    const y = HB.a + i * HB.link + 22, d = `animation-delay:${0.6 + i * 0.1}s`;
    s.raw(`<path d="M${IX} ${y - 5}H${IX + 14}M${IX + 9} ${y - 10}l5 5-5 5" fill="none" stroke="${t.fg}" stroke-width="1.4" class="fade" style="${d}"/>`);
    s.text(IX + 26, y, label, "mono", 15, t.fg, { cls: "fade", style: d });
    s.raw(`<rect x="${IX + 26}" y="${y + 6}" width="${r(width("mono", label, 15))}" height="1" fill="${t.mute}" class="grow" style="animation-delay:${0.8 + i * 0.1}s"/>`);
  });

  // three rounded corners stepping right; the last is a grainy quarter disc with a dot travelling the outer edge
  const right = W, top = 84, bottom = 268, R = 108, STEP = 36;
  const corner = (x) => `M${x} ${bottom}V${top + R}A${R} ${R} 0 0 1 ${x + R} ${top}H${right}`;
  const id = `a${mode}`, c = t.grain;
  s.raw(`<defs><linearGradient id="${id}f" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.glow}" stop-opacity=".9"/><stop offset=".55" stop-color="${t.glow}" stop-opacity=".3"/><stop offset="1" stop-color="${t.glow}" stop-opacity="0"/></linearGradient>`
    + `<filter id="${id}n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 ${c}  0 0 0 0 ${c}  0 0 0 0 ${c}  0 0 0 .6 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>`
    + `<clipPath id="${id}c"><path d="${corner(right - R)}V${bottom}z"/></clipPath></defs>`);
  for (const x of [right - R - 2 * STEP, right - R - STEP]) s.raw(`<path d="${corner(x)}" pathLength="1" fill="none" stroke="${t.soft}" stroke-width="1.1" class="draw"/>`);
  s.raw(`<g clip-path="url(#${id}c)" class="fade" style="animation-delay:.9s;animation-duration:1.6s"><g class="breathe"><rect x="${right - R}" y="${top}" width="${R}" height="${bottom - top}" fill="url(#${id}f)"/></g><rect x="${right - R}" y="${top}" width="${R}" height="${bottom - top}" fill="url(#${id}f)" filter="url(#${id}n)"/></g>`);
  s.raw(`<path d="M${right - R - 2 * STEP} ${bottom}H${right - R}M${right - R - STEP} ${bottom}v22" stroke="${t.soft}" stroke-width="1.1" class="fade" style="animation-delay:1.4s"/>`);
  s.raw(`<g class="spin"><path d="M${right - 30} ${bottom - 30}v60M${right - 60} ${bottom}h60" stroke="${t.soft}" stroke-width="1.1"/></g>`);
  s.raw(`<circle r="3" fill="${t.fg}" class="fade" style="animation-delay:2s"><animateMotion dur="9s" repeatCount="indefinite" calcMode="spline" keyPoints="0;1;0" keyTimes="0;.5;1" keySplines=".45 0 .55 1;.45 0 .55 1" path="${corner(right - R - 2 * STEP)}"/></circle>`);

  // bands: A full width, one band per link split [left | link | right], then the rest full width
  const bands = [[{ rect: [0, 0, W, HB.a] }]];
  LINKS.forEach(([label, url], i) => {
    const y = HB.a + i * HB.link;
    bands.push([
      { rect: [0, y, IX - 2, HB.link] },
      { rect: [IX - 2, y, LINK_W, HB.link], url, alt: label },
      { rect: [IX - 2 + LINK_W, y, W - (IX - 2 + LINK_W), HB.link] },
    ]);
  });
  const yEnd = HB.a + LINKS.length * HB.link;
  bands.push([{ rect: [0, yEnd, W, H - yEnd] }]);
  return { scene: s, bands, alt: "Chakrawarthy Sreenivas. Builder. Engineer. Founder. Full-stack and AI engineer, building Twinance and shipping vazr. Hyderabad and Bengaluru, India." };
}

// ---------- body: selected work beside stack and beyond code ----------
const LEFT_W = 500, RX = 540, RW = W - RX, HEAD = 58, ROW = 92;

function body(t) {
  const H = HEAD + PROJECTS.length * ROW + 10;
  const s = new Scene(W, H, MOTION);
  const head = (x, w, num, title) => {
    s.text(x, 34, `[${num}]`, "monoSB", 16, t.fg, { ls: 2 });
    s.text(x + 62, 34, title, "monoSB", 16, t.fg, { ls: 3.5 });
    s.raw(`<rect x="${x}" y="54" width="${w}" height="1.2" fill="${t.rule}" opacity=".7" class="grow"/>`);
  };
  head(0, LEFT_W, "02", "SELECTED WORK");
  head(RX, RW, "03", "TECH STACK");

  PROJECTS.forEach(([name, cat, desc, url], i) => {
    const y = HEAD + i * ROW, d = `animation-delay:${0.15 + i * 0.08}s`;
    s.raw(`<g class="rise" style="${d}">`);
    s.text(14, y + 41, name, "sansB", 21, t.fg, { ls: -0.3 });
    s.text(14, y + 66, cat, "monoI", 13.5, t.mute);
    const lines = layout([{ key: "mono", text: desc }], 14, 236);
    const y0 = y + ROW / 2 + 5 - (lines.length - 1) * 10;
    lines.forEach((ln, j) => s.text(196, y0 + j * 21, ln.map((w) => w.word).join(" "), "mono", 14, t.soft));
    s.raw(`</g>`);
    if (url) s.raw(`<g class="nudge" style="animation-delay:${1.5 + i * 0.9}s"><path d="M${LEFT_W - 34} ${y + 54}L${LEFT_W - 20} ${y + 40}M${LEFT_W - 30} ${y + 40}H${LEFT_W - 20}V${y + 50}" fill="none" stroke="${t.fg}" stroke-width="1.5" stroke-linecap="square"/></g>`);
    s.raw(`<rect x="0" y="${y + ROW - 1}" width="${LEFT_W}" height="1" fill="${t.line}"/>`);
  });

  const pitch = 31;
  STACK.forEach(([k, v], i) => {
    const y = HEAD + 10 + i * pitch, d = `animation-delay:${0.25 + i * 0.06}s`;
    s.text(RX + 10, y + 16, k, "sansB", 14, t.fg, { cls: "fade", style: d });
    s.text(RX + 132, y + 16, v, "mono", 13.5, t.soft, { cls: "fade", style: d });
    s.raw(`<rect x="${RX}" y="${y + pitch - 6}" width="${RW}" height="1" fill="${t.line}"/>`);
  });

  const y3 = HEAD + 10 + STACK.length * pitch + 24;
  s.raw(`<g transform="translate(0 ${y3})">`);
  head(RX, RW, "04", "BEYOND CODE");
  s.raw(`</g>`);
  let y = y3 + 84;
  BEYOND.forEach(([who, what], i) => {
    s.raw(`<rect x="${RX + 10}" y="${y - 10}" width="9" height="9" fill="${t.fg}" class="pulse" style="animation-delay:${i * 1.2}s"/>`);
    const lines = layout([{ key: "monoSB", text: who }, { key: "mono", text: `· ${what}` }], 13.5, RW - 34);
    lines.forEach((ln, j) => ln.forEach((w) => s.text(RX + 32 + w.x, y + j * 20, w.word, w.key, 13.5, w.key === "monoSB" ? t.fg : t.soft)));
    y += lines.length * 20 + 14;
  });
  s.raw(`<rect x="${RX}" y="${H - 5}" width="${RW}" height="1" fill="${t.line}"/>`);

  const bands = [[{ rect: [0, 0, W, HEAD] }]];
  PROJECTS.forEach(([name, cat, desc, url], i) => {
    const y0 = HEAD + i * ROW, h = i === PROJECTS.length - 1 ? H - y0 : ROW;
    bands.push([{ rect: [0, y0, LEFT_W + 20, h], url, alt: `${name}, ${cat}: ${desc}` }, { rect: [LEFT_W + 20, y0, W - LEFT_W - 20, h] }]);
  });
  return { scene: s, bands, alt: "Selected work, tech stack and beyond code.", overflow: y - H };
}

// ---------- section title for the full-width scenes ----------
function title(s, t, num, label) {
  s.text(0, 34, `[${num}]`, "monoSB", 16, t.fg, { ls: 2 });
  s.text(62, 34, label, "monoSB", 16, t.fg, { ls: 3.5 });
  s.raw(`<rect x="0" y="54" width="${W}" height="1.2" fill="${t.rule}" opacity=".7" class="grow"/>`);
}

// ---------- in numbers: a 4 x 2 grid; numbers slide up into place, a marker steps from cell to cell ----------
function numbers(t, mode) {
  const cols = 4, cw = W / cols, ch = 122, top = 58, H = top + 2 * ch + 4;
  const s = new Scene(W, H, MOTION);
  title(s, t, "01", "IN NUMBERS");
  STATS.forEach(([value, label, sub], i) => {
    const cx = (i % cols) * cw, cy = top + Math.floor(i / cols) * ch, pad = i % cols ? 22 : 4;
    if (i % cols) s.raw(`<rect x="${cx}" y="${cy + 18}" width="1" height="${ch - 36}" fill="${t.line}"/>`);
    s.raw(`<clipPath id="n${mode}${i}"><rect x="${cx}" y="${cy + 8}" width="${cw}" height="62"/></clipPath>`);
    s.raw(`<g clip-path="url(#n${mode}${i})">`);
    s.text(cx + pad, cy + 60, value, "display", 40, t.fg, { ls: -1, cls: "slot", style: `animation-delay:${0.2 + i * 0.07}s` });
    s.raw(`</g>`);
    s.text(cx + pad, cy + 88, label, "mono", 13.5, t.soft, { cls: "fade", style: `animation-delay:${0.5 + i * 0.07}s` });
    s.text(cx + pad, cy + 108, sub, "monoI", 12.5, t.mute, { cls: "fade", style: `animation-delay:${0.6 + i * 0.07}s` });
    s.raw(`<rect x="${cx + cw - (i % cols === cols - 1 ? 8 : 22)}" y="${cy + 22}" width="6" height="6" fill="${t.fg}" class="led" style="animation-delay:${i * 0.8}s"/>`);
  });
  s.raw(`<rect x="0" y="${top + ch}" width="${W}" height="1" fill="${t.line}"/><rect x="0" y="${H - 3}" width="${W}" height="1" fill="${t.line}"/>`);
  return { scene: s, bands: [[{ rect: [0, 0, W, H] }]], alt: STATS.map(([v, l, sub]) => `${v} ${l} (${sub})`).join(", ") };
}

// ---------- github: total, current streak in a ring, longest streak, the calendar, six counts ----------
function activity(t, mode) {
  const top = 58, cw = W / 3, hy = top + 26, R = 46, ry = hy + 82, heroH = 196;
  const gy = hy + heroH + 40, step = W / DAYS.length, cell = step - 3.4, gridH = 7 * step;
  const by = gy + gridH + 36, ly = by + 104, H = ly + 150;
  const s = new Scene(W, H, MOTION);
  title(s, t, "05", "GITHUB");
  s.text(W, 34, `SINCE ${fmt(profile.createdAt.slice(0, 10), { month: "short", year: "numeric" }).toUpperCase()}`, "mono", 12, t.mute, { ls: 2.5, anchor: "end" });
  const label = (x, y, txt, anchor) => s.text(x, y, txt, "mono", 12, t.mute, { ls: 2.5, anchor });
  const big = (x, y, txt, anchor, id, delay) => {
    s.raw(`<clipPath id="${id}"><rect x="${anchor === "end" ? x - 400 : x - 10}" y="${y - 54}" width="410" height="66"/></clipPath><g clip-path="url(#${id})">`);
    s.text(x, y, txt, "display", 56, t.fg, { ls: -1.5, anchor, cls: "slot", style: `animation-delay:${delay}s` });
    s.raw("</g>");
  };

  // total, left
  label(4, hy + 16, "TOTAL CONTRIBUTIONS", "start");
  big(4, ry + 18, n(total), "start", `gt${mode}`, 0.2);
  s.text(4, ry + 50, `${fmt(profile.createdAt.slice(0, 10), { month: "short", year: "numeric" })} – Present`, "monoI", 13, t.mute);

  // current streak, centre, in a ring with a dot going round
  const cx = cw * 1.5, ring = `M${cx} ${ry - R}a${R} ${R} 0 1 1 0 ${2 * R}a${R} ${R} 0 1 1 0 ${-2 * R}`;
  label(cx, hy + 16, "CURRENT STREAK", "middle");
  s.raw(`<circle cx="${cx}" cy="${ry}" r="${R}" fill="none" stroke="${t.line}" stroke-width="2"/>`);
  s.raw(`<path d="${ring}" pathLength="1" fill="none" stroke="${t.fg}" stroke-width="2.2" class="draw"/>`);
  s.raw(`<circle r="4" fill="${t.fg}" class="fade" style="animation-delay:2s"><animateMotion dur="7s" repeatCount="indefinite" path="${ring}"/></circle>`);
  s.text(cx, ry + 14, String(cur.len), "display", 40, t.fg, { anchor: "middle", ls: -1, cls: "rise", style: "animation-delay:.5s" });
  s.text(cx, ry + R + 30, `${cur.len === 1 ? "day" : "days"} · ${span(cur)}`, "mono", 13, t.soft, { anchor: "middle" });

  // longest, right
  label(W - 4, hy + 16, "LONGEST STREAK", "end");
  big(W - 4, ry + 18, String(best.len), "end", `gl${mode}`, 0.35);
  s.text(W - 4, ry + 50, `days · ${span(best)}`, "monoI", 13, t.mute, { anchor: "end" });
  for (const x of [cw, 2 * cw]) s.raw(`<rect x="${x}" y="${hy}" width="1" height="${heroH - 26}" fill="${t.line}"/>`);

  // calendar, last 12 months
  const counts = flat.map((d) => d.contributionCount).filter(Boolean).sort((a, b) => a - b);
  const q = (p) => counts[Math.floor(p * (counts.length - 1))] ?? 1;
  const cuts = [q(0.25), q(0.5), q(0.8)];
  const level = (c) => (c === 0 ? 0 : 1 + cuts.filter((x) => c > x).length);
  const alpha = [0, 0.22, 0.42, 0.68, 1];
  let lastMonth = "";
  DAYS.forEach((week, wi) => {
    const m = fmt(week[0].date, { month: "short" });
    if (m !== lastMonth && wi < DAYS.length - 2) { s.text(wi * step, gy - 12, m.toUpperCase(), "mono", 11.5, t.mute, { ls: 1.5 }); lastMonth = m; }
    week.forEach((d) => {
      const di = new Date(d.date + "T00:00:00Z").getUTCDay(), lv = level(d.contributionCount);
      const fill = lv ? `fill="${t.fg}" fill-opacity="${alpha[lv]}"` : `fill="${t.line}"`;
      s.raw(`<rect x="${r(wi * step)}" y="${r(gy + di * step)}" width="${r(cell)}" height="${r(cell)}" rx="2" ${fill} class="cell" style="animation-delay:${r(0.2 + wi * 0.018)}s"/>`);
    });
  });
  s.raw(`<defs><linearGradient id="sc${mode}"><stop offset="0" stop-color="${t.fg}" stop-opacity="0"/><stop offset=".5" stop-color="${t.fg}" stop-opacity=".22"/><stop offset="1" stop-color="${t.fg}" stop-opacity="0"/></linearGradient><clipPath id="gc${mode}"><rect x="0" y="${gy}" width="${W}" height="${r(gridH)}"/></clipPath></defs>`);
  s.raw(`<g clip-path="url(#gc${mode})"><rect x="0" y="${gy}" width="120" height="${r(gridH)}" fill="url(#sc${mode})" class="scan"/></g>`);

  // six counts
  const sw = W / GITHUB.length;
  GITHUB.forEach(([v, l], i) => {
    const x = i * sw + (i ? 18 : 4);
    if (i) s.raw(`<rect x="${i * sw}" y="${by}" width="1" height="50" fill="${t.line}"/>`);
    s.text(x, by + 26, v, "display", 26, t.fg, { ls: -0.6, cls: "rise", style: `animation-delay:${0.4 + i * 0.07}s` });
    s.text(x, by + 48, l, "mono", 12.5, t.soft);
  });

  // top languages by repository, left
  s.raw(`<rect x="0" y="${ly - 34}" width="${W}" height="1" fill="${t.line}"/>`);
  label(4, ly, "TOP LANGUAGES", "start");
  s.text(460, ly, "by repository", "monoI", 12.5, t.mute, { anchor: "end" });
  LANGS.forEach(([name, share], i) => {
    const y = ly + 30 + i * 23;
    s.text(4, y, name, "mono", 13, t.soft);
    s.raw(`<rect x="140" y="${y - 8}" width="250" height="5" rx="1" fill="${t.line}"/>`);
    s.raw(`<rect x="140" y="${y - 8}" width="${r(Math.max(3, share * 250))}" height="5" rx="1" fill="${t.fg}" fill-opacity="${r(1 - i * 0.17)}" class="grow" style="animation-delay:${0.3 + i * 0.1}s"/>`);
    s.text(460, y, `${Math.round(share * 100)}%`, "mono", 13, t.fg, { anchor: "end" });
  });

  // contributions by weekday, right
  const wx = 540, ww = W - wx, slot = ww / 7, maxN = Math.max(...WEEKDAYS.map(([, c]) => c)), base = ly + 112;
  label(wx, ly, "BY WEEKDAY", "start");
  s.text(W, ly, `most active · ${WEEKDAYS.find(([, c]) => c === maxN)[0].toLowerCase()}`, "monoI", 12.5, t.mute, { anchor: "end" });
  WEEKDAYS.forEach(([day, c], i) => {
    const h = Math.max(2, (c / maxN) * 74), x = wx + i * slot + (slot - 26) / 2;
    s.raw(`<rect x="${r(x)}" y="${r(base - h)}" width="26" height="${r(h)}" rx="2" fill="${t.fg}" fill-opacity="${c === maxN ? 1 : 0.32}" class="growy" style="animation-delay:${0.3 + i * 0.07}s"/>`);
    s.text(x + 13, base + 20, day, "mono", 11.5, c === maxN ? t.fg : t.mute, { anchor: "middle", ls: 1.5 });
  });
  return { scene: s, bands: [[{ rect: [0, 0, W, H] }]], alt: `GitHub: ${n(total)} total contributions, current streak ${cur.len} days, longest streak ${best.len} days; ${GITHUB.map(([v, l]) => `${v} ${l}`).join(", ")}.` };
}

// ---------- footer ----------
function footer(t) {
  const words = ["BUILD", "REFINE", "SHIP", "REPEAT"];
  const size = 14, ls = 3.5, sp = width("mono", " ", size, ls), gap = sp * 2 + width("mono", "→", size, ls);
  const tw = words.reduce((a, w) => a + width("mono", w, size, ls), 0) + gap * 3;
  const lineW = W - tw - 70;
  const s = new Scene(W, 44, MOTION + `.word{opacity:.32;animation:lit 6s infinite}@keyframes lit{0%,4%{opacity:.32}8%,26%{opacity:1}32%,100%{opacity:.32}}.run{animation:run 3.5s cubic-bezier(.5,0,.5,1) infinite}@keyframes run{from{transform:translateX(-90px)}to{transform:translateX(${r(lineW)}px)}}`);
  s.raw(`<rect x="0" y="16" width="13" height="13" fill="${t.fg}" class="pulse"/><rect x="34" y="22" width="${r(lineW)}" height="1" fill="${t.rule}" opacity=".45"/>`);
  s.raw(`<defs><linearGradient id="seg"><stop offset="0" stop-color="${t.fg}" stop-opacity="0"/><stop offset=".8" stop-color="${t.fg}"/><stop offset="1" stop-color="${t.fg}" stop-opacity="0"/></linearGradient><clipPath id="ln"><rect x="34" y="20" width="${r(lineW)}" height="5"/></clipPath></defs>`);
  s.raw(`<g clip-path="url(#ln)"><rect x="34" y="21.5" width="90" height="2" fill="url(#seg)" class="run"/></g>`);
  let x = W - tw;
  words.forEach((w, i) => {
    s.text(x, 28, w, "mono", size, t.fg, { ls, cls: "word", style: `animation-delay:${i * 1.5}s` });
    x += width("mono", w, size, ls);
    if (i < 3) { s.text(x + sp, 28, "→", "mono", size, t.mute, { ls }); x += gap; }
  });
  return { scene: s, bands: [[{ rect: [0, 0, W, 44] }]], alt: "Build, refine, ship, repeat." };
}

// ---------- write slices and the README ----------
const pct = (w) => Math.floor((w / W) * 100000) / 1000;
const parts = { header, numbers, body, activity, footer };
const md = {};
for (const [name, fn] of Object.entries(parts)) {
  const built = Object.fromEntries(Object.entries(THEMES).map(([mode, t]) => [mode, fn(t, mode)]));
  if (built.dark.overflow > 0) console.warn(`${name}: right column overflows by ${built.dark.overflow}px`);
  const lines = [];
  for (const [bi, band] of built.dark.bands.entries()) {
    let line = "";
    for (const [si, sl] of band.entries()) {
      const file = band.length === 1 ? `${name}-${bi}` : `${name}-${bi}-${si}`;
      for (const mode of Object.keys(THEMES)) writeFileSync(join(out, `${file}-${mode}.svg`), await built[mode].scene.slice(sl.rect, sl.alt ?? built.dark.alt));
      const alt = sl.alt ?? (bi === 0 && si === 0 ? built.dark.alt : "");
      const img = `<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/v1/${file}-dark.svg"><img src="./assets/v1/${file}-light.svg" width="${pct(sl.rect[2])}%" align="top" alt="${esc(alt)}"></picture>`;
      line += sl.url ? `<a href="${sl.url}">${img}</a>` : img;
    }
    lines.push(line);
  }
  md[name] = `<p>\n${lines.join("<br>\n")}\n</p>`;
}

writeFileSync(readmePath, `<!-- Words, art and layout by @lechakrawarthy · CC BY-NC-SA 4.0, see LICENSE -->

${md.header}

<br>

${md.numbers}

<br>

${md.body}

<br>

${md.activity}

<br>

${md.footer}
`);
console.log("wrote", out, "and", readmePath);
