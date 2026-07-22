-- AlterTable: reviewer_id becomes nullable so admin-added reviews (no real
-- User behind them) can omit it, and add the admin-review-specific columns.
ALTER TABLE "reviews" ALTER COLUMN "reviewer_id" DROP NOT NULL;
ALTER TABLE "reviews" ADD COLUMN "reviewer_name" TEXT,
ADD COLUMN "reviewer_phone" TEXT,
ADD COLUMN "is_admin_added" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "admin_added_by_id" TEXT,
ADD COLUMN "source" TEXT;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_admin_added_by_id_fkey" FOREIGN KEY ("admin_added_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
