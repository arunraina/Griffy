// Mirrors packages/shared/src/types/user-state.ts (`UserState`/`ProfileStatus`)
// exactly. Not imported from @griffy/shared: apps/api's tsconfig sets a real
// `rootDir`/`outDir` (tsc actually emits build output here, unlike the web
// app's `noEmit` setup), and the shared package lives outside that rootDir —
// importing it fails the build. Keep both copies in sync if this shape changes.
import { UserRole } from '@prisma/client';

export type ProfileStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface UserState {
  isLoggedIn: boolean;
  role: UserRole | null;

  hasProfile: boolean;
  profileStatus: ProfileStatus;
  isFirstLogin: boolean;
  profileCompleteness: number;

  hasBookings: boolean;
  hasOrders: boolean;
  hasProjects: boolean;
  activeBookingsCount: number;
  activeOrdersCount: number;
  pendingJobsCount: number;

  totalCompletedJobs: number;
  totalSpent: number;
  totalEarned: number;
  hasReviews: boolean;
  badges: string[];

  city: string | null;
  preferredCategories: string[];
}
