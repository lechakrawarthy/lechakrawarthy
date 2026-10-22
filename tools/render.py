#!/usr/bin/env python3
"""Renders every SVG on the profile into assets/. Edit the data below, then run: python tools/render.py"""
from html import escape
from pathlib import Path
from textwrap import wrap

OUT = Path(__file__).resolve().parent.parent / "assets"

SANS = "'Segoe UI',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif"
MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace"
MONO_W = 0.6  # rough advance of one monospace glyph, in em

# GitHub's own palette, so the art sits on the page in either theme.
THEME = f"""
:root{{--bg:#0d1117;--card:#161b22;--chip:#21262d;--line:#30363d;--line2:#21262d;--fg:#e6edf3;--mute:#8b949e;--dim:#6e7681;--acc:#f78166;--ok:#3fb950}}
@media (prefers-color-scheme: light){{:root{{--bg:#ffffff;--card:#f6f8fa;--chip:#eaeef2;--line:#d0d7de;--line2:#e6eaef;--fg:#1f2328;--mute:#59636e;--dim:#818b98;--acc:#cf4f2a;--ok:#1a7f37}}}}
.bg{{fill:var(--bg)}}.card{{fill:var(--card);stroke:var(--line)}}.chip{{fill:var(--chip)}}.ln{{stroke:var(--line);fill:none}}
.fg{{fill:var(--fg)}}.mute{{fill:var(--mute)}}.dim{{fill:var(--dim)}}.acc{{fill:var(--acc)}}.ok{{fill:var(--ok)}}
.sans{{font-family:{SANS}}}.mono{{font-family:{MONO}}}
"""

# Terminal panels stay dark in both themes, like a real terminal would.
TERM = {"bg": "#0d1117", "bar": "#161b22", "line": "#30363d", "text": "#c9d1d9", "dim": "#6e7681",
        "acc": "#f78166", "ok": "#3fb950", "key": "#79c0ff", "str": "#a5d6ff"}


def esc(s):
    return escape(s, quote=False)


def svg(w, h, body, title, css=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
            f'viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-labelledby="t">'
            f'<title id="t">{esc(title)}</title><style>{THEME}{css}</style>\n{body}\n</svg>\n')


def terminal_frame(x, y, w, h, title):
    t = TERM
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="{t["bg"]}" stroke="{t["line"]}" stroke-width="2"/>'
            f'<path d="M{x + 1} {y + 30}h{w - 2}" stroke="{t["line"]}" stroke-width="1.5"/>'
            + "".join(f'<circle cx="{x + 20 + i * 18}" cy="{y + 15}" r="5" fill="#484f58"/>' for i in range(3))
            + f'<text x="{x + w / 2}" y="{y + 20}" text-anchor="middle" font-family="{MONO}" font-size="12" fill="{t["dim"]}">{esc(title)}</text>')


# ---------------------------------------------------------------- header

