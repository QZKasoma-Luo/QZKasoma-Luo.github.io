---
title: "Minimum Spanning Tree"
description: "Course notes on weighted graphs, minimum spanning trees, Prim’s algorithm, and Kruskal’s algorithm."
date: 2023-10-06
tags:
  - Algorithms
  - Graphs
courseNotes: true
draft: true
---

## Weighted Graph

Before we get into Minimum Spanning Tree (MST), let’s get to know what is a weighted graph:

- A weighted graph is a graph model where we associate weights (or costs) with each edge. That is, for each edge e, it has a numeric label associate with it, denote as w(e).

That we will look at algorithms for solving three general problems of weighted graph:

1. MST
2. Shortest Path
3. Network Flow

## Minimum Spanning Tree

- Input of MST: A weighted, connected graph 𝐺 = (𝑉, 𝐸) consisting of vertices (or nodes), 𝑉, and edges, 𝐸, with edge weights.
- Output: A minimum spanning tree (MST) 𝑇 = (𝑉, 𝐸𝑇) of 𝐺. That is, 𝑇 is a connected spanning subgraph of 𝐺 (𝐸𝑇 ⊆ 𝐸) such that 𝑇 is acyclic, and the total weight of 𝑇, is minimized.

The real-life application of MST are:

1. Cluster analysis.

2. Max bottleneck paths.

3. Real-time face verification.

4. LDPC codes for error correction.

5. Image registration with Renyi entropy.

6. Find road networks in satellite and aerial imagery.

7. Reducing data storage in sequencing amino acids in a protein.

8. Model locality of particle interactions in turbulent fluid flows.

9. Autoconfig protocol for Ethernet bridging to avoid cycles in a network.

10. Approximation algorithms for NP-hard problems (e.g., TSP, Steiner tree).

11. Network design (communication, electrical, hydraulic, computer, road).

    For more information, please go to: [http://www.ics.uci.edu/~eppstein/gina/mst.html](http://www.ics.uci.edu/~eppstein/gina/mst.html)

## How to find the MST in a Graph G?

Well, there are two ways of doing that:

1. You can use the brute force to creat all the possible spanning trees and finds the lightest W(G), yet this method is not feasible since the big O of the brute force can go creazy.
2. We can use Greedy Algorithms instead, like Prim or Kruskal’s algorithms.

## Prim’s Algorithm:

- Initialize tree with single chosen vertex.
- Grow tree by finding lightest adjacent edge not yet in tree and connect it to the tree; repeat until all vertices are in the tree.

## Kruskal’s Algorithm:

- Initialize a forest consisting of all nodes
- Pick a (non-selected) minimum weight edge and, if it connects two different trees of the forest, select it, otherwise discard it; repeat.

(To be Continued…)
