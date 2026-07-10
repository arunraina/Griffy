-- Phase 6, Part C: portfolio items (past-work showcase).

CREATE TABLE "portfolio_items" (
  "id" TEXT NOT NULL,
  "profile_type" TEXT NOT NULL,
  "profile_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "image_urls" TEXT[],
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "portfolio_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "portfolio_items_profile_type_profile_id_idx" ON "portfolio_items"("profile_type", "profile_id");

-- New table created after the Security Phase 1 RLS lockdown — needs its own
-- enable + grant revoke to stay deny-by-default for anon/authenticated.
ALTER TABLE "portfolio_items" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "portfolio_items" FROM anon;
REVOKE ALL ON "portfolio_items" FROM authenticated;
