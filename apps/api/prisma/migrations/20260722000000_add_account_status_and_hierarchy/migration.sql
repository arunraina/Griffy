-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'TEMP_SUSPENDED', 'RESTRICTED_LISTING', 'RESTRICTED_BOOKING', 'RESTRICTED_EXPLORE', 'PENDING_REVIEW');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "account_status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "status_reason" TEXT,
ADD COLUMN "status_expires_at" TIMESTAMP(3),
ADD COLUMN "status_updated_at" TIMESTAMP(3),
ADD COLUMN "status_updated_by_id" TEXT,
ADD COLUMN "suspension_count" INTEGER NOT NULL DEFAULT 0;

-- Backfill: existing suspended users get an equivalent AccountStatus so the
-- two fields start in sync (isSuspended stays the source of truth for any
-- reader that hasn't migrated to accountStatus yet).
UPDATE "users" SET "account_status" = 'SUSPENDED' WHERE "is_suspended" = true;

-- CreateTable
CREATE TABLE "user_status_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "previous_status" "AccountStatus" NOT NULL,
    "new_status" "AccountStatus" NOT NULL,
    "reason" TEXT NOT NULL,
    "changed_by_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_impersonations" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "target_user_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "ip_address" TEXT,

    CONSTRAINT "admin_impersonations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_status_history_user_id_idx" ON "user_status_history"("user_id");

-- CreateIndex
CREATE INDEX "admin_impersonations_admin_id_idx" ON "admin_impersonations"("admin_id");

-- CreateIndex
CREATE INDEX "admin_impersonations_target_user_id_idx" ON "admin_impersonations"("target_user_id");

-- AddForeignKey
ALTER TABLE "user_status_history" ADD CONSTRAINT "user_status_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_status_history" ADD CONSTRAINT "user_status_history_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_impersonations" ADD CONSTRAINT "admin_impersonations_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_impersonations" ADD CONSTRAINT "admin_impersonations_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
