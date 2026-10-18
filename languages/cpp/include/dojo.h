// dojo.h - a tiny single-header test harness for the C++ Dojo exercises.
//
// Each exercise ships a test.cpp that includes this header, then includes your
// solution.cpp, then declares TEST(...) blocks. You never need to edit it.
//
//   TEST(name) { ... }                  registers a test case
//   CHECK(cond)                         fails the test if cond is false
//   CHECK_EQ(actual, expected)          fails with a readable diff-style message
//   CHECK_NEAR(actual, expected, eps)   floating point comparison
//   INFO("text")                        adds context to any failure that follows
//
// The first failing CHECK stops that test and the harness moves on to the next.
//
// Notes for reading or writing tests:
//   * The *expected* side of CHECK_EQ may contain braces and commas. The *actual*
//     side may not (wrap it in extra parentheses if it must).
//   * INFO("...") text is printed after "case:" in the failure message.
#pragma once

// A broad set of standard headers is included up front so that tests can redefine
// things like `malloc` afterwards without disturbing later #includes.
#include <algorithm>
#include <array>
#include <climits>
#include <cmath>
#include <cstddef>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <deque>
#include <exception>
#include <functional>
#include <iostream>
#include <limits>
#include <map>
#include <memory>
#include <new>
#include <numeric>
#include <queue>
#include <set>
#include <sstream>
#include <stack>
#include <string>
#include <type_traits>
#include <unordered_map>
#include <unordered_set>
#include <utility>
#include <vector>

