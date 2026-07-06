-- Notification system rework: multi-channel (in-app/WhatsApp/email) fan-out.

CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'WHATSAPP', 'EMAIL');
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

ALTER TABLE "notifications" RENAME COLUMN "message" TO "body";
ALTER TABLE "notifications" RENAME COLUMN "link" TO "link_url";
ALTER TABLE "notifications" RENAME COLUMN "read" TO "is_read";

-- `type` becomes a free-string event key so new events never need a migration.
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE TEXT USING "type"::TEXT;
DROP TYPE "NotificationType";

-- Existing rows were all synchronously-created in-app notifications that
-- already "sent" successfully — IN_APP/SENT is the correct backfill value.
ALTER TABLE "notifications" ADD COLUMN "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP';
ALTER TABLE "notifications" ADD COLUMN "status" "NotificationStatus" NOT NULL DEFAULT 'SENT';

CREATE INDEX "notifications_user_id_channel_idx" ON "notifications"("user_id", "channel");

ALTER TABLE "users" ADD COLUMN "notification_prefs" JSONB;
