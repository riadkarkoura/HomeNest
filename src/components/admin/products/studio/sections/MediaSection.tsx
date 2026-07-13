"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Film, X } from "lucide-react";
import StudioSection from "../StudioSection";
import type { ProductDraft } from "../types";
import { uploadProductImage } from "@/app/admin/products/media-actions";

interface Props {
  draft: ProductDraft;
  onChange: (patch: Partial<ProductDraft>) => void;
}

function VideoDropzone() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
        <Film className="h-5 w-5 text-stone-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-stone-700">Drag and drop a video</p>
        <p className="mt-0.5 text-xs text-stone-400">MP4, up to 50MB</p>
      </div>
      <span className="mt-1 inline-flex items-center rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-stone-400">
        Coming soon
      </span>
    </div>
  );
}

// Image upload is real (Sprint 6.1 remaining); video stays a placeholder —
// product_videos is a separate table/sprint, not part of this pass.
export default function MediaSection({ draft, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const uploadFiles = async (files: FileList | File[]) => {
    setError(null);
    for (const file of Array.from(files)) {
      setUploading(true);
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadProductImage(formData);
      setUploading(false);

      if (!result.ok || !result.image) {
        setError(result.message ?? "Upload failed. Please try again.");
        continue;
      }
      onChange({ images: [...draft.images, result.image] });
    }
  };

  const removeImage = (index: number) => {
    onChange({ images: draft.images.filter((_, i) => i !== index) });
  };

  return (
    <StudioSection icon={ImagePlus} title="Media" description="The first image is the product's thumbnail everywhere it appears.">
      {draft.images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {draft.images.map((image, index) => (
            <div key={image.id ?? image.url} className="group relative aspect-square overflow-hidden rounded-xl bg-stone-100">
              <Image src={image.url} alt="" fill sizes="120px" className="object-cover" />
              {index === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-stone-950/80 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-white">
                  Primary
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                aria-label="Remove image"
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-stone-950/70 text-white opacity-0 transition-opacity hover:bg-stone-950 group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) uploadFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
        }}
        className={`group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
          dragOver ? "border-amber-400 bg-amber-50/50" : "border-stone-200 bg-stone-50 hover:border-amber-300 hover:bg-amber-50/30"
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm transition-colors group-hover:bg-amber-100">
          <ImagePlus className="h-5 w-5 text-stone-400 transition-colors group-hover:text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-stone-700">{uploading ? "Uploading…" : "Drag and drop images"}</p>
          <p className="mt-0.5 text-xs text-stone-400">PNG, JPG, WebP, or AVIF, up to 10MB</p>
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}

      <VideoDropzone />
    </StudioSection>
  );
}
