-- AlterTable
ALTER TABLE "service_expert_profiles" ADD COLUMN "total_jobs" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "material_supplier_profiles" ADD COLUMN "total_orders" INTEGER NOT NULL DEFAULT 0;
