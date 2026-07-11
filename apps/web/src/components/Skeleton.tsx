export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-[#EBE0D8]/60 rounded ${className}`} />;
}

export function SkeletonProfileCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4 border border-gray-100">
      <div className="flex items-start gap-3">
        <Skeleton className="w-11 h-11 rounded-xl flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-3.5 w-2/3 rounded-md" />
          <Skeleton className="h-3 w-1/3 rounded-md" />
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-20 rounded-md" />
        <Skeleton className="h-5 w-14 rounded-md" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-4 w-20 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonMediaCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#EBE0D8] overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <Skeleton className="h-3 w-1/2 rounded-md" />
        </div>
        <Skeleton className="h-5 w-1/3 rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-14 rounded-md" />
          <Skeleton className="h-4 w-14 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCardGrid({
  variant = 'profile', count = 6,
}: { variant?: 'profile' | 'media'; count?: number }) {
  const Card = variant === 'profile' ? SkeletonProfileCard : SkeletonMediaCard;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => <Card key={i} />)}
    </div>
  );
}

export function SkeletonListRow() {
  return (
    <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-4 flex items-center gap-4">
      <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-1/2 rounded-md" />
        <Skeleton className="h-3 w-1/3 rounded-md" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full flex-shrink-0" />
    </div>
  );
}

export function SkeletonListRows({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => <SkeletonListRow key={i} />)}
    </div>
  );
}

export function SkeletonDetailPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-start gap-4 mb-8">
          <Skeleton className="w-20 h-20 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-3 pt-1">
            <Skeleton className="h-5 w-1/2 rounded-md" />
            <Skeleton className="h-3.5 w-1/3 rounded-md" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex gap-6 items-start">
          <div className="flex-1 space-y-6 min-w-0">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
          <div className="hidden lg:block w-80 flex-shrink-0">
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
