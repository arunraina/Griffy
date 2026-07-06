-- Phase 4, Part A: Razorpay webhooks as source of truth.

CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'FAILED', 'REFUND_INITIATED', 'REFUNDED');

ALTER TABLE "orders" ADD COLUMN "payment_status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID';

-- Existing orders that already have a razorpay_payment_id were captured
-- under the pre-webhook flow — backfill them as PAID so historical data
-- stays consistent with the new field's meaning.
UPDATE "orders" SET "payment_status" = 'PAID' WHERE "razorpay_payment_id" IS NOT NULL;

CREATE TABLE "payment_events" (
  "id" TEXT NOT NULL,
  "razorpay_event_id" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "razorpay_order_id" TEXT NOT NULL,
  "razorpay_payment_id" TEXT,
  "payload_json" JSONB NOT NULL,
  "processed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "payment_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payment_events_razorpay_event_id_key" ON "payment_events"("razorpay_event_id");
CREATE INDEX "payment_events_razorpay_order_id_idx" ON "payment_events"("razorpay_order_id");

-- New table created after the Security Phase 1 RLS lockdown — that
-- migration only covered tables existing at the time, so this needs its
-- own enable + grant revoke to stay deny-by-default for anon/authenticated.
ALTER TABLE "payment_events" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "payment_events" FROM anon;
REVOKE ALL ON "payment_events" FROM authenticated;
