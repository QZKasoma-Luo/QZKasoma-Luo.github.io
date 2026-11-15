# qzkasoma-luo.github.io

Personal site for **Qingze Luo** — a computer science student at the University of
Victoria, looking for co-op work starting January 2027 across security, privacy, IT audit,
and software development/testing.

Live site: <https://qzkasoma-luo.github.io>

> **Status:** live at <https://qzkasoma-luo.github.io>. Direction A is chosen, the visual
> system is tuned toward the `dsh-startup-screen` reference, and the public résumé PDF is
> in place. Experience, research, and project content follow the résumé; cross-browser,
> Lighthouse, link, privacy, and accessibility checks pass. The blog archive decision is
> the remaining content choice.

## Stack

- [Astro 7](https://astro.build) — static output, no client framework.
- Markdown + YAML content collections.
- Hand-written CSS with design tokens; self-hosted WOFF2 fonts.
- No analytics, cookies, third-party embeds, or tracking pixels.
- Playwright for cross-browser screenshots; Lighthouse for the 90+ gate.
- GitHub Actions → GitHub Pages.

## Run it

```bash
cd ~/projects/qz-homepage
npm install
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
npm run preview    # preview dist/
npm run check      # Astro + TypeScript + content schema check
```

Node 24 is used in CI (`.nvmrc`). Astro 7 needs Node ≥ 22.23.4.

## Quality checks

Serve `dist/` on `http://127.0.0.1:4322/`, then run:

```bash
npm run check
npm run test:intro
npm run qa:browsers       # Chromium, WebKit, Firefox screenshots
npm run qa:pages          # key pages in all three browsers
npm run check:links
npm run check:private
node scripts/axe.mjs      # WCAG A/AA in light and dark
```

Lighthouse is run separately for the homepage (desktop and mobile) and the research,
projects, and blog pages (mobile). Results are summarised in
`docs/media/qa/lighthouse.json`.

## Update content (the normal workflow)

### Site-wide details

Edit `src/data/site.yaml`:

```yaml
site:
  name: Qingze Luo
  availability: Open to co-op · January 2027
  tagline: ...
  focus: [Security, Privacy, IT audit, Software development & testing]
  socials:
    github: https://github.com/QZKasoma-Luo
    linkedin: https://www.linkedin.com/in/qingze/
  resume: /Qingze_Luo_Resume.pdf
```

### Add a project

Create one Markdown file in `src/content/projects/`, for example
`src/content/projects/my-project.md`:

```md
---
title: "Project title"
summary: "One clear sentence for the card and meta description."
year: 2026
kind: group            # research | group | independent | coursework
status: completed      # completed | in-progress
role: "What I personally did"        # optional
team: "Who else worked on it"        # optional
tags: [Python, CUDA]
links:
  repo: https://github.com/QZKasoma-Luo/...
  demo: https://...
deployed: false        # only true if it really is publicly deployed
featured: true
order: 4
draft: false
verified: true         # only after checking the public résumé
---

A few paragraphs. The page is generated automatically.
```

- `kind: group` renders a **Group project** label and a notice. Do not remove it for
  shared work.
- `deployed: false` + `kind: independent` renders **Internal prototype — not deployed**.
- `verified: false` keeps the entry out of production builds. This is deliberate.
- Links are optional; remove ones that do not exist.

### Add a paper / research item

Create `src/content/research/<slug>.md`:

```md
---
title: "Paper title"
summary: "One sentence."
year: 2026
authors: ["Qingze Luo", "..."]
venue: "Venue or preprint server"   # only if confirmed
status: under-review                # published | under-review | preprint | in-progress
tags: [Differential privacy]
links:
  paper: https://...
  doi: https://...
  repo: https://...
featured: true
order: 1
draft: false
verified: true
---
```

Do not set `status: published` or fill in a venue/author order until the owner has confirmed
it against the paper or the résumé.

### Add an experience entry

Create `src/content/experience/<slug>.md`:

```md
---
role: Engineering Technician
org: Flex (Flextronics)
location: Zhuhai, Guangdong, China
start: Jan 2023
end: Jul 2023
current: false
summary: "One line."
bullets:
  - "What I did, in plain language."
order: 1
draft: false
verified: true
---
```

### Add a blog post

Create `src/content/blog/<slug>.md`:

```md
---
title: "Post title"
description: "One sentence for the list and RSS."
date: 2026-11-20
tags: [Privacy, Notes]
courseNotes: false
draft: false
---

Markdown body.
```

`courseNotes: true` adds a “Course notes” label. Old course notes can be migrated with that
label once the owner decides.

### Résumé PDF

1. Put the final public PDF at `public/Qingze_Luo_Resume.pdf`.
2. Set `site.resume: /Qingze_Luo_Resume.pdf` in `src/data/site.yaml`.

Until then, the header and résumé section show a disabled “PDF being updated” state instead
of a dead link.

## Draft vs. verified content

Every content entry has `draft` and `verified` flags:

- `verified: false` → hidden from `npm run build` (production), visible in `npm run dev`.
- `verified: true` + `draft: false` → included in production.
- For local visual QA of unfinished content: `INCLUDE_DRAFTS=1 npm run build`.
  Never set that flag in the deploy workflow.

This exists so an unchecked bullet, date, or number cannot accidentally ship.

## Project layout

```
src/
  components/        Header, Footer, Opening animation
  content/           Markdown entries (projects, research, experience, blog, pages)
  data/site.yaml     site-wide details
  layouts/           BaseLayout
  lib/content.ts     draft/verified filtering
  pages/             home, projects, research, blog, RSS, 404
  styles/global.css  tokens, glass system, typography, prose
public/              fonts, favicon, robots.txt, résumé PDF
docs/                tech notes, legacy inventory, design directions
design/              design prototypes (not shipped)
```

## Liquid glass

Three layers, selected by a small head script (not `@supports`):

1. **Solid** — every browser gets a readable, nearly opaque surface.
2. **Blur** — Safari/Chromium (JS-checked) get `backdrop-filter` + `-webkit-backdrop-filter`.
3. **Refraction** — Chromium/Edge get an SVG-displaced 1px glass rim.

`prefers-reduced-transparency: reduce` and `prefers-contrast: more` force the solid layer
with a stronger border. Blur radius is never animated. Glass is limited to nav bars, card
headers, and buttons; body copy stays on solid surfaces.

## Opening animation

`src/components/Opening.astro` — an original 2-second “QL signal lock” overlay:

- first visit only (`localStorage`), never on `prefers-reduced-motion: reduce`;
- click or any key skips;
- overlay only, content loads underneath; no layout shift;
- no copied code/assets and no DeepSeek whale.

In dev, `?intro=1` replays it. In production the query parameter is ignored.

## Deploy

The workflow is `.github/workflows/deploy.yml`. It builds on pushes to `main` and publishes
`dist/` through GitHub Pages.

**One-time repository setting:** Settings → Pages → Build and deployment → Source =
**GitHub Actions**.

Write access uses the dedicated deploy key (`github-qz-homepage` SSH alias). Never commit the
private key.

## Accuracy and privacy rules

- No invented roles, dates, numbers, results, or publication claims.
- Group work is labelled **Group project**; the CUDA k-NN project is one.
- The Neo4j security-incident lab is not presented as original work; it is omitted or
  labelled “course lab” only after confirmation.
- The Flex changeover dashboard is labelled **independent, internal prototype, not deployed**.
- The RAG demo is labelled **in progress**.
- Do not copy the “Gathered reporting requirements…” résumé sentence; rewrite it accurately.
- No phone, email, street address, date of birth, student number, passport, or visa details.
- Contact = GitHub + LinkedIn only.
- No Google Analytics or any third-party tracking. No cookies.

## Checks

```bash
npm run check          # Astro + TypeScript + content schemas
npm run build
npm run test:intro     # first visit / skip / reduced motion
npm run check:links    # needs a running preview server
npm run check:private  # scans src, public, and dist
npm run qa:browsers    # Chromium, WebKit, Firefox screenshots into docs/media/qa
npx lighthouse http://127.0.0.1:4322/ --preset=desktop
npx lighthouse http://127.0.0.1:4322/
```

For a QA build that includes unverified draft entries:

```bash
INCLUDE_DRAFTS=1 npm run build
npm run preview -- --host 127.0.0.1 --port 4322
```

The current local baseline (with draft content included for QA) is 100 / 100 / 100 / 100
on desktop and mobile. Screenshots and the three-browser check live under `docs/` as the
rebuild progresses.
