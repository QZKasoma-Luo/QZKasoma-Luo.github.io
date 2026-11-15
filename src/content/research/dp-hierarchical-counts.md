---
title: "Shrinkage granularity in differentially private hierarchical counts"
summary: "A reproducibility-first study of scalar, level-wise, and per-node shrinkage for differentially private census releases, with archived noise draws and every figure regenerated from results."
year: 2026
authors: []
status: in-progress
links:
  repo: https://github.com/QZKasoma-Luo/Matching-Shrinkage-Granularity
featured: false
order: 2
draft: true
verified: false
---

Differentially private releases of hierarchical counts are routinely post-processed with
consistency projection. A biased shrinkage step can reduce error further at no privacy cost,
but the coefficient can be estimated at three granularities: one per tree, one per level, or
one per cell. This project studies which granularity to use, on synthetic trees and on 2020
U.S. Census releases, plus a zero-cost diagnostic that selects the granularity from the
released data alone.

The repository contains the code, archived data, experiment results, and the scripts that
regenerate every figure and table in the paper.