def header():
    t = TERM
    leds = [("ok", "ok"), ("ok", "acc"), ("ok", "ok"), ("acc", "ok"), ("ok", "acc")]
    rack = ['<rect x="62" y="70" width="132" height="176" rx="8" class="card" stroke-width="2"/>']
    for i, (a, b) in enumerate(leds):
        y = 82 + i * 32
        rack.append(f'<rect x="74" y="{y}" width="108" height="24" rx="4" class="bg ln" stroke-width="1.5"/>')
        rack.append(f'<path d="M84 {y + 12}h40" class="ln" stroke-width="2" stroke-linecap="round"/>')
        rack.append(f'<circle class="led d{i % 4}" cx="158" cy="{y + 12}" r="3.5" style="fill:var(--{a})"/>')
        rack.append(f'<circle class="led d{(i + 2) % 4}" cx="170" cy="{y + 12}" r="3.5" style="fill:var(--{b})"/>')

    lines = [
        (112, 813, f'<tspan fill="{t["acc"]}">$</tspan> npx @lechakrawarthy/vazr'),
        (138, 813, f'<tspan fill="{t["ok"]}">✔</tspan> scan complete <tspan fill="{t["dim"]}">· 4 roots</tspan>'),
        (162, 829, f'node_modules<tspan x="975" fill="{t["acc"]}">4.2 GB</tspan>'),
        (182, 829, f'build caches<tspan x="975" fill="{t["acc"]}">1.3 GB</tspan>'),
        (202, 829, f'old downloads<tspan x="975" fill="{t["acc"]}">0.8 GB</tspan>'),
        (230, 813, f'<tspan fill="{t["ok"]}">~6.3 GB</tspan> reclaimable <tspan fill="{t["dim"]}">· nothing deleted</tspan>'),
    ]
    term = [terminal_frame(795, 58, 360, 198, "~/code")]
    for i, (y, x, s) in enumerate(lines, 1):
        term.append(f'<text x="{x}" y="{y}" class="l{i}" font-family="{MONO}" font-size="13.5" fill="{t["text"]}">{s}</text>')
    term.append(f'<rect class="cursor" x="1124" y="219" width="8" height="15" fill="{t["acc"]}"/>')

    reveal = [4, 16, 24, 30, 36, 46]  # % of the loop at which each terminal line appears
    css = (".led{animation:blink 1.8s infinite}.d1{animation-delay:.4s}.d2{animation-delay:.9s}.d3{animation-delay:1.3s}"
           "@keyframes blink{0%,55%{opacity:1}65%,85%{opacity:.15}100%{opacity:1}}"
           ".cursor{animation:cur 1.1s steps(1) infinite}@keyframes cur{50%{opacity:0}}"
           + "".join(f".l{i}{{animation:a{i} 9s infinite}}@keyframes a{i}{{0%,{p}%{{opacity:0}}{p + 2}%,94%{{opacity:1}}100%{{opacity:0}}}}"
                     for i, p in enumerate(reveal, 1)))

    body = f"""<defs>
<pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" style="fill:var(--line2)"/></pattern>
<radialGradient id="glow"><stop offset="0" stop-color="#f78166" stop-opacity=".2"/><stop offset="1" stop-color="#f78166" stop-opacity="0"/></radialGradient>
<clipPath id="clip"><rect width="1200" height="320" rx="18"/></clipPath>
</defs>
<g clip-path="url(#clip)">
<rect width="1200" height="320" class="bg"/>
<rect width="1200" height="320" fill="url(#dots)"/>
<circle cx="975" cy="150" r="260" fill="url(#glow)"/>
{''.join(rack)}
<path id="trace" d="M128 246v34h847v-24" fill="none" style="stroke:var(--acc)" stroke-opacity=".35" stroke-width="2" stroke-dasharray="2 7"/>
<circle r="4.5" class="acc"><animateMotion dur="4.5s" repeatCount="indefinite"><mpath xlink:href="#trace"/></animateMotion></circle>
<text x="236" y="128" class="sans fg" font-size="60" font-weight="700" letter-spacing="-1">Chakrawarthy</text>
<text x="240" y="174" class="mono mute" font-size="21">Most of what I build runs on a <tspan class="acc">server</tspan>.</text>
<text x="240" y="206" class="mono mute" font-size="21">Some of it runs in your <tspan class="acc">terminal</tspan>.</text>
<text x="240" y="244" class="mono acc" font-size="13" font-weight="600" letter-spacing="3">FULL-STACK · AI &amp; ML · HYDERABAD × BENGALURU</text>
{''.join(term)}
</g>
<rect x="1" y="1" width="1198" height="318" rx="17" class="ln" stroke-width="2"/>"""
    return svg(1200, 320, body, "Chakrawarthy. Most of what I build runs on a server. Some of it runs in your terminal.", css)


# ---------------------------------------------------------------- links

LINKS = ["portfolio", "linkedin", "npm", "email"]


def link_button(label):
    cw = 14 * MONO_W
    w = round(22 + len(label) * cw + 10 + 14 + 18)
    body = (f'<rect x="1" y="1" width="{w - 2}" height="38" rx="9" class="card" stroke-width="1.5"/>'
            f'<text x="22" y="25" class="mono fg" font-size="14">{label}</text>'
            f'<text x="{w - 18}" y="25" text-anchor="end" class="mono acc" font-size="14">↗</text>')
    return svg(w, 40, body, label)


