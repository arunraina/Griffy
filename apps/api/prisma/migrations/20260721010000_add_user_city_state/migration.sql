-- Self-reported user location, set via profile edit. Nullable — no reliable
-- backfill source for existing users.

ALTER TABLE "users" ADD COLUMN "city" TEXT;
ALTER TABLE "users" ADD COLUMN "state" TEXT;
