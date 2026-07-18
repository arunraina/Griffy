-- Schema drift fix: listingType was added to the Property model in schema.prisma
-- (commit 3bad697, "Build full marketplace") but no migration was ever generated,
-- so production never got the column.
ALTER TABLE "properties" ADD COLUMN "listing_type" TEXT NOT NULL DEFAULT 'buy';
