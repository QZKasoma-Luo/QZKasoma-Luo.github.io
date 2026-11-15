# Two design directions

Both prototypes use the same provisional content so the comparison is about visual
language, not copy. Final copy will come from `Qingze_Luo_Resume_public.pdf` and will be
fact-checked.

## A — “Field Notes” (light, editorial)

- Warm paper, dark green ink, vermilion accent; serif display type (Newsreader) with a
  sans body (Public Sans) and mono labels.
- Reads like a printed research dossier: generous margins, numbered sections, ruled rows.
- Glass is used on the floating nav and the dossier header only; the dossier body is solid.
- Strengths: calm, academic, very legible; works well for privacy/IT-audit reviewers.
- Risk: less overtly “cybersecurity”, more editorial.

Files: `design/a/index.html` · `docs/design/direction-a-desktop.png` · `docs/design/direction-a-mobile.png`

## B — “Signal Room” (dark, technical)

- Near-black field with a faint grid, lime signal accent, cyan glow; grotesk display
  (Space Grotesk) with IBM Plex body/mono.
- A radar/monogram panel (original QL mark) anchors the hero; work is a bento of
  research / group project / tooling / industry cards.
- Glass on the nav, radar frame, and two card headers; card bodies stay solid.
- Strengths: immediately reads security/engineering; strong contrast and personality.
- Risk: darker and more “product” than academic; needs careful light-mode translation.

Files: `design/b/index.html` · `docs/design/direction-b-desktop.png` · `docs/design/direction-b-mobile.png`

Both were checked in Chromium (blur + SVG refraction layer), WebKit (blur, `-webkit-`
prefix), and Firefox (solid fallback). The CSS/JS glass stack is described in
`docs/TECH.md`.
