-- CTO optimization pass, Part 3A -- indexes grounded in the actual WHERE
-- clauses used by contractor-profiles/labour-profiles/service-expert-profiles/
-- materials/bookings/orders services, not assumed schema. Notably:
--   * ContractorProfile/LabourProfile/ServiceExpertProfile have no scalar
--     "city" column -- location is service_cities (array), filtered via
--     containment, hence the GIN indexes below rather than plain btree.
--   * Material has no "in_stock" boolean (never filtered on today) -- the
--     real listing filter is category + subcategory.

-- CreateIndex
CREATE INDEX "contractor_profiles_approval_status_is_available_idx" ON "contractor_profiles"("approval_status", "is_available");

-- CreateIndex
CREATE INDEX "contractor_profiles_service_cities_idx" ON "contractor_profiles" USING GIN ("service_cities");

-- CreateIndex
CREATE INDEX "labour_profiles_approval_status_is_available_idx" ON "labour_profiles"("approval_status", "is_available");

-- CreateIndex
CREATE INDEX "labour_profiles_service_cities_idx" ON "labour_profiles" USING GIN ("service_cities");

-- CreateIndex
CREATE INDEX "service_expert_profiles_approval_status_is_available_idx" ON "service_expert_profiles"("approval_status", "is_available");

-- CreateIndex
CREATE INDEX "service_expert_profiles_service_cities_idx" ON "service_expert_profiles" USING GIN ("service_cities");

-- CreateIndex
CREATE INDEX "materials_category_subcategory_idx" ON "materials"("category", "subcategory");

-- CreateIndex
CREATE INDEX "bookings_customer_id_status_idx" ON "bookings"("customer_id", "status");

-- CreateIndex
CREATE INDEX "bookings_provider_id_status_idx" ON "bookings"("provider_id", "status");

-- CreateIndex
CREATE INDEX "orders_buyer_id_idx" ON "orders"("buyer_id");

-- CreateIndex
CREATE INDEX "orders_payment_status_created_at_idx" ON "orders"("payment_status", "created_at");