# ---------------------------------------------------------------- numbers

NUMBERS = [("1.7k+", "npm installs"), ("1,600+", "live hackathon users"),
           ("28", "people led"), ("2×", "smart india hackathon")]


def numbers():
    w, h, cell = 960, 124, 240
    out = [f'<rect x="1" y="1" width="{w - 2}" height="{h - 2}" rx="14" class="card" stroke-width="1.5"/>']
    for i, (value, label) in enumerate(NUMBERS):
        cx = cell * i + cell / 2
        if i:
            out.append(f'<path d="M{cell * i} 30v64" class="ln" stroke-width="1.5"/>')
        out.append(f'<text x="{cx}" y="68" text-anchor="middle" class="sans fg" font-size="38" font-weight="700">{esc(value)}</text>')
        out.append(f'<text x="{cx}" y="96" text-anchor="middle" class="mono mute" font-size="12" letter-spacing="1.5">{esc(label.upper())}</text>')
    return svg(w, h, "".join(out), " · ".join(f"{v} {l}" for v, l in NUMBERS))


# ---------------------------------------------------------------- sections

SECTIONS = {"work": ("01", "Selected work"), "log": ("02", "Log"), "stack": ("03", "Stack")}


def section(n, title):
    end = 34 + len(title) * (13 * MONO_W + 3) + 14
    body = (f'<text x="2" y="27" class="mono acc" font-size="13" font-weight="700" letter-spacing="2">{n}</text>'
            f'<text x="34" y="27" class="mono fg" font-size="13" font-weight="600" letter-spacing="3">{esc(title.upper())}</text>'
            f'<path d="M{end:.0f} 22.5H960" class="ln" stroke-width="1.5"/>')
    return svg(960, 40, body, f"{n} · {title}")


# ---------------------------------------------------------------- project cards

PROJECTS = [
    dict(id="vazr", tag="CLI · OPEN SOURCE", status="shipped",
         title="vazr", desc="Finds the node_modules, build caches and old downloads eating your disk, and shows you all of it before deleting anything.",
         chips=[("1.7k+", "npm installs"), ("10", "releases")], tech="node.js · zero-dependency tui · win/mac/linux",
         link="https://github.com/lechakrawarthy/vazr"),
    dict(id="desk", tag="PLATFORM · LIVE EVENT", status="shipped",
         title="Hackathon issue desk", desc="QR issue intake and role-based triage that ran a live hackathon from start to finish. No second take.",
         chips=[("1,600+", "participants"), ("278", "teams")], tech="next.js · supabase · jwt · rbac",
         link="https://sihsupport.vercel.app"),
    dict(id="twinance", tag="FULL-STACK · APPLIED AI", status="live",
         title="Twinance", desc="Personal finance with an AI co-pilot that reads your last 90 days of transactions before it answers.",
         chips=[("61", "endpoints"), ("110+", "tests")], tech="react · node.js · postgresql · prisma",
         link="https://twinance.vercel.app"),
    dict(id="veridose", tag="EMBEDDED · FULL-STACK", status="in progress",
         title="Veridose", desc="A pill dispenser that has to be right every time, from the ESP32 firmware to the caregiver's phone.",
         chips=[("400+", "tests"), ("6", "spoken languages")], tech="esp32 · mqtt · typescript · expo"),
    dict(id="qubitx", tag="SECURITY · STATIC ANALYSIS", status="top 50 · SIH '26",
         title="QubitX", desc="Finds every key, cipher and certificate in a codebase without running a line of it.",
         chips=[("AST", "+ tree-sitter"), ("0", "lines executed")], tech="python · fastapi · sqlite"),
    dict(id="ddos", tag="ML · NETWORK SECURITY", status="research",
         title="DDoS-LSTM", desc="Classifies seven kinds of attack traffic from network flows, with live packet capture for real-time inference.",
         chips=[("0.97", "roc-auc"), ("10.8M", "flows")], tech="tensorflow · lstm · pyshark",
         link="https://github.com/lechakrawarthy/DDOS_LSTM"),
]

