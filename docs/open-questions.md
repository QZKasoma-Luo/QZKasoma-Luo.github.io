# Open questions for 哥哥

**Update 2026-11-14:** the Astro foundation, content model, glass system, and an original
2-second opening animation are built and passing local checks. The blockers below are now
mostly about final copy and visual direction.

Items are ordered by how much they block the build. Questions that the new résumé will
answer are marked “résumé”.

## Blocking now

1. **Design direction** — A (warm editorial, light-first) or B (dark signal-room,
   technical)? Or a mix: A's typography with B's hero? Screenshots: `docs/design/`.
2. **Résumé PDF** — `Qingze_Luo_Resume_public.pdf` is not in this session's files yet.
   Brother said it comes next round. It is the source of truth for education, dates,
   experience bullets, and publications.
3. **Animation reference** — the forwarded “DeepSeek Harness style” clip is still not on
   disk. An original 2-second “Q / L signal-lock” is already built, tested, and recorded
   (`docs/media/`). If the reference is resent, it can be used only to tune rhythm/style;
   no code or assets will be copied.
4. **LinkedIn URL** — old résumé says `linkedin.com/in/qingze/`. Still correct?
   (Contact section will only show GitHub + LinkedIn.)

## Content accuracy (most answered by the résumé)

5. **Research / publications** — for the differential-privacy paper:
   exact title, author order, venue (the repo mentions a CCECE version and an arXiv
   version), status (published / under review / preprint), and whether a public link is OK.
   Is the IoT/IoUT validation framework also a paper, a research assistantship, or a course
   project? What was my role and who else worked on it?
6. **CUDA k-NN** — group project: how many people, what did I personally build, and is
   96.65% the group's reported baseline? The site will label it “Group project”.
7. **RAG demo** — what does it retrieve, what stack, and is there a public repo? It will be
   marked “In progress” with no deployment claim.
8. **Flex dashboard** — the new résumé bullet starting “Gathered reporting requirements from
   production supervisors…” will be rewritten. What actually happened: who did I talk to,
   what did I build, and was it used by anyone internally? No “deployed” claim.
9. **Neo4j security-incident lab** — confirmed: not my design. Default plan is to leave it
   off the site entirely. If brother wants it as a “course lab”, it will be labelled exactly
   that, with no ownership claim.
10. **Education** — exact degree name, expected graduation, and whether the UVic co-op
    program is part of the degree. The résumé will confirm; do not want to guess.

## Writing / structure

11. **Old blog posts** — migrate the four 2023 course notes (DAGs, Floyd–Warshall, HCI,
    MST) into the new blog under a “Course notes” label, or start fresh? Migrating keeps
    the archive alive; starting fresh makes the blog look more current.
12. **Blog voice** — “碎碎念和分享想法” in English. Any topics to avoid? Default: privacy,
    systems, coursework, co-op search, notes on papers. No personal identifying details.
13. **Name display** — “Qingze Luo” throughout. Any preferred short form or pronunciation
    to include? (Not required.)

## Operations

14. **Deploy key** — add `~/.ssh/qz_homepage_deploy.pub` to the homepage repo as a deploy key
    with write access. It is not added yet: `ssh -T git@github-qz-homepage` still returns
    `Permission denied (publickey)`. Public key is in the stage report.
15. **Pages setting** — when we switch to Actions, change Settings → Pages → Source to
    “GitHub Actions”. I will remind brother at that step.
16. **Push approval** — the backup tag `legacy-site-2023` is local only. Pushing it is a
    separate “yes” from pushing the new site.
