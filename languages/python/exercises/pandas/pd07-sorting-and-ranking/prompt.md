# Sorting and ranking

## Concept

```python
df.sort_values("score")                                   # ascending
df.sort_values("score", ascending=False)                  # descending
df.sort_values(["cls", "score"], ascending=[True, False]) # one flag per column
df.sort_index()                                           # by the index labels
df.nlargest(3, "score")                                   # top 3 without a full sort
```

Sorting keeps each row's index label, so after sorting the labels are shuffled. Add `.reset_index(drop=True)` when the position (1st, 2nd...) is what matters.

**Top-N per group**: sort, then `groupby(...).head(n)`. `head` on a grouped frame keeps the first `n` rows of each group *in their current order*, and the result stays in the sorted order.

**Ranking** gives each value its position. Ties need a policy:

```python
s = pd.Series([90, 85, 85, 70])
s.rank(ascending=False, method="min")    # 1, 2, 2, 4   (sports ranking)
s.rank(ascending=False, method="dense")  # 1, 2, 2, 3   (no gaps)
s.rank(ascending=False, method="first")  # 1, 2, 3, 4   (ties by position)
```

`rank` returns floats (the default method averages ties: 2.5); convert with `.astype(int)` when every rank is whole.

Counting and finding:

```python
df["cls"].value_counts()          # how often each value occurs, most frequent first
df["cls"].value_counts(normalize=True)   # as fractions
df["score"].idxmax()              # the index LABEL of the maximum
df.loc[df["score"].idxmax()]      # ...so you can fetch the whole row
```

## Your task

Each function receives a results frame with the columns `name`, `cls` (class), `score` and `minutes` (time taken). Implement in `solution.py`:

1. `leaderboard(df)`: all rows sorted by score (highest first), then by minutes (fastest first), then by name; index from 0.
2. `top_n_per_class(df, n)`: the best `n` students of each class by score (ties by name), ordered by class and then by score descending; index from 0.
3. `add_rank(df)`: a new frame with a `rank` column of ints: 1 for the highest score, equal scores share a rank, and ranks have no gaps.
4. `class_counts(df)`: a dict `{class: number of students}` with plain `int` counts.
5. `best_student(df)`: the name of the student with the highest score (the first one if several share it).
