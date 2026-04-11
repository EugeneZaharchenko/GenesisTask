-- SQLite's ALTER TABLE does not support modifying existing constraints or column definitions.
-- It only supports ADD COLUMN and RENAME TABLE/COLUMN.
-- To add ON DELETE CASCADE to an existing foreign key the table must be fully rebuilt:
--   1. Create a new table with the correct schema (subscriptions_new)
--   2. Copy all existing rows into it
--   3. Drop the original table (which also drops its indexes)
--   4. Rename the new table to the original name
--   5. Recreate the indexes that were lost in step 3
-- This is the standard SQLite pattern, foreign_keys is disabled during the rebuild to avoid constraint checks on the intermediate state.

PRAGMA foreign_keys = OFF;

CREATE TABLE subscriptions_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    repository_id INTEGER NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    confirmed BOOLEAN DEFAULT false,
    created_at TEXT DEFAULT (datetime('now')),
    unsubscribe_token TEXT,
    UNIQUE(email, repository_id)
);

INSERT INTO subscriptions_new SELECT id, email, repository_id, token, confirmed, created_at, unsubscribe_token FROM subscriptions;

DROP TABLE subscriptions;

ALTER TABLE subscriptions_new RENAME TO subscriptions;

CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_unsubscribe_token ON subscriptions(unsubscribe_token);

PRAGMA foreign_keys = ON;
