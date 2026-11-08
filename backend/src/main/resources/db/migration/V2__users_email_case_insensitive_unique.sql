-- Enforce e-mail uniqueness case-insensitively at the database level, so no write
-- path (admin CRUD, imports, seeders) can create 'User@x.uz' next to 'user@x.uz'.
-- The application also stores e-mails normalized (User.normalizeEmail).
ALTER TABLE users DROP CONSTRAINT users_email_key;
CREATE UNIQUE INDEX uq_users_email_lower ON users (lower(email));
