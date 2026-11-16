# Content fact sheet (internal)

Source hierarchy for the rebuild:

1. `public/Qingze_Luo_Resume.pdf` — the public résumé supplied 2026-11-14. This is the
   source of truth for education, experience, the publication, projects, certifications,
   and skills.
2. Public GitHub repositories — used only to confirm project scope, links, and dates.
3. The old Hexo site (`legacy-site-2023` tag) — historical context only.

Nothing is published unless it is marked `verified: true` in the content file. The public
résumé and direct owner confirmation are the only two bases for that flag.

## Confirmed from the public résumé

| Fact | Value | Notes |
| --- | --- | --- |
| Name | Qingze Luo | Display name. |
| Location | Victoria, BC, Canada | City only; no street address. |
| GitHub | `https://github.com/QZKasoma-Luo` | Contact link. |
| LinkedIn | `https://www.linkedin.com/in/qingze/` | Confirmed from the PDF annotation. |
| Availability | Open to co-op · January 2027 | Owner brief. |
| Focus | Security, privacy, IT audit, software development & testing | Positioning, not a credential. |
| Education | MASc Electrical and Computer Engineering, University of Victoria, Sep 2025 – present | Current program. |
| Education | BSc Computer Science, University of Victoria, Sep 2020 – Jun 2025 | Completed degree. |
| Certification | CompTIA Security+ | Résumé. |
| Certification | Microsoft Certified: Azure Fundamentals (AZ-900) | Résumé. |
| Skills | Java, Python, HTML/CSS, C, C++/CUDA; Vue.js, ASP.NET, Node.js; MySQL, SQL Server; Azure, GitHub, GitLab, Linux (Ubuntu, Kali) | Résumé. |

## Experience (confirmed)

| Role | Organisation | Dates | Key facts |
| --- | --- | --- | --- |
| Research Assistant | SOLIDS Lab, University of Victoria | Sep 2025 – present | Multi-tiered Python validation framework for IoUT network-traffic datasets: completeness, flow consistency, protocol-flag validation, statistical outlier detection. Deployed BlueOS in Docker for vehicle-software testing without hardware. |
| Teaching Assistant — SENG 321 | University of Victoria | Sep 2025 – Dec 2025 | Guided 40+ students through requirements elicitation, analysis, specification, and validation; led labs; graded use cases, user stories, and system modelling. Liaised with industry mentors and handled team registration/attendance/announcements for one lab section. |
| Engineering Technician | Flextronics, Zhuhai, China | Jan 2023 – Jul 2023 | Built a real-time production dashboard with Vue.js, Element UI, ECharts, and a RESTful ASP.NET back end. Turned reporting needs into requirements with production supervisors. |
| Production Planning Support | Nicholson Manufacturing Ltd., Sidney, BC | Sep 2022 – Dec 2022 | Operated the ERP system for work orders end to end; maintained bills of materials, material-selection records, and project documentation. |

## Research (confirmed)

- M. Gu Kim, Q. Luo, R. P. Singh, N. Kaur Popli and M. Mamun, “Enhancing Underwater Network
  Security: ML-Based Detection and Prediction of DDoS Attacks in IoUT Networks,” *IEEE
  Access*, vol. 13, pp. 190618–190629, 2025.
- DOI: `https://doi.org/10.1109/ACCESS.2025.3621594`
- Site entry: `src/content/research/ieee-access-iout-ddos.md`, `verified: true`.

## Projects

| Project | Résumé / source facts | Status |
| --- | --- | --- |
| GPU-Accelerated KNN Written Number Classifier | CUDA C++ k-NN for MNIST; 96.65% accuracy on the 10,000-image test set; Euclidean-distance and bitonic-sort kernels; CUDA streams, pinned host memory, `float4` loads; per-stage CUDA-event timing. Public repo. | **Group project** per owner. Year 2024 from repository creation (last push Jan 2025). `verified: true`. |
| Real-time production dashboard | Flextronics, 2023. Vue.js, Element UI, ECharts, RESTful ASP.NET back end; line status, KPIs, changeover metrics. Public repo. | **Independent, internal tool, not publicly deployed.** `verified: true`. |
| IoT / IoUT validation framework | Public repo; overlaps with the SOLIDS Lab Research Assistant work. | Held as `draft: true`, `verified: false`; covered by the experience entry instead. |
| Retrieval-augmented generation demo | Owner says it is in progress. No repo, stack, dataset, or result is confirmed. | **In progress**; `verified: true` by direct owner confirmation, not from the résumé. Details remain intentionally sparse. |
| pigy Android app | Owner request 2026-11-16. Private repo; offline-first Android app for document scanning, notes, and reminders. Project README/PLAN: M0 and M1 complete (security core; 154 unit tests, 9 instrumented tests), M2 notes is next. | **In progress**; `verified: true` by direct owner request. No public repo or build link. |
| DP hierarchical counts (Shrinkage granularity) | Public repo exists; authorship, author order, venue, and status are not on the public résumé. | `draft: true`, `verified: false`. Do not publish or claim a paper. |
| Neo4j security-incident analysis | Repository exists, but it is **not Qingze’s design**. | Omit by default. If ever mentioned, label “course lab” only. |

## Old blog posts (candidate migration)

| Date | Title | Type |
| --- | --- | --- |
| 2023-09-15 | DAGs and Topological Sorting | Course notes |
| 2023-09-25 | Transitive Closure and Floyd-Warshall’s Algorithm | Course notes |
| 2023-09-28 | Human-Computer-Interaction Summary 1 | Course notes |
| 2023-10-06 | Minimum Spanning Tree | Course notes |

The owner asked to migrate them. All four were published on 2026-11-15 with
`draft: false` and `category: course`; they are labelled “Course notes” in the blog index
and included in the RSS feed.

## New blog posts (owner-provided)

| Date | Title | Category | Source |
| --- | --- | --- | --- |
| 2026-11-16 | Before 4.0: a few words for 秧秧, 穗穗, and 清宵 | `life` | Owner-provided Chinese draft; English source and translations. Three character images are pending from the owner. |

## Wording rules

- Rewrite the résumé sentence “Gathered reporting requirements from production supervisors…”
  — do not copy it verbatim. Current site wording: “Worked with production supervisors to
  turn reporting needs into requirements…”
- No invented metrics, dates, titles, venues, author positions, team sizes, or deployment
  claims.
- Group work gets a visible “Group project” label.
- “Internal tool — not publicly deployed” for the Flextronics dashboard.
- “In progress” for the RAG demo; keep details sparse.
- No phone, email, street address, date of birth, student number, passport, or visa data.
- Contact section = GitHub + LinkedIn only.
- No third-party analytics or tracking.

## Still unknown / open

- DP paper: authorship, author order, venue, status, public link.
- CUDA project: team size and Qingze’s exact individual contribution. The site only labels
  it as a group project and does not attribute the team result to one person.
- RAG demo: what it retrieves, stack, public repo, evaluation.
