ALTER TABLE subscriptions ADD COLUMN unsubscribe_token TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_unsubscribe_token ON subscriptions (unsubscribe_token);
