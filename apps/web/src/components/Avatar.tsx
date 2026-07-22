import Image from 'next/image';

function initialsOf(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'w-9 h-9 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-20 h-20 text-2xl',
  xl: 'w-24 h-24 text-3xl',
};

export default function Avatar({
  name, avatarUrl, size = 'md', className = '',
}: {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const base = `${SIZE_CLASSES[size]} rounded-full shrink-0 overflow-hidden ${className}`;

  if (avatarUrl) {
    return (
      <div className={`${base} relative`}>
        <Image src={avatarUrl} alt={name} fill sizes="96px" className="object-cover" />
      </div>
    );
  }

  return (
    <div className={`${base} bg-[#C0593A] text-white font-bold flex items-center justify-center`}>
      {initialsOf(name || '?')}
    </div>
  );
}
