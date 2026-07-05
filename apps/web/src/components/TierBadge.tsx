import { getTier } from '@/lib/gamification';

interface Props {
  completedJobs: number;
  rating: number;
  size?: 'sm' | 'md';
}

export default function TierBadge({ completedJobs, rating, size = 'sm' }: Props) {
  const tier = getTier(completedJobs, rating);
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      title={tier.description}
      className={`inline-flex items-center gap-1 font-semibold rounded-full border ${sizeClass} ${tier.color} ${tier.borderColor}`}
    >
      {tier.emoji} {tier.label}
    </span>
  );
}
