"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  folder?: string;
  label?: string;
}

export default function ImageUpload({
  value = [],
  onChange,
  maxFiles = 5,
  folder = "uploads",
  label = "Upload Images",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const remaining = maxFiles - value.length;
      if (remaining <= 0) {
        setError(`Maximum ${maxFiles} image${maxFiles !== 1 ? "s" : ""} allowed.`);
        return;
      }
      const toUpload = Array.from(files).slice(0, remaining);
      setUploading(true);
      setError("");
      const token = typeof window !== "undefined" ? localStorage.getItem("griffy_token") : null;
      const uploaded: string[] = [];
      for (const file of toUpload) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 10 * 1024 * 1024) {
          setError("Each image must be under 10 MB.");
          continue;
        }
        try {
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch(`${BASE}/upload/file?folder=${folder}`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: fd,
          });
          if (!res.ok) throw new Error("Upload failed");
          const { url } = await res.json();
          uploaded.push(url);
        } catch {
          // Show local preview as fallback (dev without S3)
          const reader = new FileReader();
          await new Promise<void>((resolve) => {
            reader.onload = () => {
              uploaded.push(reader.result as string);
              resolve();
            };
            reader.readAsDataURL(file);
          });
        }
      }
      onChange([...value, ...uploaded]);
      setUploading(false);
    },
    [value, onChange, maxFiles, folder],
  );

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-3">
      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {value.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-stone-200">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {value.length < maxFiles && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-6 cursor-pointer transition-all select-none ${dragOver ? "border-orange-400 bg-orange-50" : "border-stone-200 hover:border-orange-300 hover:bg-orange-50/30"}`}
        >
          {uploading ? (
            <Loader2 className="w-7 h-7 text-orange-400 animate-spin" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Upload className="w-5 h-5 text-orange-500" />
            </div>
          )}
          <div className="text-center">
            <p className="text-sm font-semibold text-stone-700">
              {uploading ? "Uploading…" : label}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">
              Drag & drop or click · JPG, PNG, WEBP · Max 10 MB each
            </p>
            <p className="text-xs text-stone-400">{value.length}/{maxFiles} uploaded</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={maxFiles > 1}
            className="hidden"
            onChange={(e) => upload(e.target.files)}
          />
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
