export type UserRole = 'CUSTOMER' | 'SERVICE_PROVIDER' | 'MATERIAL_SELLER' | 'ADMIN';

export interface User {
  id: string;
  supabaseId: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}
