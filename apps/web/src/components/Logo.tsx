import { BRAND_NAME, TAGLINE } from '@/lib/brand';

interface IconProps {
  size?: number;
  color?: string;
  doorColor?: string;
  className?: string;
}

// The "Final" mark from the Griffy logo system: a house silhouette with an
// arched doorway punched out — a warm, ownable shape that reads as "home"
// and "building" at a glance, at any size down to a favicon tile.
export function GriffyIcon({ size = 40, color = '#C0593A', doorColor = '#fff', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path d="M50 6 L92 40 L8 40 Z" fill={color} />
      <rect x="8" y="40" width="84" height="52" rx="14" fill={color} />
      <path d="M40 92 L40 68 A10 10 0 0 1 60 68 L60 92 Z" fill={doorColor} />
    </svg>
  );
}

interface LogoProps {
  size?: number;
  tagline?: boolean;
  wordmarkClassName?: string;
  className?: string;
}

export default function Logo({ size = 40, tagline = false, wordmarkClassName, className }: LogoProps) {
  const wordmark = (
    <div className="flex items-center gap-2.5">
      <GriffyIcon size={size} />
      <span
        className={wordmarkClassName ?? 'text-[#2C1810] font-bold tracking-tight'}
        style={{ fontFamily: 'Georgia, serif', fontSize: size * 0.65 }}
      >
        {BRAND_NAME}
      </span>
    </div>
  );

  if (!tagline) return <div className={`inline-flex ${className ?? ''}`}>{wordmark}</div>;

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className ?? ''}`}>
      {wordmark}
      <span className="text-[#A08070] text-xs font-medium tracking-wide">{TAGLINE}</span>
    </div>
  );
}
