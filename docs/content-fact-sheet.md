# Content fact sheet (internal)

Source hierarchy for the rebuild:

1. `Qingze_Luo_Resume_public.pdf` — the new public résumé, once supplied. **Not on disk yet.**
2. The old 2023 résumé (`DQZR/Resume_2023.pdf`) and the public GitHub repositories.
3. The old Hexo site (`legacy-site-2023` tag).

Nothing below is published until it is marked `verified: true` in the content file.

## Confirmed / low-risk

| Fact | Source | Notes |
| --- | --- | --- |
| Name: Qingze Luo | GitHub profile, old résumé | Display name “Qingze Luo”. |
| GitHub: `QZKasoma-Luo` | GitHub profile | Contact link. |
| LinkedIn: `linkedin.com/in/qingze/` | Old résumé | **Needs confirmation.** |
| BSc Computer Science, University of Victoria | Old résumé, site bio | No graduation date asserted on the site. |
| Based in Victoria, BC, Canada | Old résumé, GitHub | City only; no street address. |
| Open to co-op · January 2027 | Owner brief | Do not add visa/work-authorization details. |
| Focus: security, privacy, IT audit, software development/testing | Owner brief | Used as positioning, not as a credential. |
| Engineering Technician, Flex (Flextronics), Zhuhai, Jan–Jul 2023 | Old résumé | Bullets need professional rewrite. |
| Production Planning Support, Nicholson Manufacturing, Sidney BC, Sep–Dec 2022 | Old résumé | Bullets need professional rewrite. |

## Project facts from GitHub

| Project | Facts | Status / constraints |
| --- | --- | --- |
| CUDA k-NN on MNIST (`CUDA-Written_Number_Classifier`) | CUDA, multi-stream processing, bitonic sort; README reports **96.65%** accuracy before further GPU optimisation. | **Group project.** Do not attribute the team result to one person. |
| DP hierarchical counts (`Matching-Shrinkage-Granularity`) | Study of scalar / level-wise / per-node shrinkage for differentially private hierarchical counts; code, archived draws, results, paper assets; CCECE and arXiv versions mentioned in the README. | **Authorship, author order, venue, and status are unconfirmed.** Currently marked `in-progress` and “no publication claim yet”. |
| IoT / IoUT validation framework (`iot-iout-validation-framework`) | Multi-tier data validation: completeness, duplicates, flow consistency, TCP flags, DDoS patterns, underwater latency/bandwidth; Python/scikit-learn. | Role and team are unconfirmed. |
| Changeover dashboard (`Change-Over-Time-Web-Page`) | Vue.js + ASP.NET + Element UI/ECharts; machine status and changeover time. | **Independent, internal prototype, not deployed.** Never write “deployed”. |
| Neo4j security-incident analysis (`Security-Incident-Analysis-with-a-Graph-Database-Neo4j-Cypher-`) | Repository contains a `graph_ir_minilab` directory. | **Not Qingze’s design.** Omit by default; if ever mentioned, label “course lab” only. |
| RAG demo | Owner says it is still being built. | **In progress**; no repo link, no deployment claim. Details pending. |

## Old blog posts (candidate migration)

| Date | Title | Type |
| --- | --- | --- |
| 2023-09-15 | DAGs and Topological Sorting | Course notes |
| 2023-09-25 | Transitive Closure and Floyd-Warshall’s Algorithm | Course notes |
| 2023-09-28 | Human-Computer-Interaction Summary 1 | Course notes |
| 2023-10-06 | Minimum Spanning Tree | Course notes |

Migration decision is still open. Four drafts have already been generated in
`src/content/blog/` from the legacy HTML (`draft: true`, `courseNotes: true`) so the blog
layout and RSS can be tested. They stay out of production until the owner says to publish
them.

## Wording rules

- Rewrite the résumé sentence “Gathered reporting requirements from production supervisors…” — do not copy it.
- No invented metrics, dates, titles, venues, author positions, team sizes, or deployment claims.
- Group work gets a visible “Group project” label.
- “Internal prototype — not deployed” for the Flex dashboard.
- “In progress” for the RAG demo.
- No phone, email, street address, date of birth, student number, passport, or visa data.
- Contact section = GitHub + LinkedIn only.
- No third-party analytics or tracking.

## Still unknown

- New résumé PDF (education dates, graduation, exact bullets, publications).
- LinkedIn URL confirmation.
- DP paper: authorship, author order, venue, status, public link.
- IoT/IoUT: role, team, whether it is a paper, RA work, or coursework.
- CUDA: team size and Qingze’s individual contribution.
- RAG demo: what it retrieves, stack, public repo.
- Blog migration choice.
- Animation reference clip (optional; original animation already built).
