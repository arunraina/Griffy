-- AlterTable
ALTER TABLE "materials" ADD COLUMN "room_types" TEXT[] DEFAULT ARRAY[]::TEXT[];