STATUS_DOT = {"shipped": "ok", "live": "ok", "in progress": "acc", "research": "dim"}


def card(i, p):
    w, h = 480, 232
    out = [f'<rect x="1" y="1" width="{w - 2}" height="{h - 2}" rx="14" class="card" stroke-width="1.5"/>',
           '<rect x="24" y="0" width="44" height="3" rx="1.5" class="acc"/>',
           f'<text x="24" y="38" class="mono acc" font-size="12" font-weight="700" letter-spacing="2">{i:02d}</text>',
           f'<text x="54" y="38" class="mono dim" font-size="12" letter-spacing="1.2">{esc(p["tag"])}</text>']

    status = p["status"]
    out.append(f'<text x="{w - 24}" y="38" text-anchor="end" class="mono mute" font-size="12">{esc(status)}</text>')
    dot_x = w - 24 - len(status) * 12 * MONO_W - 10
    out.append(f'<circle cx="{dot_x:.0f}" cy="34" r="4" class="{STATUS_DOT.get(status, "acc")}"/>')

    out.append(f'<text x="24" y="76" class="sans fg" font-size="25" font-weight="600">{esc(p["title"])}</text>')
    for j, line in enumerate(wrap(p["desc"], 52)[:3]):
        out.append(f'<text x="24" y="{106 + j * 22}" class="sans mute" font-size="15">{esc(line)}</text>')

    x, cw = 24, 13 * MONO_W
    for value, label in p["chips"]:
        cw_total = round(20 + (len(value) + 1 + len(label)) * cw)
        out.append(f'<rect x="{x}" y="160" width="{cw_total}" height="28" rx="7" class="chip"/>')
        out.append(f'<text x="{x + 10}" y="179" class="mono" font-size="13"><tspan class="acc" font-weight="700">{esc(value)}</tspan>'
                   f'<tspan class="mute"> {esc(label)}</tspan></text>')
        x += cw_total + 8

    out.append(f'<text x="24" y="214" class="mono dim" font-size="12">{esc(p["tech"])}</text>')
    if p.get("link"):
        out.append(f'<text x="{w - 24}" y="215" text-anchor="end" class="mono acc" font-size="15">↗</text>')
    return svg(w, h, "".join(out), f'{p["title"]}: {p["desc"]}')


# ---------------------------------------------------------------- log

LOG = [
    ("2026", "role", "Applied AI Fellow · AdMesh", "Built the decision-engine UI for AdPlex, an AI ad decision engine. New York, remote."),
    ("2026", "award", "Smart India Hackathon · top 50", "QubitX, for NTRO's cryptographic discovery problem statement."),
    ("2026", "award", "Cognizant Technoverse · top 1,000 of 4,000+ teams", "The only team shortlisted from GITAM."),
    ("2025", "role", "Software Engineer Intern · 99 Yards", "React and Next.js for a fashion-tech platform. New York, remote."),
    ("2025", "award", "Smart India Hackathon · top 35", "Blockchain traceability for Ayurveda supply chains."),
    ("2024", "role", "President · GitHub Community GITAM", "Led a 28-person team, ran a 2,500-student tech fest, won Best Technical Club."),
]


def log():
    w, top, row = 960, 30, 66
    h = top + len(LOG) * row + 4
    out = [f'<rect x="1" y="1" width="{w - 2}" height="{h - 2}" rx="14" class="card" stroke-width="1.5"/>',
           f'<path d="M112 {top + 15}V{top + (len(LOG) - 1) * row + 15}" class="ln" stroke-width="2"/>']
    for i, (year, kind, title, detail) in enumerate(LOG):
        y = top + i * row
        out.append(f'<text x="32" y="{y + 20}" class="mono acc" font-size="13" font-weight="700" letter-spacing="1">{year}</text>')
        if kind == "role":
            out.append(f'<circle cx="112" cy="{y + 15}" r="6" class="acc"/>')
        else:
            out.append(f'<circle cx="112" cy="{y + 15}" r="5.5" style="fill:var(--card);stroke:var(--acc)" stroke-width="2"/>')
        out.append(f'<text x="140" y="{y + 20}" class="sans fg" font-size="16" font-weight="600">{esc(title)}</text>')
        out.append(f'<text x="140" y="{y + 43}" class="sans mute" font-size="14">{esc(detail)}</text>')
    return svg(w, h, "".join(out), "Log: " + "; ".join(f"{y} {t}" for y, _, t, _ in LOG))


