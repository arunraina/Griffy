export type ReviewTargetType = 'SERVICE_PROVIDER' | 'MATERIAL';

export interface Review {
  id: string;
  reviewerId: string;
  targetType: ReviewTargetType;
  rating: number;
  comment?: string;
  serviceProviderId?: string;
  materialId?: string;
  createdAt: string;
  updatedAt: string;
}
