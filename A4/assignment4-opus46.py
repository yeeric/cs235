"""
CISC235 Winter 2026 - Assignment 4
Graph Diameter, Random Connected Graphs, and Kruskal's Algorithm

This program implements:
  Part 1: Random connected graph generation and diameter computation
  Part 2: Experiment relating graph size to average diameter
  Part 3: Comparison of BFS spanning tree vs Kruskal's MST
"""

import random
from collections import deque

# ============================================================
# Graph representation using adjacency lists
# ============================================================

class Graph:
    """Undirected weighted graph using adjacency lists."""

    def __init__(self, n):
        """Initialize graph with n vertices (0 to n-1)."""
        self.n = n
        # adj[v] is a dict mapping neighbor -> weight
        self.adj = [dict() for _ in range(n)]

    def add_edge(self, u, v, weight=1):
        """Add an undirected edge between u and v with given weight."""
        if u != v and v not in self.adj[u]:
            self.adj[u][v] = weight
            self.adj[v][u] = weight
            return True
        return False

    def has_edge(self, u, v):
        return v in self.adj[u]

    def edges(self):
        """Return list of (u, v, weight) for all edges (each listed once)."""
        edge_list = []
        for u in range(self.n):
            for v, w in self.adj[u].items():
                if u < v:
                    edge_list.append((u, v, w))
        return edge_list

    def num_edges(self):
        return sum(len(self.adj[v]) for v in range(self.n)) // 2

    def print_adj(self):
        """Print adjacency lists."""
        for v in range(self.n):
            neighbors = sorted(self.adj[v].keys())
            neighbor_str = ", ".join(str(nb) for nb in neighbors)
            print(f"  {v}: [{neighbor_str}]")


# ============================================================
# Random graph generation (Appendix method)
# ============================================================

def generate_random_tree(n):
    """
    Generate a random connected tree on n vertices.
    Method from appendix:
      For i = 1 to n-1: randomly choose p in [0, i-1], add edge (i, p).
    Edges are assigned random integer weights in [1, 20].
    """
    g = Graph(n)
    for i in range(1, n):
        p = random.randint(0, i - 1)
        weight = random.randint(1, 20)
        g.add_edge(i, p, weight)
    return g


def add_random_edges(g, k, exact=False):
    """
    Add approximately k random edges to graph g.
    If exact=True, keep trying until exactly k new edges are added.
    Edges are assigned random integer weights in [1, 20].
    """
    added = 0
    if exact:
        attempts = 0
        max_attempts = k * 100  # safety limit
        while added < k and attempts < max_attempts:
            v1 = random.randint(0, g.n - 1)
            v2 = random.randint(0, g.n - 1)
            weight = random.randint(1, 20)
            if v1 != v2 and not g.has_edge(v1, v2):
                g.add_edge(v1, v2, weight)
                added += 1
            attempts += 1
    else:
        for _ in range(k):
            v1 = random.randint(0, g.n - 1)
            v2 = random.randint(0, g.n - 1)
            weight = random.randint(1, 20)
            if v1 != v2 and not g.has_edge(v1, v2):
                g.add_edge(v1, v2, weight)
                added += 1
    return added


# ============================================================
# BFS and Diameter computation
# ============================================================

def bfs_max_distance(g, start):
    """
    Run BFS from start vertex. Return the maximum distance (number of edges)
    to any reachable vertex.
    """
    dist = [-1] * g.n
    dist[start] = 0
    queue = deque([start])
    max_dist = 0
    while queue:
        v = queue.popleft()
        for nb in g.adj[v]:
            if dist[nb] == -1:
                dist[nb] = dist[v] + 1
                if dist[nb] > max_dist:
                    max_dist = dist[nb]
                queue.append(nb)
    return max_dist


def compute_diameter(g):
    """
    Compute the diameter of graph g by running BFS from every vertex
    and returning the overall maximum distance.
    """
    diameter = 0
    for v in range(g.n):
        d = bfs_max_distance(g, v)
        if d > diameter:
            diameter = d
    return diameter


# ============================================================
# BFS Spanning Tree (for Part 3)
# ============================================================

def bfs_spanning_tree(g, start=0):
    """
    Build a spanning tree of g using BFS from start.
    Returns total weight of the BFS spanning tree.
    """
    visited = [False] * g.n
    visited[start] = True
    queue = deque([start])
    total_weight = 0
    while queue:
        v = queue.popleft()
        for nb, w in g.adj[v].items():
            if not visited[nb]:
                visited[nb] = True
                total_weight += w
                queue.append(nb)
    return total_weight