# ---------------------------------------------------------------- stack

STACK = [
    ("languages", ["typescript", "python", "javascript", "sql"]),
    ("frontend", ["react", "next.js", "tailwind"]),
    ("backend", ["node.js", "express", "fastapi", "websockets"]),
    ("data", ["postgresql", "mongodb", "supabase", "prisma", "redis"]),
    ("ml", ["pytorch", "tensorflow", "scikit-learn", "langchain", "faiss"]),
    ("infra", ["docker", "aws", "vercel", "linux", "esp32"]),
]


def stack():
    t = TERM
    w, step, fs = 960, 30, 15
    h = 30 + 28 + (len(STACK) + 1) * step + 22
    out = [terminal_frame(1, 1, w - 2, h - 2, "stack.toml")]
    y = 30 + 40
    out.append(f'<text x="32" y="{y}" font-family="{MONO}" font-size="{fs}" fill="{t["acc"]}">[stack]</text>')
    for key, values in STACK:
        y += step
        vals = f'<tspan fill="{t["dim"]}">, </tspan>'.join(f'<tspan fill="{t["str"]}">"{esc(v)}"</tspan>' for v in values)
        out.append(f'<text x="32" y="{y}" font-family="{MONO}" font-size="{fs}" fill="{t["key"]}">{key}</text>')
        out.append(f'<text x="{32 + 10 * fs * MONO_W:.0f}" y="{y}" font-family="{MONO}" font-size="{fs}" fill="{t["dim"]}">=</text>')
        out.append(f'<text x="{32 + 12 * fs * MONO_W:.0f}" y="{y}" font-family="{MONO}" font-size="{fs}">'
                   f'<tspan fill="{t["dim"]}">[</tspan>{vals}<tspan fill="{t["dim"]}">]</tspan></text>')
    return svg(w, h, "".join(out), "Stack: " + "; ".join(f"{k}: {', '.join(v)}" for k, v in STACK))


# ---------------------------------------------------------------- footer

def footer():
    nodes = [(150, -1, 60), (330, 1, 70), (520, -1, 40), (700, 1, 90), (880, -1, 50), (1040, 1, 60)]
    branches = "".join(f"M{x} 30v{14 * d}h{l}" for x, d, l in nodes)
    vias = "".join(f'<circle cx="{x}" cy="30" r="4"/><circle cx="{x + l}" cy="{30 + 14 * d}" r="3"/>' for x, d, l in nodes)
    body = (f'<defs><path id="bus" d="M0 30h1200"/></defs>'
            f'<path d="M0 30h1200{branches}" class="ln" stroke-width="2"/>'
            f'<g style="fill:var(--bg);stroke:var(--dim)" stroke-width="2">{vias}</g>'
            '<circle r="4" class="acc"><animateMotion dur="6s" repeatCount="indefinite"><mpath xlink:href="#bus"/></animateMotion></circle>'
            '<circle r="3" class="acc" opacity=".6"><animateMotion dur="6s" begin="-3s" repeatCount="indefinite"><mpath xlink:href="#bus"/></animateMotion></circle>')
    return svg(1200, 60, body, "")


def main():
    files = {"header.svg": header(), "numbers.svg": numbers(), "log.svg": log(), "stack.svg": stack(), "footer.svg": footer()}
    files |= {f"link-{l}.svg": link_button(l) for l in LINKS}
    files |= {f"section-{k}.svg": section(*v) for k, v in SECTIONS.items()}
    files |= {f"card-{p['id']}.svg": card(i, p) for i, p in enumerate(PROJECTS, 1)}
    for name, text in files.items():
        (OUT / name).write_text(text, encoding="utf-8", newline="\n")
    print(f"wrote {len(files)} files to {OUT}")


if __name__ == "__main__":
    main()
