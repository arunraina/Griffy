-- CreateEnum
CREATE TYPE "PriceUnit" AS ENUM ('FIXED', 'PER_HOUR', 'PER_DAY', 'PER_POINT', 'PER_SQFT', 'PER_VISIT');

-- AlterTable
ALTER TABLE "materials" ADD COLUMN "delivery_note" TEXT,
ADD COLUMN "min_order_qty" INTEGER;

-- CreateTable
CREATE TABLE "service_items" (
    "id" TEXT NOT NULL,
    "profile_type" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "price_unit" "PriceUnit" NOT NULL,
    "category" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_action_logs" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_action_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_items_profile_type_profile_id_idx" ON "service_items"("profile_type", "profile_id");

-- CreateIndex
CREATE INDEX "admin_action_logs_target_type_target_id_idx" ON "admin_action_logs"("target_type", "target_id");
