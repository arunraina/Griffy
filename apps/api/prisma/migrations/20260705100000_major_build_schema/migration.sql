-- Data fix: normalize blank-string phones to NULL before adding the unique
-- constraint (3 existing rows have phone = '' rather than NULL).
UPDATE "users" SET "phone" = NULL WHERE "phone" = '';

-- AlterTable: User — suspension, first-party flag, ghost-profile support,
-- unique phone (needed so a ghost profile can later be claimed by phone
-- match on first real login).
ALTER TABLE "users" ADD COLUMN "is_suspended" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "is_first_party" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "is_ghost" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "created_by_admin_id" TEXT;
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- Rename availability -> is_available for consistency across all 8
-- supply-side profiles (5 others get the column added fresh below).
ALTER TABLE "contractor_profiles" RENAME COLUMN "availability" TO "is_available";
ALTER TABLE "labour_profiles" RENAME COLUMN "availability" TO "is_available";
ALTER TABLE "service_expert_profiles" RENAME COLUMN "availability" TO "is_available";

-- AlterTable: add is_available to the 5 profiles that never had it.
ALTER TABLE "material_supplier_profiles" ADD COLUMN "is_available" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "land_owner_profiles" ADD COLUMN "is_available" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "property_seller_profiles" ADD COLUMN "is_available" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "builder_profiles" ADD COLUMN "is_available" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "property_agent_profiles" ADD COLUMN "is_available" BOOLEAN NOT NULL DEFAULT true;

-- AlterEnum: OrderStatus — rename existing values, add two new ones.
-- No existing orders in the DB at migration time, but rename (not
-- drop/recreate) keeps this safe even if that changes before this runs.
ALTER TYPE "OrderStatus" ADD VALUE 'REJECTED';
ALTER TYPE "OrderStatus" ADD VALUE 'PACKED';
ALTER TYPE "OrderStatus" RENAME VALUE 'PENDING' TO 'PLACED';
ALTER TYPE "OrderStatus" RENAME VALUE 'CONFIRMED' TO 'ACCEPTED';

-- AlterTable: Order — status default now PLACED, add statusUpdatedAt.
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PLACED';
ALTER TABLE "orders" ADD COLUMN "status_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable: OrderStatusEvent — per-order status change history.
CREATE TABLE "order_status_events" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_events_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "order_status_events" ADD CONSTRAINT "order_status_events_order_id_fkey"
    FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: Banner — homepage promotional banners.
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "link_url" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateEnum: TurnkeyProjectType, TurnkeyProjectStatus
CREATE TYPE "TurnkeyProjectType" AS ENUM ('TURNKEY', 'LAND_PLOTTING');
CREATE TYPE "TurnkeyProjectStatus" AS ENUM ('REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable: TurnkeyProject
CREATE TABLE "turnkey_projects" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "provider_id" TEXT,
    "type" "TurnkeyProjectType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budget" DECIMAL(12,2) NOT NULL,
    "status" "TurnkeyProjectStatus" NOT NULL DEFAULT 'REQUESTED',
    "start_date" TIMESTAMP(3),
    "target_end_date" TIMESTAMP(3),
    "percent_complete" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turnkey_projects_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "turnkey_projects" ADD CONSTRAINT "turnkey_projects_customer_id_fkey"
    FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "turnkey_projects" ADD CONSTRAINT "turnkey_projects_provider_id_fkey"
    FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: TurnkeyProjectUpdate
CREATE TABLE "turnkey_project_updates" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "percent_complete" INTEGER NOT NULL,
    "image_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "turnkey_project_updates_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "turnkey_project_updates" ADD CONSTRAINT "turnkey_project_updates_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "turnkey_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
