# Project tech note — Qingze Luo personal site

**Status:** Live at <https://qzkasoma-luo.github.io> in English, Simplified Chinese, and
Japanese. Résumé-backed content, the 2023 course notes, the design pass, and the QA gates
are in place. Deployed through GitHub Actions → GitHub Pages.
**Owner:** Qingze Luo. **Implemented by:** 秧秧 (Yangyang) for this rebuild.

## 0. What is built (2026-11-15)

- Astro 7.4.12 static site, content collections, RSS, sitemap, 404.
- Home page with About / Research / Projects / Experience / Résumé / Blog / Contact.
- Project and research detail routes generated from Markdown.
- Three-layer glass system, JS detection, reduced-transparency/contrast fallbacks.
- Original “QL signal lock” opening animation, 1.78 s, skippable; plays on a fresh entry and on refresh, but not when navigating between internal pages.
- Four legacy course-note posts migrated and published with a “Course notes” label; RAG demo entry is public as “In progress”.
- Self-hosted fonts, OG card, 2023 pig-avatar favicon and profile, robots.txt.
- Local QA scripts: `npm run check`, `npm run test:intro`, `npm run qa:browsers`,
  `npm run qa:pages`, `npm run check:links`, `npm run check:private`, `scripts/axe.mjs`,
  `scripts/record-intro.mjs`.
- Lighthouse: mobile 99 / 100 / 100 / 100; desktop 87 / 100 / 100 / 100 (the 1.78 s
  opening affects desktop Speed Index; page-only is 94). Localized pages match.
- Opening animation videos: `docs/media/opening-desktop.webm`,
  `docs/media/opening-mobile.webm`.
- GitHub Actions workflow builds and deploys; Pages source is GitHub Actions.

Public content is checked against the public résumé or direct owner confirmation.
Draft-only entries (the DP paper and the IoUT project) are excluded from production;
`INCLUDE_DRAFTS=1 npm run build` is for local visual QA only.

## 1. Isolation and paths

This work lives **only** in:

```
~/projects/qz-homepage
```

It is a separate clone of `QZKasoma-Luo/QZKasoma-Luo.github.io`. Do not mix it with:

