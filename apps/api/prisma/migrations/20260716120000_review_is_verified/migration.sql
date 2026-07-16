-- Phase 8, Part A: verified reviews. Marks a review as backed by a real
-- completed booking or paid order between the reviewer and the target,
-- rather than just any logged-in user's say-so.

ALTER TABLE "reviews" ADD COLUMN "is_verified" BOOLEAN NOT NULL DEFAULT false;
