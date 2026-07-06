-- Phase 4, Part B: refund flow.

CREATE TYPE "RefundStatus" AS ENUM ('INITIATED', 'PROCESSED', 'FAILED');

CREATE TABLE "refunds" (
  "id" TEXT NOT NULL,
  "order_id" TEXT NOT NULL,
  "razorpay_refund_id" TEXT,
  "amount" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "status" "RefundStatus" NOT NULL DEFAULT 'INITIATED',
  "initiated_by_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processed_at" TIMESTAMP(3),

  CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "refunds_order_id_idx" ON "refunds"("order_id");

ALTER TABLE "refunds" ADD CONSTRAINT "refunds_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_initiated_by_id_fkey" FOREIGN KEY ("initiated_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- New table created after the Security Phase 1 RLS lockdown — needs its own
-- enable + grant revoke to stay deny-by-default for anon/authenticated.
ALTER TABLE "refunds" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "refunds" FROM anon;
REVOKE ALL ON "refunds" FROM authenticated;
