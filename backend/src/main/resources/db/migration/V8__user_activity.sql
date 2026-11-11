-- User activity for the admin panel: when the user was last active in the app and how many
-- times they signed in. last_seen_at is updated on login/registration and on session restore
-- (GET /auth/me, throttled to once per 5 minutes per user).
ALTER TABLE users
    ADD COLUMN last_seen_at TIMESTAMPTZ,
    ADD COLUMN login_count  INT NOT NULL DEFAULT 0;

CREATE INDEX idx_users_last_seen ON users (last_seen_at DESC NULLS LAST);
