export interface Material {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  stock: number;
  imageUrl?: string;
  sellerId: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}
