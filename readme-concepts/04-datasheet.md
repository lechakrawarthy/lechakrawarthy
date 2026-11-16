<!-- Words, art and layout by @lechakrawarthy · CC BY-NC-SA 4.0, see LICENSE -->

<a href="https://lechakrawarthy.tech"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/ds/header-dark.svg"><img src="./assets/ds/header-light.svg" width="100%" alt="LEC27, Full-Stack and ML Engineer with Hardware I/O. A 16-pin chip whose pins are TypeScript, React, Next.js, Node, FastAPI, Postgres, Supabase, Docker, Python, PyTorch, TensorFlow, LangChain, ESP32 and MQTT."></picture></a>

<table>
<tr>
<td width="50%" valign="top">

<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/ds/s1-dark.svg"><img src="./assets/ds/s1-light.svg" width="100%" alt="1 Features"></picture>

- Ships to strangers: **1,700+ installs** of [vazr](https://github.com/lechakrawarthy/vazr) on npm
- Holds up live: **1,600+ people**, one event, one take
- Full stack, from schema to UI
- Models that show their evidence, not just a score
- Hardware I/O: ESP32 firmware talking MQTT

</td>
<td width="50%" valign="top">

<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/ds/s2-dark.svg"><img src="./assets/ds/s2-light.svg" width="100%" alt="2 Applications"></picture>

- Developer tools and CLIs
- AI products people have to trust
- Web apps with real users on day one
- Connected devices
- Anything with a hard deadline

</td>
</tr>
</table>

<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/ds/s3-dark.svg"><img src="./assets/ds/s3-light.svg" width="100%" alt="3 Description"></picture>

The LEC27 is a general-purpose engineer, assembled in Hyderabad and currently operating in Bengaluru as a CS (AI & ML) student at GITAM. It takes an idea from schema to shipped interface, trains the model when the problem needs one, and lately writes the firmware the app talks to. Performs best when the users are real.

<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/ds/s4-dark.svg"><img src="./assets/ds/s4-light.svg" width="100%" alt="4 Specifications"></picture>

**4.1 &nbsp;Absolute maximum ratings**

| Parameter | Where it's enforced | Max |
|:--|:--|--:|
| Files deleted without a preview | vazr | `0` |
| Findings reported without evidence | QubitX | `0` |
| Retakes at a live event | hackathon issue desk | `0` |

<sub>Operation beyond these ratings is not supported.</sub>

**4.2 &nbsp;Electrical characteristics**

| Parameter | Test conditions | Value | Unit |
|:--|:--|--:|:--|
| Installs | vazr on npm, all versions, live | <a href="https://www.npmjs.com/package/@lechakrawarthy/vazr"><img src="https://img.shields.io/npm/dt/@lechakrawarthy/vazr?style=flat-square&label=&color=f78166" alt="live npm installs" align="center"/></a> | installs |
| Participants served | hackathon issue desk, single live event | `1,600+` | people |
| Teams on platform | same event | `278` | teams |
| API surface | Twinance, 14 modules, 11-table schema | `61` | endpoints |
| Automated tests | Twinance, Jest and Supertest | `110+` | tests |
| Macro ROC-AUC | DDoS-LSTM, 7 attack classes, 40K held out | `0.97` | |
| Flows processed | CIC-DDoS2019, reduced to a 272K training set | `10.8M` | flows |
| Team led | GitHub Community GITAM | `28` | people |

<sub>Every value is measured on shipped or published work. Sources in section 5.</sub>

<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/ds/s5-dark.svg"><img src="./assets/ds/s5-light.svg" width="100%" alt="5 Typical applications"></picture>

<table>
<tr>
<td width="52%" valign="top">

**5.1 &nbsp;[vazr](https://github.com/lechakrawarthy/vazr)** &nbsp;<sub>`ACTIVE`</sub>

Finds the `node_modules`, build caches and old downloads eating your disk, and shows you all of it before deleting anything. Trash by default, dry run built in. An outside contributor wrote the Spanish docs.

<sub>EVALUATION MODULE</sub>

```sh
npx @lechakrawarthy/vazr@latest
```

<sub>`Node.js` · `zero-dependency TUI` · `Windows / macOS / Linux`</sub>

</td>
<td width="48%" valign="top">

<a href="https://github.com/lechakrawarthy/vazr"><img src="https://raw.githubusercontent.com/lechakrawarthy/vazr/main/vazr_preview.jpeg" width="100%" alt="vazr terminal UI"/></a>
<sub>Figure 5-1. vazr scanning a dev machine</sub>

</td>
</tr>
</table>

<table>
<tr>
<td width="50%" valign="top">

**5.2 &nbsp;[hackathon issue desk](https://sihsupport.vercel.app)** &nbsp;<sub>`SHIPPED`</sub>

QR issue intake and three-tier role-based triage for a live hackathon.

<a href="https://sihsupport.vercel.app"><img src="./assets/shot-desk.jpg" width="100%" alt="issue desk live site"/></a>
<sub>Figure 5-2. Production build</sub>

<sub>`Next.js` · `Supabase` · `JWT`</sub>

</td>
<td width="50%" valign="top">

**5.3 &nbsp;[twinance](https://twinance.vercel.app)** &nbsp;<sub>`IN DEVELOPMENT`</sub>

Personal finance with an AI co-pilot that reads your last 90 days of transactions before it answers.

<a href="https://twinance.vercel.app"><img src="./assets/shot-twinance.jpg" width="100%" alt="twinance live site"/></a>
<sub>Figure 5-3. Dashboard</sub>

<sub>`React` · `Node.js` · `PostgreSQL` · `Prisma`</sub>

</td>
</tr>
<tr>
<td width="50%" valign="top">

**5.4 &nbsp;qubitx** &nbsp;<sub>`SIH 2026 · TOP 50`</sub>

Finds every key, cipher and certificate in a codebase without running it, and keeps the evidence for each finding.

<sub>`Python` · `FastAPI` · `tree-sitter`</sub>

</td>
<td width="50%" valign="top">

**5.5 &nbsp;[ddos-lstm](https://github.com/lechakrawarthy/DDOS_LSTM)** &nbsp;<sub>`PUBLISHED`</sub>

Classifies seven kinds of attack traffic from network flows, with live packet capture for inference.

<sub>`TensorFlow` · `LSTM` · `PyShark`</sub>

</td>
</tr>
<tr>
<td colspan="2" valign="top">

**5.6 &nbsp;veridose** &nbsp;<sub>`PRODUCT PREVIEW`</sub>

A pill dispenser that has to be right every time, from the firmware to the phone in a caregiver's hand. Capstone, in development.

<sub>`ESP32` · `MQTT` · `TypeScript` · `Expo`</sub>

</td>
</tr>
</table>

<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/ds/s6-dark.svg"><img src="./assets/ds/s6-light.svg" width="100%" alt="6 Revision history"></picture>

| Date | Rev | Changes |
|:--|:--|:--|
| 2026 | F | Applied AI Fellow at [AdMesh](https://admesh.co), New York (remote). Built 12 React components for the AdPlex decision-engine UI. |
| 2026 | E | Smart India Hackathon top 50. Cognizant Technoverse top 1,000 of 4,000+ teams, the only team from GITAM. |
| 2025 | D | SWE intern at 99 Yards, New York (remote). React and Next.js for a fashion-tech platform. |
| 2025 | C | Smart India Hackathon top 35. |
| 2024 | B | President, [GitHub Community GITAM](https://github.com/github-community-gitam). 28-person team, a 2,500-student tech fest, Best Technical Club. |
| 2023 | A | Initial release. B.Tech CS (AI & ML), GITAM. |

<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/ds/s7-dark.svg"><img src="./assets/ds/s7-light.svg" width="100%" alt="7 Support resources"></picture>

[<kbd>&nbsp;lechakrawarthy.tech&nbsp;</kbd>](https://lechakrawarthy.tech) &nbsp;[<kbd>&nbsp;LinkedIn&nbsp;</kbd>](https://linkedin.com/in/lechakrawarthy) &nbsp;[<kbd>&nbsp;npm&nbsp;</kbd>](https://www.npmjs.com/~lechakrawarthy) &nbsp;[<kbd>&nbsp;email&nbsp;</kbd>](mailto:chakravarthi1597@gmail.com)

<sub>"After all this time?" "Always."</sub>

<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/ds/footer-dark.svg"><img src="./assets/ds/footer-light.svg" width="100%" alt=""></picture>
