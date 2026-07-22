import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

type HierarchyUser = Pick<User, 'id' | 'adminRole'>;

// Central place for "who can act on whom" across the admin panel — status
// changes, impersonation, and (eventually) deletion. Deliberately separate
// from AdminService.setAdminRole's own rules: granting an admin *tier*
// (Content Moderator -> Admin, say) is a narrower, already-shipped decision
// that a regular Admin is trusted to make, whereas suspending/impersonating/
// deleting a fellow admin is not — so this is intentionally the blunter of
// the two rule sets.
@Injectable()
export class AdminHierarchyService {
  // A Super Admin is untouchable by anyone but another Super Admin.
  isProtected(user: HierarchyUser): boolean {
    return user.adminRole === 'SUPER_ADMIN';
  }

  // Can `actor` administratively act on `target` (status changes,
  // impersonation, deletion)?
  //   SUPER_ADMIN -> can manage everyone but nobody can manage themselves
  //   ADMIN       -> can manage non-admin users only (not other admin tiers,
  //                  not Super Admin)
  //   anyone else -> not an admin at all, can't manage anyone
  canManage(actor: HierarchyUser, target: HierarchyUser): boolean {
    if (actor.id === target.id) return false;
    if (actor.adminRole === 'SUPER_ADMIN') return true;
    if (!actor.adminRole) return false;
    return !target.adminRole;
  }

  // Suspension/restriction follows the same rule as canManage.
  canSuspend(actor: HierarchyUser, target: HierarchyUser): boolean {
    return this.canManage(actor, target);
  }
}
