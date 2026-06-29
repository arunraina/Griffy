export interface ServiceProvider {
  id: string;
  userId: string;
  category: string;
  description?: string;
  location: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
