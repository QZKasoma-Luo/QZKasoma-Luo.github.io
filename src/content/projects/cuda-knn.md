---
title: "GPU-Accelerated KNN Written Number Classifier"
summary: "CUDA C++ k-NN classifier for MNIST, reaching 96.65% accuracy on the 10,000-image test set."
year: 2024
kind: group
status: completed
tags:
  - CUDA
  - C++
  - MNIST
links:
  repo: https://github.com/QZKasoma-Luo/CUDA-Written_Number_Classifier
featured: true
order: 1
draft: false
verified: true
---

A group project exploring GPU acceleration for k-nearest neighbours on the MNIST dataset.
The implementation includes kernels for Euclidean distances and bitonic-sort neighbour
selection, and uses CUDA streams, pinned host memory, and `float4` loads, with per-stage
timing through CUDA events.

The repository reports **96.65% accuracy** on the 10,000-image test set. The site labels
this as a **group project** and does not attribute the team’s result to one person.