# ============================================================
# Union-Find (Disjoint Set) for Kruskal's Algorithm
# ============================================================

class UnionFind:
    """Union-Find with path compression and union by rank."""

    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return False
        if self.rank[rx] < self.rank[ry]:
            rx, ry = ry, rx
        self.parent[ry] = rx
        if self.rank[rx] == self.rank[ry]:
            self.rank[rx] += 1
        return True


# ============================================================
# Kruskal's Minimum Spanning Tree
# ============================================================

def kruskal_mst(g):
    """
    Compute MST using Kruskal's algorithm.
    Returns total weight of the MST.
    """
    edges = g.edges()
    edges.sort(key=lambda e: e[2])  # sort by weight
    uf = UnionFind(g.n)
    total_weight = 0
    edges_added = 0
    for u, v, w in edges:
        if uf.union(u, v):
            total_weight += w
            edges_added += 1
            if edges_added == g.n - 1:
                break
    return total_weight


# ============================================================
# PART 1: Demonstration with 8 vertices
# ============================================================

def part1():
    print("=" * 60)
    print("PART 1: Random Connected Graph Generation & Diameter")
    print("=" * 60)

    random.seed(42)  # for reproducibility

    n = 8
    tree = generate_random_tree(n)
    print(f"\nRandom tree on {n} vertices ({tree.num_edges()} edges):")
    print("Adjacency lists:")
    tree.print_adj()
    d_tree = compute_diameter(tree)
    print(f"Diameter of tree: {d_tree}")

    # Add about 8 more edges
    added = add_random_edges(tree, 8, exact=True)

    print(f"\nAfter adding {added} more edges ({tree.num_edges()} total edges):")
    print("Adjacency lists:")
    tree.print_adj()
    d_graph = compute_diameter(tree)
    print(f"Diameter of graph: {d_graph}")
    print()


# ============================================================
# PART 2: Experiment - Diameter vs. n
# ============================================================

def part2():
    print("=" * 60)
    print("PART 2: Diameter Experiment")
    print("=" * 60)

    random.seed(42)  # for reproducibility

    ns = [100, 200, 400, 800, 1600]
    k = 10  # sample size

    print(f"\nSample size k = {k}")

    results = []
    for n in ns:
        tree_diameters = []
        graph_diameters = []
        for _ in range(k):
            g = generate_random_tree(n)
            td = compute_diameter(g)
            tree_diameters.append(td)

            add_random_edges(g, n,  exact=True)  # add n edges
            gd = compute_diameter(g)
            graph_diameters.append(gd)

        avg_tree = sum(tree_diameters) / k
        avg_graph = sum(graph_diameters) / k
        results.append((n, avg_tree, avg_graph))

    # ASCII table summary
    print("\n" + "-" * 52)
    print(f"{'n':>6}  {'Avg Tree Diameter':>14}  {'Avg Graph Diameter':>14}")
    print("-" * 52)
    for n, at, ag in results:
        print(f"{n:>6}  {at:>14.2f}  {ag:>14.2f}")
    print("-" * 52)



# ============================================================
# PART 3: Kruskal's MST vs BFS Spanning Tree
# ============================================================

def part3():
    print("=" * 60)
    print("PART 3: Kruskal's MST vs BFS Spanning Tree")
    print("=" * 60)

    random.seed(42)  # for reproducibility

    ns = [20, 40, 60]
    k = 10  # sample size

    print(f"\nSample size k = {k}")
    print(f"{'n':>6} | {'Avg BFS Weight':>15} | {'Avg Kruskal Weight':>18} | {'Avg Diff (%)':>12}")
    print("-" * 60)

    for n in ns:
        diffs = []
        bfs_weights = []
        kruskal_weights = []
        for _ in range(k):
            # Generate a random graph: start with tree, add n more edges
            g = generate_random_tree(n)
            add_random_edges(g, n,  exact=True)

            # Use a random starting vertex to avoid bias from vertex 0's neighborhood
            B = bfs_spanning_tree(g, start=random.randint(0, g.n - 1))
            P = kruskal_mst(g)            # Kruskal MST total weight
            diff = (B - P) / P * 100.0 if P > 0 else 0.0
            diffs.append(diff)
            bfs_weights.append(B)
            kruskal_weights.append(P)

        avg_B = sum(bfs_weights) / k
        avg_P = sum(kruskal_weights) / k
        avg_diff = sum(diffs) / k
        print(f"{n:>6} | {avg_B:>15.2f} | {avg_P:>18.2f} | {avg_diff:>11.2f}%")



# ============================================================
# Main
# ============================================================

if __name__ == "__main__":
    part1()
    part2()
    part3()
