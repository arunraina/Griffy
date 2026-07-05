-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "kyc_details" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "aadhaar_number" TEXT,
    "pan_number" TEXT,
    "gst_number" TEXT,
    "business_name" TEXT,
    "bank_account_number" TEXT,
    "bank_ifsc" TEXT,
    "bank_account_holder_name" TEXT,
    "pan_card_url" TEXT,
    "bank_proof_url" TEXT,
    "status" "KycStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "rejection_reason" TEXT,
    "submitted_at" TIMESTAMP(3),
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kyc_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kyc_details_user_id_key" ON "kyc_details"("user_id");

-- AddForeignKey
ALTER TABLE "kyc_details" ADD CONSTRAINT "kyc_details_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