- `~/pigy_AI` and `~/pigy_AI-wt` (deploy key `github_app`, different repository)
- `~/projects/liuxi` (姐姐的工作)
- `~/agents/suisui`, `~/agents/qingxiao` (other agents' workspaces)

The old site is preserved three ways:

1. `main` at `3ca8d97` — untouched.
2. Annotated local tag `legacy-site-2023` — not pushed yet.
3. `docs/legacy-inventory.md` — human-readable inventory.

New work happens on branch **`rebuild-2026`**. Nothing is pushed without an explicit OK.

## 2. Remote access

Read access today: public HTTPS clone.

For write access, a **dedicated** ed25519 deploy key was generated:

- Private key: `~/.ssh/qz_homepage_deploy` (never commit; never share)
- Public key: `~/.ssh/qz_homepage_deploy.pub`
- SSH alias: `github-qz-homepage` (see `~/.ssh/config`)
- Fingerprint: `SHA256:+C4PAbGRDgyNzZJJ1Q7iFRPy4U0FMv7mjGvhIJ54TJw`

Brother needs to add the public key at:
`Repository → Settings → Deploy keys → Add deploy key` and tick **Allow write access**.

Once added, use:

```bash
git remote set-url origin git@github-qz-homepage:QZKasoma-Luo/QZKasoma-Luo.github.io.git
```

Do not reuse `github_app` (it is scoped to `pigy_AI`). Do not add this key to a user account.

## 3. Stack

**Astro** (static output) with:

- Markdown + YAML content collections for projects, research, experience, and blog posts.
- Hand-written CSS (design tokens, no utility framework) for the glass system and typography.
- Self-hosted WOFF2 fonts (no Google Fonts runtime request, no SF Pro).
- Zero client-side framework JS; only small progressive-enhancement scripts.
- `@astrojs/sitemap`, RSS for the blog, canonical URLs, Open Graph metadata.
- No analytics, no cookies, no third-party embeds.

Why Astro: static HTML by default, first-class content collections, image optimization,
and a clean path to GitHub Pages. Alternative considered: Eleventy (simpler but more glue
code for images/RSS) and Hugo (fast but Go templates are less comfortable to maintain here).

## 4. Content model (goal)

Adding a project or paper should mean adding one file, not editing layout:

```
src/data/site.yaml                 # name, links, status, focus areas
src/content/projects/<slug>.md     # frontmatter: title, year, kind, tags, links, order
src/content/research/<slug>.md     # frontmatter: title, venue, status, authors, links
src/content/experience/*.yaml      # role, org, dates, bullets
src/content/blog/<slug>.md         # title, date, description, tags, draft
public/Qingze_Luo_Resume.pdf       # the public résumé
```

Rules:

- `kind: group` must render a visible “Group project” label.
- `deployed: false` must render “Internal prototype · not deployed”, never “deployed”.
- Research records must not claim authorship or venue unless confirmed in the résumé.
- The Neo4j lab is **not** presented as original work. If mentioned at all, it is labelled
  “course lab”, and only after confirmation.

## 5. Liquid glass — three layers

Applied only to **outer frames**: nav bar, card headers, buttons. Body copy stays on solid
surfaces. At most 3–4 glass surfaces visible at once on a phone screen.

1. **Base (every browser):** opaque/semi-opaque solid background, 1px border, clear text.
2. **Blur (Safari + Chromium + any browser that really supports it):**
   `backdrop-filter: blur(...) saturate(...)` plus `-webkit-backdrop-filter` for Safari.
   Enabled by JS feature detection:
   `CSS.supports('backdrop-filter','blur(1px)') || CSS.supports('-webkit-backdrop-filter','blur(1px)')`.
   **Do not use `@supports`** — Firefox reports support it does not actually provide.
3. **Refraction (Chromium/Edge only):** an SVG `feTurbulence` + `feDisplacementMap` rim /
   highlight layer, enabled by JS browser detection. If the SVG filter is unavailable, the
   blur layer remains; no layout or contrast regression.

Rules:

- Never animate blur radius. Animate opacity/transform only (and keep it subtle).
- `prefers-reduced-transparency: reduce` → solid background, no backdrop filter, stronger border.
- `prefers-contrast: more` → solid background, darker/stronger border, no sheen.
- Text contrast target: WCAG AA (4.5:1 body, 3:1 large). Test glass over the busiest background.
- No Apple icons/assets, no SF Pro.

## 6. Opening animation

- ≤ 2 seconds, overlay only (HTML content loads normally underneath; no content blocked).
- Plays only on first visit (`localStorage`), once.
- Click / any key skips.
- `prefers-reduced-motion: reduce` → not played at all.
- Original design: “Q / L” line-drawing + signal-lock, inspired by the rhythm of the reference
  clip, not copied code/assets. No DeepSeek whale.
- No layout shift, no blocking of LCP; Lighthouse must stay 90+.

## 7. Testing and release gates

- Playwright screenshots in **Chromium, WebKit, Firefox** at desktop + iPhone widths.
- Check the glass stack in WebKit (Safari rendering) and Firefox (solid fallback).
- Lighthouse (mobile + desktop) ≥ 90 for Performance, Accessibility, Best Practices, SEO.
- Dead-link scan (internal + external), `html` validation, axe accessibility scan.
- Sensitive-data scan: phone, email, address, DOB, student ID, passport/visa, private keys.
- Manual phone check via local server on the LAN.
- Push only after brother says OK. Same for pushing `legacy-site-2023`.

## 8. Deployment

GitHub Actions → GitHub Pages. The workflow will build Astro and publish `dist/`.

Pages source is set to **GitHub Actions** (2026-11-15). The legacy Jekyll builder is no
longer triggered. The deploy key is independent of the Pages setting; it is only for
`git push`.

## 9. Commands (once scaffolded)

```bash
cd ~/projects/qz-homepage
npm install
npm run dev        # local preview
npm run build      # static build into dist/
npm run preview    # preview the production build
node design/shoot.mjs  # design screenshots (current phase)
```

## 10. Current decisions / open items

See `docs/open-questions.md`. The design direction, résumé, LinkedIn URL, animation
reference, blog migration, Pages setting, and deployment are settled. Remaining content
questions are CUDA team details, the DP paper’s authorship/venue, and RAG demo details.

## 11. Three-language build

English at `/` is the source of truth. The site is built in three static locales:

- English: `/`
- Simplified Chinese: `/zh/`
- Japanese: `/ja/`

`scripts/i18n-build.mjs` runs after `astro build`:

1. Parses every generated English HTML page with Cheerio.
2. Collects visible text blocks and `alt` / `title` / `aria-label` / meta values.
3. Translates only missing strings through the DeepSeek chat API using a fixed glossary
   and tone guide; every translation is cached in `src/i18n/cache/{zh,ja}.json`.
4. Writes localized HTML under `dist/zh/` and `dist/ja/`, rewrites internal links,
   preserves the current page in the language switcher, adds `hreflang` / canonical /
   `og:locale`, and generates localized RSS feeds.
5. Appends the localized URLs to `dist/sitemap-0.xml`.

The switcher labels each language in its own name (English / 中文 / 日本語) with a flat,
inline-SVG flag; the labels are intentionally not translated. A language switch is a full
navigation between those static documents.
`components/LocaleScroll.astro` records the section under the viewport top and its offset
before the switch, restores it on the next page (hidden until applied so the top never
flashes), and is covered by `npm run test:locale`.

The cache is committed. CI runs `npm run i18n:offline`, which rebuilds locales without an
API key and fails if a new English string has no cached translation. Local runs use
`npm run i18n` (key from `DEEPSEEK_API_KEY` or the local DSH credentials file). No API key
is exposed to the browser or committed.

When adding or editing English content, run `npm run build && npm run i18n`, check the
affected `/zh/` and `/ja/` pages, and commit the updated cache.
