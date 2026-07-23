-- CreateEnum
CREATE TYPE "EnquiryTargetType" AS ENUM ('PROPERTY', 'LAND');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'SITE_VISIT', 'NEGOTIATING', 'CLOSED');

-- AlterTable
ALTER TABLE "properties" ADD COLUMN "view_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "lands" ADD COLUMN "view_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "enquiries" (
    "id" TEXT NOT NULL,
    "enquirer_id" TEXT NOT NULL,
    "target_type" "EnquiryTargetType" NOT NULL,
    "property_id" TEXT,
    "land_id" TEXT,
    "message" TEXT NOT NULL,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "enquiries_property_id_idx" ON "enquiries"("property_id");

-- CreateIndex
CREATE INDEX "enquiries_land_id_idx" ON "enquiries"("land_id");

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_enquirer_id_fkey" FOREIGN KEY ("enquirer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_land_id_fkey" FOREIGN KEY ("land_id") REFERENCES "lands"("id") ON DELETE CASCADE ON UPDATE CASCADE;
