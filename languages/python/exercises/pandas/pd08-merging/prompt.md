# Merging and concatenating

## Concept

Data usually lives in several tables that share a **key**. `merge` joins them like SQL:

```python
orders.merge(customers, on="customer_id")              # inner join (the default)
orders.merge(customers, on="customer_id", how="left")  # keep every order
customers.merge(orders, on="customer_id", how="left")  # keep every customer
pd.merge(a, b, left_on="cust", right_on="id")          # keys with different names
```

| `how` | keeps |
| --- | --- |
| `"inner"` | only keys present in both |
| `"left"` | every row of the left frame; unmatched right columns become NaN |
| `"right"` | the mirror image |
| `"outer"` | every key from either side |

One left row matches **every** right row with the same key, so duplicate keys multiply rows. `validate="many_to_one"` makes pandas raise if the right side has duplicate keys, which catches a lot of silent bugs. `indicator=True` adds a `_merge` column saying `"both"`, `"left_only"` or `"right_only"`: perfect for finding orphans.

Overlapping column names get suffixes (`_x`, `_y`); set your own with `suffixes=("_order", "_customer")`.

**`concat`** stacks frames with the same columns on top of each other:

```python
pd.concat([jan, feb], ignore_index=True)   # new 0..n-1 index instead of repeated labels
```

## Your task

The functions receive a `customers` frame (`customer_id`, `name`, `city`) and an `orders` frame (`order_id`, `customer_id`, `amount`). Implement in `solution.py`:

1. `orders_with_customers(orders, customers)`: each order with its customer's `name` and `city` (columns `order_id`, `customer_id`, `amount`, `name`, `city`); orders with an unknown customer are dropped. Sorted by `order_id`, index from 0.
2. `customers_without_orders(customers, orders)`: the names of the customers with no orders, in the customers' order.
3. `unknown_customer_orders(orders, customers)`: a sorted list of the `order_id`s whose `customer_id` is not in `customers`.
4. `revenue_by_city(orders, customers)`: a dict `{city: total order amount}` (floats) for **every** city in `customers`, including cities whose customers ordered nothing (0.0). Orders from unknown customers are ignored.
5. `stack_months(jan, feb)`: one frame with the rows of `jan` then `feb`, a new `month` column (`"jan"` / `"feb"`) and an index from 0.
