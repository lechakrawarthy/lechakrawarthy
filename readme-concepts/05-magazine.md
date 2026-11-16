<!-- Words, art and layout by @lechakrawarthy · CC BY-NC-SA 4.0, see LICENSE -->

<a href="https://lechakrawarthy.tech"><img src="./assets/mag/cover.svg" width="100%" alt="CHAKRAWARTHY, issue 27, the shipping issue. Cover story: It isn't real until strangers use it."></a>

<br>

<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/mag/contents-dark.svg"><img src="./assets/mag/contents-light.svg" width="100%" alt="In this issue: Contents"></picture>

`01` &nbsp; **[It isn't real until strangers use it](#cover-story)** &nbsp;<sub>COVER STORY · VAZR</sub><br>
`02` &nbsp; **[1,600 people, one event, no second take](#desk)** &nbsp;<sub>FEATURE · THE ISSUE DESK</sub><br>
`03` &nbsp; **[The co-pilot that reads your last 90 days](#twinance)** &nbsp;<sub>FEATURE · TWINANCE</sub><br>
`04` &nbsp; **[Keys, ciphers and seven kinds of attack](#short-reads)** &nbsp;<sub>SHORT READS · QUBITX, DDOS-LSTM</sub><br>
`05` &nbsp; **[Where the work happened](#the-record)** &nbsp;<sub>THE RECORD</sub><br>
`06` &nbsp; **[Write to the editor](#letters)** &nbsp;<sub>LETTERS</sub>

<br>

<a name="cover-story"></a>
<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/mag/cover-dark.svg"><img src="./assets/mag/cover-light.svg" width="100%" alt="Cover story: It isn't real until strangers use it"></picture>

*Writing a disk cleaner is the easy part. Shipping it to people you will never meet changes the job.*

**[vazr](https://github.com/lechakrawarthy/vazr)** hunts down the `node_modules`, build caches and old downloads that quietly eat a developer's disk. On one laptop, that's a script. On npm, it's a promise to strangers.

A stranger's machine could be Windows, macOS or Linux, so vazr runs on all three, with its own terminal UI and zero framework dependencies. A stranger's files are not yours to gamble with, so nothing is deleted before it's shown: removals go to the system trash by default, and a dry run is built in. And strangers open issues, so that's where the roadmap came from.

More than 1,700 installs later, someone the author has never met translated the docs into Spanish. That counts for more than the download number.

<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/mag/quote-dark.svg"><img src="./assets/mag/quote-light.svg" width="100%" alt="A tool that deletes things should show you everything before it touches a single file. On designing vazr."></picture>

<table>
<tr>
<td width="44%" valign="top">

<sub>**TRY IT, ANY OS**</sub>

```sh
npx @lechakrawarthy/vazr@latest
```

<a href="https://www.npmjs.com/package/@lechakrawarthy/vazr"><img src="https://img.shields.io/npm/dt/@lechakrawarthy/vazr?style=flat-square&label=installs&color=e2541a" alt="vazr installs, live"/></a>

<sub>NODE.JS · CUSTOM ANSI TUI · 16 PARALLEL SCANNERS · JSON AND CSV EXPORT</sub>

</td>
<td width="56%" valign="top">

<a href="https://github.com/lechakrawarthy/vazr"><img src="https://raw.githubusercontent.com/lechakrawarthy/vazr/main/vazr_preview.jpeg" width="100%" alt="vazr terminal UI"/></a>
<sub>*vazr, mid-scan.*</sub>

</td>
</tr>
</table>

<br>

<a name="desk"></a>
<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/mag/desk-dark.svg"><img src="./assets/mag/desk-light.svg" width="100%" alt="Feature: 1,600 people, one event, no second take"></picture>

*A hackathon has no staging environment.*

278 teams and more than 1,600 participants needed one place to raise a problem and watch it get solved. **[The issue desk](https://sihsupport.vercel.app)** took issues in by QR code, triaged them through three levels of access, and automated the routine fixes. It was monitored live for the whole event, and what people actually did with it decided what got fixed next.

<a href="https://sihsupport.vercel.app"><img src="./assets/shot-desk.jpg" width="100%" alt="The issue desk, live"/></a>
<sub>*The desk, as participants saw it.* &nbsp; NEXT.JS · TYPESCRIPT · SUPABASE · JWT</sub>

<br>

<a name="twinance"></a>
<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/mag/twinance-dark.svg"><img src="./assets/mag/twinance-light.svg" width="100%" alt="Feature: The co-pilot that reads your last 90 days"></picture>

*Most finance apps show you charts. This one answers your questions, and checks your last 90 days before it does.*

**[Twinance](https://twinance.vercel.app)** is a personal finance platform with an AI co-pilot that reads 90 days of your transactions as context, with a second model standing by as fallback. Underneath: 61 REST endpoints across 14 modules, an 11-table PostgreSQL schema, refresh-token rotation, TOTP two-factor and more than 110 tests. On top: a five-part financial score, and a monthly Wrapped that gives your spending an archetype.

<a href="https://twinance.vercel.app"><img src="./assets/shot-twinance.jpg" width="100%" alt="Twinance landing page"/></a>
<sub>*In development. The landing page is live.* &nbsp; REACT · TYPESCRIPT · NODE.JS · POSTGRESQL · PRISMA</sub>

<br>

<a name="short-reads"></a>
<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/mag/short-dark.svg"><img src="./assets/mag/short-light.svg" width="100%" alt="Short reads: Keys, ciphers and seven kinds of attack"></picture>

<table>
<tr>
<td width="50%" valign="top">

**QubitX**<br>
<sub>TOP 50 · SMART INDIA HACKATHON 2026</sub>

Finds the cryptography hiding in a codebase: RSA and EC keys, AES, hashes, HMAC, TLS and X.509 certificates, across Python, JavaScript, TypeScript and config files. It reads code through AST and tree-sitter parsing and never runs it. Every finding keeps its evidence, and secrets are redacted.

<sub>PYTHON · FASTAPI · TREE-SITTER</sub>

</td>
<td width="50%" valign="top">

**[DDoS-LSTM](https://github.com/lechakrawarthy/DDOS_LSTM)**<br>
<sub>0.97 MACRO ROC-AUC · 7 ATTACK CLASSES</sub>

10.8 million raw network flows, cut to a stratified 272K training set. A two-layer LSTM sorts traffic into seven attack classes, with live inference over captured packets. The honest part: it still mixes up UDP-lag with SYN floods, because their flow features overlap.

<sub>TENSORFLOW · KERAS · PYSHARK</sub>

</td>
</tr>
</table>

<sub>*Next issue:* **Veridose**, the capstone. A medication dispenser and its caregiver app, built to be right every time.</sub>

<br>

<a name="the-record"></a>
<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/mag/record-dark.svg"><img src="./assets/mag/record-light.svg" width="100%" alt="The record: Where the work happened"></picture>

<table>
<tr><td width="18%" valign="top"><sub><b>NOW</b></sub></td><td>B.Tech in Computer Science (AI & ML), GITAM Bengaluru, class of 2027.</td></tr>
<tr><td valign="top"><sub><b>2026</b></sub></td><td><b>Applied AI Fellow, <a href="https://admesh.co">AdMesh</a></b>, New York (remote). Twelve React components for the AdPlex decision-engine UI, and prompt-layer work with the founding team.</td></tr>
<tr><td valign="top"><sub><b>2026</b></sub></td><td>Cognizant Technoverse: top 1,000 of 4,000+ teams, the only team from GITAM. Smart India Hackathon: top 50.</td></tr>
<tr><td valign="top"><sub><b>2025</b></sub></td><td><b>SWE Intern, 99 Yards</b>, New York (remote). React and Next.js for a fashion-tech platform. Smart India Hackathon: top 35.</td></tr>
<tr><td valign="top"><sub><b>2024–25</b></sub></td><td><b>President, <a href="https://github.com/github-community-gitam">GitHub Community GITAM</a></b>. A 28-person team, 7+ workshops, Epoch 3.0 for 2,500+ students, and the Best Technical Club award.</td></tr>
<tr><td valign="top"><sub><b>WORKS IN</b></sub></td><td>TypeScript, React, Next.js, Node, Python, FastAPI, PostgreSQL, PyTorch, TensorFlow, LangChain, Docker, AWS.</td></tr>
</table>

<br>

<a name="letters"></a>
<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/mag/letters-dark.svg"><img src="./assets/mag/letters-light.svg" width="100%" alt="Letters: Write to the editor"></picture>

Hiring, building something, or found a bug in vazr? Every letter gets read.

**[lechakrawarthy.tech](https://lechakrawarthy.tech)** &nbsp;·&nbsp; **[LinkedIn](https://linkedin.com/in/lechakrawarthy)** &nbsp;·&nbsp; **[npm](https://www.npmjs.com/~lechakrawarthy)** &nbsp;·&nbsp; **[chakravarthi1597@gmail.com](mailto:chakravarthi1597@gmail.com)**

<sub>*"After all this time?" "Always."*</sub>

<br>

<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/mag/colophon-dark.svg"><img src="./assets/mag/colophon-light.svg" width="100%" alt="Colophon: written, designed, engineered and shipped by one person."></picture>
