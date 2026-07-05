-- AlterTable
ALTER TABLE "reviews" ADD COLUMN "is_hidden" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "reviews" ADD COLUMN "is_demoted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "reviews" ADD COLUMN "moderation_note" TEXT;

-- AlterTable
ALTER TABLE "lands" ADD COLUMN "is_hidden" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "lands" ADD COLUMN "is_demoted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "lands" ADD COLUMN "moderation_note" TEXT;

-- AlterTable
ALTER TABLE "properties" ADD COLUMN "is_hidden" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "properties" ADD COLUMN "is_demoted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "properties" ADD COLUMN "moderation_note" TEXT;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN "is_hidden" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "projects" ADD COLUMN "is_demoted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "projects" ADD COLUMN "moderation_note" TEXT;

-- AlterTable
ALTER TABLE "materials" ADD COLUMN "is_hidden" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "materials" ADD COLUMN "is_demoted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "materials" ADD COLUMN "moderation_note" TEXT;
