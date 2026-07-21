// The current Prisma UserRole enum (apps/api/prisma/schema.prisma) — kept as
// a plain string union here since @griffy/shared has no Prisma dependency.
// Not the same as (and more current than) the stale `UserRole` in ./user.ts.
export type AppUserRole =
  | 'HOMEOWNER'
  | 'CONTRACTOR'
  | 'LABOUR'
  | 'SERVICE_EXPERT'
  | 'MATERIAL_SUPPLIER'
  | 'LAND_OWNER'
  | 'PROPERTY_SELLER'
  | 'BUILDER'
  | 'PROPERTY_AGENT'
  | 'ADMIN';

export type ProfileStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

// Drives the state-aware dashboard home (apps/web/src/app/dashboard/home) —
// GET /dashboard/state on the API returns exactly this shape.
export interface UserState {
  // Identity
  isLoggedIn: boolean;
  role: AppUserRole | null;

  // Profile (supply-side roles only; stays false/'NONE'/0 for HOMEOWNER)
  hasProfile: boolean;
  profileStatus: ProfileStatus;
  isFirstLogin: boolean;
  profileCompleteness: number; // 0-100

  // Activity
  hasBookings: boolean;
  hasOrders: boolean;
  hasProjects: boolean;
  activeBookingsCount: number;
  activeOrdersCount: number;
  pendingJobsCount: number; // supply side

  // Engagement
  totalCompletedJobs: number;
  totalSpent: number; // homeowner
  totalEarned: number; // supply side
  hasReviews: boolean;
  badges: string[];

  // Preferences
  city: string | null;
  preferredCategories: string[];
}
