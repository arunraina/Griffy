export default function SeasonalBanner({ banner }: { banner: { emoji: string; title: string; body: string } }) {
  return (
    <div className="bg-[#FAEEE9] border border-[#E8C4B0] rounded-2xl p-4 flex items-start gap-3">
      <span className="text-2xl shrink-0">{banner.emoji}</span>
      <div>
        <p className="text-sm font-bold text-[#9E3F24]">{banner.title}</p>
        <p className="text-xs text-[#6B5248] mt-0.5">{banner.body}</p>
      </div>
    </div>
  );
}
