---
title: "DAGs and Topological Sorting"
description: "Course notes on directed acyclic graphs, topological ordering, and the algorithms behind them."
date: 2023-09-15
tags:
  - Algorithms
  - Graphs
courseNotes: true
draft: false
---

## DAG

A Directed Acyclic Graph (DAG) is a type of graph structure composed of a set of nodes and a set of directed edges, where each edge has a direction, pointing from one node to another, and the graph does not contain any cycles (meaning you cannot start at one node and follow directed edges to return to the same node). Therefore, a DAG is a directed graph without cycles.

DAGs find extensive applications in various fields such as task scheduling, compiler optimization, dependency analysis, and more. In these applications, DAGs are typically used to represent dependencies between tasks or data flows within computational processes.

## Topological Sorting

Topological sorting is a fundamental algorithm used in graph theory and project management to linearly order the nodes (or tasks) of a directed acyclic graph (DAG). The goal of topological sorting is to arrange the nodes in such a way that for every directed edge (u, v), node u appears before node v in the linear order. In other words, it establishes a consistent sequence for completing tasks or processing elements while respecting their dependencies.

Key points about topological sorting:

1. **Directed Acyclic Graph (DAG)**: Topological sorting can only be applied to directed graphs that have no cycles. This is because cycles introduce ambiguity in the order of tasks, making a topological order impossible.

2. **Dependency Resolution**: Topological sorting is particularly useful when you have a set of tasks or activities with dependencies. It ensures that tasks are executed in the correct order, so a task that depends on another is never started before its prerequisites are completed.

3. **Applications**:

    -   **Project Management**: Topological sorting helps schedule tasks in projects to ensure that the project is completed on time.
    -   **Compiler Optimization**: In compiler design, it helps determine the optimal order for generating code or optimizing program segments.
    -   **Dependency Analysis**: Used in software engineering to analyze dependencies between modules, functions, or classes.
    -   **Course Scheduling**: In academic institutions, it assists in scheduling courses based on prerequisites.
4. **Algorithm**: Several algorithms can perform topological sorting. Depth-First Search (DFS) and Breadth-First Search (BFS) are commonly used approaches. The choice of algorithm depends on the specific requirements of the problem.

5. **Critical Path**: Topological sorting can also identify the critical path in a project, which is the longest path through the graph. Tasks on the critical path are the ones that, if delayed, will delay the entire project.

6. **Multiple Valid Orders**: It’s important to note that in a given DAG, there can be multiple valid topological orders. This flexibility allows for optimization, parallel processing, and resource allocation.

Overall, topological sorting is a powerful tool for managing dependencies and ensuring tasks are executed in the correct order in a wide range of applications where directed acyclic graphs are prevalent.

There are two commonly used algorithms for performing topological sorting on a Directed Acyclic Graph (DAG): Depth-First Search (DFS) and Breadth-First Search (BFS). Both algorithms can be used to find a valid topological order for the nodes in the graph. Here’s an explanation of each algorithm:

1. **Depth-First Search (DFS) Algorithm**:

    -   Start from an arbitrary node in the DAG.
    -   Perform a depth-first traversal of the graph, marking nodes as visited.
    -   When you reach a node with no unvisited neighbors (i.e., a leaf node), add it to the beginning of the topological order.
    -   Continue this process until all nodes have been visited.

    Pseudocode for the DFS-based topological sorting algorithm:

    ```
    function topologicalSort(graph):
        order = []
        visited = set()

        for each node in graph:
            if node is not visited:
                visit(node, order, visited)

        return reverse(order)

    function visit(node, order, visited):
        mark node as visited
        for each neighbor of node:
            if neighbor is not visited:
                visit(neighbor, order, visited)
        append node to order
    ```

2. **Breadth-First Search (BFS) Algorithm**:

    -   Initialize an empty queue and a list to store the topological order.
    -   Start by enqueueing all nodes with no incoming edges (in-degree of 0).
    -   While there are nodes in the queue, do the following:
        -   Dequeue a node, add it to the topological order list.
        -   For each of its neighbors, reduce their in-degrees by 1.
        -   If a neighbor’s in-degree becomes 0, enqueue that neighbor.
    -   Repeat the above process until the queue is empty.

    Pseudocode for the BFS-based topological sorting algorithm:

    ```
    function topologicalSort(graph):
        order = []
        queue = empty queue

        for each node in graph:
            if in-degree of node is 0:
                enqueue(node)

        while queue is not empty:
            node = dequeue(queue)
            append node to order
            for each neighbor of node:
                reduce in-degree of neighbor by 1
                if in-degree of neighbor is 0:
                    enqueue(neighbor)

        return order
    ```

Both DFS and BFS-based algorithms will produce a valid topological order for a DAG. The choice between them depends on factors like performance and specific requirements of the problem.

## Computing a topological sort of G is O(n+m) for V = n and E = m
