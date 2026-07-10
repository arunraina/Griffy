-- Phase 4, Part C: invoice generation.

CREATE TABLE "invoices" (
  "id" TEXT NOT NULL,
  "invoice_number" TEXT NOT NULL,
  "order_id" TEXT NOT NULL,
  "pdf_url" TEXT,
  "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");
CREATE UNIQUE INDEX "invoices_order_id_key" ON "invoices"("order_id");

ALTER TABLE "invoices" ADD CONSTRAINT "invoices_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backs invoice number generation (GRF/<financial-year>/<seq>) — one
-- monotonic sequence, not reset per financial year. Sufficient for
-- uniqueness/sequentiality; if strict per-FY-reset numbering is needed
-- later, swap this for a small invoice_counters table keyed by FY.
CREATE SEQUENCE "invoice_number_seq" START 1;

-- New table created after the Security Phase 1 RLS lockdown — needs its
-- own enable + grant revoke to stay deny-by-default for anon/authenticated.
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "invoices" FROM anon;
REVOKE ALL ON "invoices" FROM authenticated;
