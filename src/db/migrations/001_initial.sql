CREATE TABLE IF NOT EXISTS repositories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner TEXT NOT NULL,
    repo TEXT NOT NULL,
    last_seen_tag TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(owner, repo)
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    repository_id INTEGER NOT NULL REFERENCES repositories(id),
    token TEXT NOT NULL UNIQUE,
    confirmed BOOLEAN DEFAULT false,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(email, repository_id)
);
