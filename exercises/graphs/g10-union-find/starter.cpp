#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>

class DSU {
public:
    explicit DSU(int n) {
        // TODO
    }
    int find(int x) {
        return -1;  // TODO
    }
    bool unite(int a, int b) {
        return false;  // TODO
    }
    int size_of(int x) {
        return 0;  // TODO
    }
    int components() const {
        return 0;  // TODO
    }

private:
    // TODO: parent, size, component count
};

struct Edge {
    int u, v;
    long long w;
};

// Total weight of a minimum spanning tree, or -1 if the graph is not connected.
long long mst_weight(int n, std::vector<Edge> edges) {
    return -2;  // TODO
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