namespace dojo {

// ---------------------------------------------------------------------------
// Pretty printing for failure messages
// ---------------------------------------------------------------------------

inline std::string show(bool b) { return b ? "true" : "false"; }
inline std::string show(char c) { return std::string("'") + c + "'"; }
inline std::string show(const std::string& s) { return "\"" + s + "\""; }
inline std::string show(const char* s) { return std::string("\"") + s + "\""; }
inline std::string show(double d) {
    std::ostringstream o;
    o.precision(9);
    o << d;
    return o.str();
}
inline std::string show(float f) { return show(static_cast<double>(f)); }

template <class T, std::enable_if_t<std::is_integral_v<T>, int> = 0>
std::string show(T v) {
    return std::to_string(v);
}

template <class T> std::string show(const std::vector<T>& v);
template <class A, class B> std::string show(const std::pair<A, B>& p);
template <class T> std::string show(const std::set<T>& s);

template <class T>
std::string show(const std::vector<T>& v) {
    std::string out = "[";
    const std::size_t limit = 40;
    std::size_t n = 0;
    for (const auto& x : v) {
        if (n == limit) {
            out += ", ... (" + std::to_string(v.size()) + " items)";
            break;
        }
        if (n++) out += ", ";
        out += show(x);
    }
    return out + "]";
}

template <class A, class B>
std::string show(const std::pair<A, B>& p) {
    return "(" + show(p.first) + ", " + show(p.second) + ")";
}

template <class T>
std::string show(const std::set<T>& s) {
    std::string out = "{";
    bool first = true;
    for (const auto& x : s) {
        if (!first) out += ", ";
        first = false;
        out += show(x);
    }
    return out + "}";
}

// ---------------------------------------------------------------------------
// Failure plumbing
// ---------------------------------------------------------------------------

struct Failure {
    std::string message;
};

inline std::string& context() {
    static std::string c;
    return c;
}

[[noreturn]] inline void fail(const std::string& body, const char* file, int line) {
    std::string base = file;
    auto slash = base.find_last_of("/\\");
    if (slash != std::string::npos) base = base.substr(slash + 1);
    std::string msg = "at " + base + ":" + std::to_string(line) + "\n" + body;
    if (!context().empty()) msg += "\n    case: " + context();
    throw Failure{msg};
}

inline void check_true(bool ok, const char* expr, const char* file, int line) {
    if (!ok) fail(std::string("    expected this to be true: ") + expr, file, line);
}

inline void check_false(bool ok, const char* expr, const char* file, int line) {
    if (ok) fail(std::string("    expected this to be false: ") + expr, file, line);
}

template <class A, class B>
void check_eq(const A& actual, const B& expected, const char* expr, const char* file, int line) {
    if (!(actual == expected)) {
        fail(std::string("    ") + expr + "\n      expected: " + show(expected) +
                 "\n        actual: " + show(actual),
             file, line);
    }
}

inline void check_near(double actual, double expected, double eps, const char* expr,
                       const char* file, int line) {
    if (!(std::fabs(actual - expected) <= eps)) {
        fail(std::string("    ") + expr + "\n      expected: " + show(expected) + " (+/- " +
                 show(eps) + ")\n        actual: " + show(actual),
             file, line);
    }
}

// ---------------------------------------------------------------------------
// Allocation tracking (optional, enabled per test file)
// ---------------------------------------------------------------------------

inline long& live_news() {
    static long n = 0;
    return n;
}
inline long& live_mallocs() {
    static long n = 0;
    return n;
}
inline long& total_news() {
    static long n = 0;
    return n;
}

// Counts allocations relative to when it was created: how many are still alive
// (leaked_*) and, for `new`, how many were made in total (allocated_news).
struct AllocScope {
    long news0 = live_news();
    long mallocs0 = live_mallocs();
    long total_news0 = total_news();
    long leaked_news() const { return live_news() - news0; }
    long leaked_mallocs() const { return live_mallocs() - mallocs0; }
    long allocated_news() const { return total_news() - total_news0; }
};

inline void* c_malloc(std::size_t n) {
    void* p = std::malloc(n);
    if (p) ++live_mallocs();
    return p;
}
inline void* c_calloc(std::size_t n, std::size_t size) {
    void* p = std::calloc(n, size);
    if (p) ++live_mallocs();
    return p;
}
inline void* c_realloc(void* p, std::size_t n) {
    void* q = std::realloc(p, n);
    if (!p && q) ++live_mallocs();
    return q;
}
inline void c_free(void* p) {
    if (p) --live_mallocs();
    std::free(p);
}

// ---------------------------------------------------------------------------
// Test registry and runner
// ---------------------------------------------------------------------------

struct TestCase {
    const char* name;
    void (*fn)();
};

inline std::vector<TestCase>& registry() {
    static std::vector<TestCase> r;
    return r;
}

struct Registrar {
    Registrar(const char* name, void (*fn)()) { registry().push_back({name, fn}); }
};

inline std::string json_escape(const std::string& s) {
    std::string out;
    for (unsigned char c : s) {
        switch (c) {
            case '"': out += "\\\""; break;
            case '\\': out += "\\\\"; break;
            case '\n': out += "\\n"; break;
            case '\r': out += "\\r"; break;
            case '\t': out += "\\t"; break;
            default:
                if (c < 0x20) {
                    char buf[8];
                    std::snprintf(buf, sizeof buf, "\\u%04x", c);
                    out += buf;
                } else {
                    out += static_cast<char>(c);
                }
        }
    }
    return out;
}

inline int run_all() {
    struct Outcome {
        std::string name;
        bool ok;
        std::string message;
    };
    std::vector<Outcome> outcomes;
    const bool color = true;
    const char* dim = color ? "\x1b[2m" : "";
    const char* green = color ? "\x1b[32m" : "";
    const char* red = color ? "\x1b[31m" : "";
    const char* reset = color ? "\x1b[0m" : "";

    for (const auto& t : registry()) {
        std::printf("%s[ RUN  ]%s %s\n", dim, reset, t.name);
        std::fflush(stdout);
        context().clear();
        try {
            t.fn();
            std::printf("%s[ PASS ]%s %s\n", green, reset, t.name);
            outcomes.push_back({t.name, true, ""});
        } catch (const Failure& f) {
            std::printf("%s[ FAIL ]%s %s\n%s\n", red, reset, t.name, f.message.c_str());
            outcomes.push_back({t.name, false, f.message});
        } catch (const std::exception& e) {
            std::string msg = std::string("    unexpected exception: ") + e.what();
            std::printf("%s[ FAIL ]%s %s\n%s\n", red, reset, t.name, msg.c_str());
            outcomes.push_back({t.name, false, msg});
        } catch (...) {
            std::string msg = "    unexpected exception of unknown type";
            std::printf("%s[ FAIL ]%s %s\n%s\n", red, reset, t.name, msg.c_str());
            outcomes.push_back({t.name, false, msg});
        }
        std::fflush(stdout);
    }

    int passed = 0, failed = 0;
    for (const auto& o : outcomes) (o.ok ? passed : failed)++;
    std::printf("\n%s%d of %d tests passed%s\n", failed ? red : green, passed,
                passed + failed, reset);

    if (const char* path = std::getenv("DOJO_RESULT_FILE")) {
        if (FILE* f = std::fopen(path, "w")) {
            std::fprintf(f, "{\"passed\":%d,\"failed\":%d,\"total\":%d,\"tests\":[", passed,
                         failed, passed + failed);
            bool first = true;
            for (const auto& o : outcomes) {
                if (!first) std::fputc(',', f);
                first = false;
                std::fprintf(f, "{\"name\":\"%s\",\"ok\":%s,\"message\":\"%s\"}",
                             json_escape(o.name).c_str(), o.ok ? "true" : "false",
                             json_escape(o.message).c_str());
            }
            std::fprintf(f, "]}");
            std::fclose(f);
        }
    }
    return failed ? 1 : 0;
}

}  // namespace dojo

