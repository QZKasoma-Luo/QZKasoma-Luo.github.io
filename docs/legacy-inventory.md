# Legacy site inventory — qzkasoma-luo.github.io

Backup taken **2026-11-14** before the rebuild.

| Item | Value |
| --- | --- |
| Repository | `QZKasoma-Luo/QZKasoma-Luo.github.io` (public) |
| Default branch | `main` |
| Last content commit | `3ca8d97` — “Site updated: 2023-10-23 23:18:49” |
| Last push to GitHub | 2023-10-24 |
| Generator | Hexo 6.3.0, theme by Haojen |
| Backup tag | `legacy-site-2023` (annotated, **local only — not pushed yet**) |
| CNAME file | **None.** The site is served from the default `qzkasoma-luo.github.io` domain. |
| Custom domain | None configured in the repository. |

## Pages

| Path | Content |
| --- | --- |
| `/` | Post list (4 posts), search box, cover images |
| `/about/` | Short bio: “junior undergraduate at UVic”, AI career goal, Tokyo dream |
| `/archives/` | Archive index, September + October 2023 |
| `/WkExperience/` | “Intership-Experience” (typo in nav) — Nicholson Manufacturing + Flex |
| `/DQZR/Resume_2023.pdf` | 2-page résumé from 2023 (superseded by the new PDF) |

## Blog posts (4)

| Date | Title | Topic |
| --- | --- | --- |
| 2023-09-15 | DAGs and Topological Sorting | Course notes, algorithms |
| 2023-09-25 | Transitive Closure and Floyd-Warshall's Algorithm | Course notes, algorithms |
| 2023-09-28 | Human-Computer-Interaction Summary 1 | Course notes, HCI |
| 2023-10-06 | Minimum Spanning Tree | Course notes, algorithms |

These are study notes, not personal essays. Decision needed: migrate them into the new
blog (with a “Course notes” label) or start the blog fresh.

## Assets

The original legacy image files were removed from the current branch on 2026-11-16 to save
checkout space; they remain in the local `legacy-site-2023` tag. The legacy HTML, CSS and
text files are kept.

- Removed: the legacy JPEG covers (`images/IMG_*.jpeg`, `Morning.jpeg`, `Victoria.jpeg`,
  `Selfie.jpg`), `about/about.png`, `WkExperience/about.png`, `css/images/banner.jpg`, and
  `images/favicon.ico`.
- Bulma CSS, Hexo theme CSS, jQuery, Fancybox, highlight.js.
- `atom.xml`, `search.xml`.
- Total repository size at backup time: ~25 MB.

## Privacy / tracking check

- Google Analytics and Baidu Analytics blocks are present but **commented out**; no tracking
  script is active.
- No phone number, email address, street address, date of birth, student number, passport or
  visa information found in the published HTML.
- Old site sets `maximum-scale=1.0, user-scalable=no` — blocks pinch-zoom. This is an
  accessibility defect and will not be carried over.

## What is worth keeping

1. The two work-experience entries (Nicholson Manufacturing, Flex) — but the wording must match
   the new résumé, and the Flex bullet about “gathered reporting requirements from production
   supervisors” needs to be rewritten, not copied.
2. The four course-note posts, if the brother wants a writing archive.
3. Nothing visual: the theme, layout, and résumé are all being replaced.

## What is intentionally not carried over

- The 2023 résumé (a new public PDF will replace it).
- The “junior / AI career / Tokyo” bio (out of date and not aligned with the 2027 co-op focus).
- Fancybox/jQuery and the old theme assets.
- The `WkExperience` typo and the “intership-experience” nav label.
