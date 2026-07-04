"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { saveItem, unsaveItem, isSaved, SavedType } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Props {
  type: SavedType;
  targetId: string;
  className?: string;
}

export default function SaveButton({ type, targetId, className = "" }: Props) {
  const { isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    isSaved(type, targetId).then(setSaved).catch(() => undefined);
  }, [isAuthenticated, type, targetId]);

  if (!isAuthenticated) return null;

  async function toggle() {
    if (loading) return;
    setLoading(true);
    try {
      if (saved) {
        await unsaveItem(type, targetId);
        setSaved(false);
      } else {
        await saveItem(type, targetId);
        setSaved(true);
      }
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={saved ? "Remove from saved" : "Save"}
      className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
        saved
          ? "text-orange-500 hover:text-orange-400"
          : "text-stone-500 hover:text-orange-500"
      } ${className}`}
    >
      <Bookmark className={`w-4 h-4 ${saved ? "fill-orange-500" : ""}`} />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
