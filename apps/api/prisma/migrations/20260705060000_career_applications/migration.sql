-- CreateEnum
CREATE TYPE "DegreeStatus" AS ENUM ('PURSUING', 'COMPLETED');

-- CreateTable
CREATE TABLE "career_applications" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "resume_url" TEXT NOT NULL,
    "institute" TEXT NOT NULL,
    "course_or_degree" TEXT NOT NULL,
    "degree_status" "DegreeStatus" NOT NULL,
    "graduation_year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_applications_pkey" PRIMARY KEY ("id")
);