#define DOJO_CONCAT2(a, b) a##b
#define DOJO_CONCAT(a, b) DOJO_CONCAT2(a, b)

#define TEST(name)                                                              \
    static void dojo_test_##name();                                             \
    static dojo::Registrar dojo_registrar_##name(#name, dojo_test_##name);      \
    static void dojo_test_##name()

#define CHECK(cond) dojo::check_true(static_cast<bool>(cond), #cond, __FILE__, __LINE__)
#define CHECK_FALSE(cond) dojo::check_false(static_cast<bool>(cond), #cond, __FILE__, __LINE__)
// The expected value is variadic so braces with commas survive the preprocessor:
//   CHECK_EQ(f(x), std::vector<int>{1, 2, 3});
#define CHECK_EQ(actual, ...) dojo::check_eq((actual), (__VA_ARGS__), #actual, __FILE__, __LINE__)
#define CHECK_NEAR(actual, expected, eps) \
    dojo::check_near((actual), (expected), (eps), #actual, __FILE__, __LINE__)
#define INFO(text) (dojo::context() = (text))

// ---------------------------------------------------------------------------
// Opt-in allocation tracking for `new` / `delete`.
// Define DOJO_TRACK_NEW before including this header in a test file.
// ---------------------------------------------------------------------------
#ifdef DOJO_TRACK_NEW
namespace dojo {
constexpr std::size_t kHeader = 16;
constexpr unsigned kTagSingle = 0x51A61E00u;
constexpr unsigned kTagArray = 0xA77A7000u;

inline void* tracked_new(std::size_t n, unsigned tag) {
    void* raw = std::malloc(n + kHeader);
    if (!raw) throw std::bad_alloc();
    *static_cast<unsigned*>(raw) = tag;
    ++live_news();
    ++total_news();
    return static_cast<char*>(raw) + kHeader;
}

inline void tracked_delete(void* p, unsigned tag) noexcept {
    if (!p) return;
    void* raw = static_cast<char*>(p) - kHeader;
    unsigned found = *static_cast<unsigned*>(raw);
    if (found != tag) {
        std::fprintf(stderr,
                     "\nMemory error: %s was used on memory that came from %s.\n"
                     "Use delete for new, and delete[] for new[].\n",
                     tag == kTagArray ? "delete[]" : "delete",
                     found == kTagArray ? "new[]" : "new");
        std::fflush(stderr);
        std::abort();
    }
    *static_cast<unsigned*>(raw) = 0xDEADBEEFu;
    --live_news();
    std::free(raw);
}
}  // namespace dojo

void* operator new(std::size_t n) { return dojo::tracked_new(n, dojo::kTagSingle); }
void* operator new[](std::size_t n) { return dojo::tracked_new(n, dojo::kTagArray); }
void operator delete(void* p) noexcept { dojo::tracked_delete(p, dojo::kTagSingle); }
void operator delete[](void* p) noexcept { dojo::tracked_delete(p, dojo::kTagArray); }
void operator delete(void* p, std::size_t) noexcept { dojo::tracked_delete(p, dojo::kTagSingle); }
void operator delete[](void* p, std::size_t) noexcept { dojo::tracked_delete(p, dojo::kTagArray); }
#endif
