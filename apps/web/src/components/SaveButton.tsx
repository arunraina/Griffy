'use client';

import { useSaved, type SavedType } from '@/context/SavedContext';

interface Props {
  type: SavedType;
  id: string;
  title: string;
  subtitle: string;
  href: string;
  emoji: string;
  className?: string;
}

export default function SaveButton({ type, id, title, subtitle, href, emoji, className = '' }: Props) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(type, id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle({ type, id, title, subtitle, href, emoji });
      }}
      title={saved ? 'Remove from saved' : 'Save'}
      aria-label={saved ? 'Remove from saved' : 'Save'}
      className={`px-3 py-2 text-sm border rounded-xl transition-colors ${
        saved
          ? 'text-[#C0593A] border-[#C0593A] bg-[#FAEEE9]'
          : 'text-gray-400 border-gray-100 hover:text-[#C0593A] hover:border-[#E8C4B0]'
      } ${className}`}
    >
      {saved ? '♥' : '♡'}
    </button>
  );
}
