-- CreateTable
CREATE TABLE "early_access_signups" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "interest" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "early_access_signups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "early_access_signups_email_key" ON "early_access_signups"("email");
