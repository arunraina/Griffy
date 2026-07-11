import { Skeleton, SkeletonCardGrid } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-7 w-56 rounded-md" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl mb-6" />
        <SkeletonCardGrid variant="profile" count={6} />
      </div>
    </div>
  );
}
