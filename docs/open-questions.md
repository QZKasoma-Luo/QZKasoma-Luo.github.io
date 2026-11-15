# Open questions for 哥哥

**Update 2026-11-15:** the public résumé is on disk, the deploy key works, LinkedIn is
confirmed, design direction A is chosen, and the opening-animation reference has been
reviewed. The site content has been reconciled with the résumé.

## Answered

1. **Design direction** — A, kept editorial; palette and micro-details tuned toward the
   `dsh-startup-screen` reference.
2. **Résumé PDF** — `public/Qingze_Luo_Resume.pdf`; `site.yaml` points to it.
3. **LinkedIn** — `https://www.linkedin.com/in/qingze/`, confirmed from the PDF annotation.
4. **Opening-animation reference** — repository received; style cues only, no copied code or
   assets.
5. **Education** — MASc Electrical and Computer Engineering (Sep 2025 – present) plus BSc
   Computer Science (Sep 2020 – Jun 2025).
6. **Publication** — IEEE Access 2025, DOI `10.1109/ACCESS.2025.3621594`; author order taken
   from the résumé.
7. **Deploy key** — added to the repository; `ssh -T git@github-qz-homepage` succeeds.
8. **Push** — completed 2026-11-15; GitHub Actions deployed successfully. Live site:
   <https://qzkasoma-luo.github.io>.
9. **Blog migration** — the four 2023 course notes are published with a “Course notes” label.
10. **Pages setting** — the owner switched the Pages source to GitHub Actions on 2026-11-15.

## Still open

1. **CUDA group project** — team size and Qingze’s exact individual contribution. The site
   labels it “Group project” and does not attribute the 96.65% result to one person.
2. **DP hierarchical counts** — authorship, author order, venue, and status. The public
   résumé does not list it, so it stays an unpublished draft.
3. **RAG demo** — what it retrieves, the stack, whether there is a public repo, and any
   evaluation. It is currently “In progress” with details intentionally sparse.

## Content guardrails

- No invented metrics, dates, titles, venues, author positions, team sizes, or deployment
  claims.
- Group work stays visibly labelled “Group project”.
- The Flextronics dashboard is “Internal tool — not publicly deployed”.
- No phone, email, street address, date of birth, student number, passport, or visa data.
- Contact section = GitHub + LinkedIn only. No analytics, cookies, or third-party embeds.
