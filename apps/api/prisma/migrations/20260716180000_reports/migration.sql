-- User-flagged profiles/listings — the "Report" button on every detail page
-- was a dead stub with no backend at all. targetId is deliberately not a
-- real FK (stays generic across every ReviewTargetType, and a resolved
-- report stays queryable even if the target is later deleted).

CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');

CREATE TABLE "reports" (
  "id" TEXT NOT NULL,
  "reporter_id" TEXT NOT NULL,
  "target_type" "ReviewTargetType" NOT NULL,
  "target_id" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reports" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "reports" FROM anon;
REVOKE ALL ON "reports" FROM authenticated;
