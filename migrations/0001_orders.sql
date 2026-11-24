CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL CHECK (channel IN ('telegram', 'max', 'phone', 'other')),
  status TEXT NOT NULL CHECK (status IN ('new', 'confirmed', 'making', 'ready', 'done', 'cancelled')),
  fulfillment TEXT NOT NULL CHECK (fulfillment IN ('pickup', 'delivery')),
  due_date TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX orders_due_date ON orders (due_date, id);
