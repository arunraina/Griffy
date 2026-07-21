-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'CONTENT_MODERATOR', 'KYC_MODERATOR', 'HR');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "admin_role" "AdminRole";

-- Backfill: existing ADMIN-role users keep full access under the new
-- section-permission system instead of being locked out.
UPDATE "users" SET "admin_role" = 'SUPER_ADMIN' WHERE "role" = 'ADMIN';
