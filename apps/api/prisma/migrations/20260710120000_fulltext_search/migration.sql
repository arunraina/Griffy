-- Phase 6, Part A: Postgres full-text search.
-- Generated/stored tsvector columns + GIN indexes. Each column can only
-- reference its own table's columns (no cross-table joins in a generated
-- column), so professional names (which live on `users`, not the profile
-- tables) aren't included here — name matching is handled via an ILIKE
-- fallback joined against `users.name` at query time instead.
--
-- to_tsvector() is STABLE, not IMMUTABLE, in stock Postgres (its result can
-- in principle change if a text search dictionary is altered), so it can't
-- be used directly in a GENERATED ALWAYS AS ... STORED expression, which
-- requires IMMUTABLE. The standard workaround: wrap it in a same-behavior
-- function explicitly marked IMMUTABLE, fixed to the 'english' config.
CREATE OR REPLACE FUNCTION immutable_english_tsvector(text_input text) RETURNS tsvector AS $$
  SELECT to_tsvector('pg_catalog.english'::regconfig, text_input);
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE;

-- array_to_string() is also STABLE, not IMMUTABLE, in stock Postgres — same
-- wrapper treatment needed for the array columns (trade_skills etc.).
CREATE OR REPLACE FUNCTION immutable_array_to_string(arr text[], sep text) RETURNS text AS $$
  SELECT array_to_string(arr, sep);
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE;

ALTER TABLE "contractor_profiles" ADD COLUMN "search_vector" tsvector
  GENERATED ALWAYS AS (
    immutable_english_tsvector(
      coalesce("contractor_type", '') || ' ' ||
      immutable_array_to_string("trade_skills", ' ') || ' ' ||
      coalesce("experience", '') || ' ' ||
      immutable_array_to_string("service_cities", ' ') || ' ' ||
      coalesce("bio", '')
    )
  ) STORED;
CREATE INDEX "contractor_profiles_search_vector_idx" ON "contractor_profiles" USING GIN ("search_vector");

ALTER TABLE "labour_profiles" ADD COLUMN "search_vector" tsvector
  GENERATED ALWAYS AS (
    immutable_english_tsvector(
      coalesce("skill_type", '') || ' ' ||
      coalesce("experience", '') || ' ' ||
      immutable_array_to_string("service_cities", ' ') || ' ' ||
      coalesce("bio", '')
    )
  ) STORED;
CREATE INDEX "labour_profiles_search_vector_idx" ON "labour_profiles" USING GIN ("search_vector");

ALTER TABLE "service_expert_profiles" ADD COLUMN "search_vector" tsvector
  GENERATED ALWAYS AS (
    immutable_english_tsvector(
      coalesce("expertise_type", '') || ' ' ||
      immutable_array_to_string("qualifications", ' ') || ' ' ||
      coalesce("experience", '') || ' ' ||
      immutable_array_to_string("service_cities", ' ') || ' ' ||
      coalesce("bio", '')
    )
  ) STORED;
CREATE INDEX "service_expert_profiles_search_vector_idx" ON "service_expert_profiles" USING GIN ("search_vector");

ALTER TABLE "materials" ADD COLUMN "search_vector" tsvector
  GENERATED ALWAYS AS (
    immutable_english_tsvector(
      coalesce("name", '') || ' ' ||
      coalesce("category", '') || ' ' ||
      coalesce("subcategory", '') || ' ' ||
      coalesce("description", '')
    )
  ) STORED;
CREATE INDEX "materials_search_vector_idx" ON "materials" USING GIN ("search_vector");

ALTER TABLE "properties" ADD COLUMN "search_vector" tsvector
  GENERATED ALWAYS AS (
    immutable_english_tsvector(
      coalesce("title", '') || ' ' ||
      coalesce("location", '') || ' ' ||
      coalesce("description", '') || ' ' ||
      coalesce("city", '') || ' ' ||
      coalesce("state", '')
    )
  ) STORED;
CREATE INDEX "properties_search_vector_idx" ON "properties" USING GIN ("search_vector");

ALTER TABLE "lands" ADD COLUMN "search_vector" tsvector
  GENERATED ALWAYS AS (
    immutable_english_tsvector(
      coalesce("title", '') || ' ' ||
      coalesce("location", '') || ' ' ||
      coalesce("description", '') || ' ' ||
      coalesce("city", '') || ' ' ||
      coalesce("state", '')
    )
  ) STORED;
CREATE INDEX "lands_search_vector_idx" ON "lands" USING GIN ("search_vector");
