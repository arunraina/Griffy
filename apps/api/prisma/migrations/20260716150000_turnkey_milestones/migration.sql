-- Phase 8, Part C: milestone-gated payment release for turnkey projects.
-- Not true escrow (Griffy has no licensed escrow account) — work must be
-- submitted and customer-approved, and the provider's KYC must be VERIFIED,
-- before a milestone can be paid via the existing Razorpay flow.

CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'SUBMITTED', 'CHANGES_REQUESTED', 'APPROVED');

CREATE TABLE "turnkey_milestones" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "amount" DECIMAL(12,2) NOT NULL,
  "sequence" INTEGER NOT NULL,
  "status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',
  "changes_requested_note" TEXT,
  "payment_status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
  "razorpay_order_id" TEXT,
  "razorpay_payment_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "turnkey_milestones_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "turnkey_milestones_project_id_sequence_idx" ON "turnkey_milestones"("project_id", "sequence");

ALTER TABLE "turnkey_milestones" ADD CONSTRAINT "turnkey_milestones_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "turnkey_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- New table created after the Security Phase 1 RLS lockdown — needs its own
-- enable + grant revoke to stay deny-by-default for anon/authenticated.
ALTER TABLE "turnkey_milestones" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "turnkey_milestones" FROM anon;
REVOKE ALL ON "turnkey_milestones" FROM authenticated;
