import { getBadges } from '@/lib/gamification';

interface Props {
  verified: boolean;
  completedJobs: number;
  rating: number;
  reviewCount: number;
  size?: 'sm' | 'md';
}

export default function BadgeRow({ verified, completedJobs, rating, reviewCount, size = 'sm' }: Props) {
  const badges = getBadges({ verified, completedJobs, rating, reviewCount });
  if (badges.length === 0) return null;

  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((b) => (
        <span key={b.id} title={b.description}
          className={`inline-flex items-center gap-1 font-semibold rounded-full border bg-white text-[#6B5248] border-[#EBE0D8] ${sizeClass}`}>
          {b.emoji} {b.label}
        </span>
      ))}
    </div>
  );
}
