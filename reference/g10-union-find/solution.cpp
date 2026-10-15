#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>

class DSU {
public:
    explicit DSU(int n) : parent_(n), size_(n, 1), comps_(n) {
        std::iota(parent_.begin(), parent_.end(), 0);
    }
    int find(int x) {
        while (parent_[x] != x) {
            parent_[x] = parent_[parent_[x]];  // path halving
            x = parent_[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a);
        b = find(b);
        if (a == b) return false;
        if (size_[a] < size_[b]) std::swap(a, b);
        parent_[b] = a;
        size_[a] += size_[b];
        --comps_;
        return true;
    }
    int size_of(int x) { return size_[find(x)]; }
    int components() const { return comps_; }

private:
    std::vector<int> parent_;
    std::vector<int> size_;
    int comps_;
};

struct Edge {
    int u, v;
    long long w;
};

long long mst_weight(int n, std::vector<Edge> edges) {
    std::sort(edges.begin(), edges.end(), [](const Edge& a, const Edge& b) { return a.w < b.w; });
    DSU d(n);
    long long total = 0;
    int used = 0;
    for (const Edge& e : edges) {
        if (d.unite(e.u, e.v)) {
            total += e.w;
            ++used;
        }
    }
    return used == n - 1 ? total : -1;
}

#ifndef DOJO_TEST
int main() {
    DSU d(5);
    d.unite(0, 1);
    d.unite(3, 4);
    std::cout << "components: " << d.components() << "\n";
    std::cout << "same(0,1): " << (d.find(0) == d.find(1)) << "\n";
    std::cout << "mst: " << mst_weight(4, {{0, 1, 1}, {1, 2, 2}, {0, 2, 5}, {2, 3, 1}}) << "\n";
}
#endif
