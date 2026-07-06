-- Security hardening — Phase 1, Part A: Row Level Security lockdown.
--
-- Architecture: the Next.js frontend never queries Supabase/Postgres
-- directly — all data access goes through the NestJS API, which connects
-- via Prisma as the `postgres` role. That role has rolbypassrls = true
-- (confirmed against the live DB before writing this migration), so it is
-- completely unaffected by RLS regardless of how many or how few policies
-- exist. supabase-js in the frontend is used exclusively for auth
-- (OTP/sessions) — confirmed zero `.from()`/`.rpc()`/`.storage.` calls
-- anywhere in apps/web or apps/mobile.
--
-- Therefore this is a deny-by-default lockdown: enable RLS on every table
-- with zero permissive policies for anon/authenticated, and revoke the
-- blanket CRUD grants those roles held by default (Supabase grants
-- anon/authenticated full privileges on every public-schema table
-- automatically unless told otherwise — confirmed anon had
-- SELECT/INSERT/UPDATE/DELETE/TRUNCATE on every table before this ran).
-- With RLS enabled and no policies, all rows are already denied to these
-- roles regardless of table-level grants — the REVOKEs below just remove
-- a misleading signal for anyone auditing grants later without also
-- checking RLS status.

ALTER TABLE "banners" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bids" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bookings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "builder_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "career_applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contractor_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "early_access_signups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "kyc_details" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "labour_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "land_owner_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lands" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "material_supplier_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "materials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_status_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "properties" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "property_agent_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "property_seller_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "service_expert_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "turnkey_project_updates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "turnkey_projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "whatsapp_otps" ENABLE ROW LEVEL SECURITY;

-- Revoke the blanket CRUD grants anon/authenticated held by default.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
