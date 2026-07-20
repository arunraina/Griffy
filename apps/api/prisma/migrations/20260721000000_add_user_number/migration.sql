-- Sequential, human-readable signup number, distinct from the Supabase auth
-- UUID `id`. Existing users are backfilled in signup order (created_at ASC),
-- not physical row order, so #1 is genuinely the first person who signed up.

CREATE SEQUENCE "users_user_number_seq";

ALTER TABLE "users" ADD COLUMN "user_number" INTEGER;

UPDATE "users" u
SET "user_number" = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM "users"
) sub
WHERE u.id = sub.id;

SELECT setval('"users_user_number_seq"', (SELECT COALESCE(MAX("user_number"), 0) FROM "users"));

ALTER TABLE "users" ALTER COLUMN "user_number" SET DEFAULT nextval('"users_user_number_seq"');
ALTER TABLE "users" ALTER COLUMN "user_number" SET NOT NULL;
ALTER SEQUENCE "users_user_number_seq" OWNED BY "users"."user_number";

CREATE UNIQUE INDEX "users_user_number_key" ON "users"("user_number");
