-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('HOMEOWNER', 'CONTRACTOR', 'LABOUR', 'SERVICE_EXPERT', 'MATERIAL_SUPPLIER', 'LAND_OWNER', 'PROPERTY_SELLER', 'BUILDER', 'PROPERTY_AGENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReviewTargetType" AS ENUM ('CONTRACTOR', 'LABOUR', 'SERVICE_EXPERT', 'MATERIAL_SUPPLIER', 'BUILDER', 'PROPERTY_AGENT', 'MATERIAL', 'LAND', 'PROPERTY');

-- CreateEnum
CREATE TYPE "LandType" AS ENUM ('AGRICULTURAL', 'RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'MIXED');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL', 'INDEPENDENT_HOUSE');

-- CreateEnum
CREATE TYPE "FurnishingStatus" AS ENUM ('UNFURNISHED', 'SEMI_FURNISHED', 'FULLY_FURNISHED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractor_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "contractor_type" TEXT NOT NULL,
    "trade_skills" TEXT[],
    "experience" TEXT NOT NULL,
    "service_cities" TEXT[],
    "license_number" TEXT,
    "daily_rate" DECIMAL(10,2),
    "project_rate" DECIMAL(10,2),
    "availability" BOOLEAN NOT NULL DEFAULT true,
    "bio" TEXT,
    "portfolio_images" TEXT[],
    "approval_status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "approved_at" TIMESTAMP(3),
    "approved_by" TEXT,
    "avg_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "total_jobs" INTEGER NOT NULL DEFAULT 0,
    "completion_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "labour_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "skill_type" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "service_cities" TEXT[],
    "daily_rate" DECIMAL(10,2),
    "availability" BOOLEAN NOT NULL DEFAULT true,
    "bio" TEXT,
    "portfolio_images" TEXT[],
    "approval_status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "approved_at" TIMESTAMP(3),
    "approved_by" TEXT,
    "avg_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "labour_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_expert_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expertise_type" TEXT NOT NULL,
    "qualifications" TEXT[],
    "experience" TEXT NOT NULL,
    "service_cities" TEXT[],
    "consultation_fee" DECIMAL(10,2),
    "availability" BOOLEAN NOT NULL DEFAULT true,
    "bio" TEXT,
    "portfolio_images" TEXT[],
    "approval_status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "approved_at" TIMESTAMP(3),
    "approved_by" TEXT,
    "avg_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_expert_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_supplier_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "gst_number" TEXT,
    "business_address" TEXT NOT NULL,
    "delivery_cities" TEXT[],
    "approval_status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "approved_at" TIMESTAMP(3),
    "approved_by" TEXT,
    "avg_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_supplier_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "land_owner_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "govt_id_verified" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "approval_status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "approved_at" TIMESTAMP(3),
    "approved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "land_owner_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_seller_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "govt_id_verified" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "approval_status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "approved_at" TIMESTAMP(3),
    "approved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_seller_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "builder_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "registration_number" TEXT,
    "specializations" TEXT[],
    "completed_projects" INTEGER NOT NULL DEFAULT 0,
    "service_cities" TEXT[],
    "bio" TEXT,
    "portfolio_images" TEXT[],
    "approval_status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "approved_at" TIMESTAMP(3),
    "approved_by" TEXT,
    "avg_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "builder_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_agent_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "agency_name" TEXT,
    "license_number" TEXT,
    "service_cities" TEXT[],
    "bio" TEXT,
    "approval_status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "approved_at" TIMESTAMP(3),
    "approved_by" TEXT,
    "avg_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_agent_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "image_urls" TEXT[],
    "avg_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "shipping_address" TEXT,
    "notes" TEXT,
    "razorpay_order_id" TEXT,
    "razorpay_payment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "provider_role" "UserRole" NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "razorpay_order_id" TEXT,
    "razorpay_payment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lands" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "land_type" "LandType" NOT NULL,
    "area_sq_ft" DECIMAL(12,2) NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "location" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "image_urls" TEXT[],
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "property_type" "PropertyType" NOT NULL,
    "furnishing" "FurnishingStatus" NOT NULL,
    "area_sq_ft" DECIMAL(12,2) NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "location" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "image_urls" TEXT[],
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "target_type" "ReviewTargetType" NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "contractor_profile_id" TEXT,
    "labour_profile_id" TEXT,
    "service_expert_profile_id" TEXT,
    "material_supplier_profile_id" TEXT,
    "builder_profile_id" TEXT,
    "property_agent_profile_id" TEXT,
    "material_id" TEXT,
    "land_id" TEXT,
    "property_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_otps" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "contractor_profiles_user_id_key" ON "contractor_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "labour_profiles_user_id_key" ON "labour_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_expert_profiles_user_id_key" ON "service_expert_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "material_supplier_profiles_user_id_key" ON "material_supplier_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "land_owner_profiles_user_id_key" ON "land_owner_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_seller_profiles_user_id_key" ON "property_seller_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "builder_profiles_user_id_key" ON "builder_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_agent_profiles_user_id_key" ON "property_agent_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "contractor_profiles" ADD CONSTRAINT "contractor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labour_profiles" ADD CONSTRAINT "labour_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_expert_profiles" ADD CONSTRAINT "service_expert_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_supplier_profiles" ADD CONSTRAINT "material_supplier_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "land_owner_profiles" ADD CONSTRAINT "land_owner_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_seller_profiles" ADD CONSTRAINT "property_seller_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "builder_profiles" ADD CONSTRAINT "builder_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_agent_profiles" ADD CONSTRAINT "property_agent_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "material_supplier_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lands" ADD CONSTRAINT "lands_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "land_owner_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "property_seller_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_contractor_profile_id_fkey" FOREIGN KEY ("contractor_profile_id") REFERENCES "contractor_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_labour_profile_id_fkey" FOREIGN KEY ("labour_profile_id") REFERENCES "labour_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_service_expert_profile_id_fkey" FOREIGN KEY ("service_expert_profile_id") REFERENCES "service_expert_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_material_supplier_profile_id_fkey" FOREIGN KEY ("material_supplier_profile_id") REFERENCES "material_supplier_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_builder_profile_id_fkey" FOREIGN KEY ("builder_profile_id") REFERENCES "builder_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_property_agent_profile_id_fkey" FOREIGN KEY ("property_agent_profile_id") REFERENCES "property_agent_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_land_id_fkey" FOREIGN KEY ("land_id") REFERENCES "lands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
