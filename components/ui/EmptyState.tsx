import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({ icon: Icon, emoji, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`bg-white rounded-2xl border border-stone-100 shadow-sm p-12 text-center ${className}`}>
      {Icon && <Icon className="w-12 h-12 text-stone-300 mx-auto mb-4" />}
      {emoji && <p className="text-4xl mb-4">{emoji}</p>}
      <p className="font-semibold text-stone-700 mb-1">{title}</p>
      {description && <p className="text-stone-400 text-sm mb-5">{description}</p>}
      {action}
    </div>
  );
}
