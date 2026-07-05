interface Props {
  emoji: string;
  label: string;
  value: string;
  note?: string;
}

export default function ResultLine({ emoji, label, value, note }: Props) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#F0E8E2] last:border-none">
      <div>
        <p className="text-sm font-medium text-[#3D2B22]">{emoji} {label}</p>
        {note && <p className="text-xs text-[#A08070] mt-0.5">{note}</p>}
      </div>
      <p className="text-sm font-bold text-[#2C1810]">{value}</p>
    </div>
  );
}
