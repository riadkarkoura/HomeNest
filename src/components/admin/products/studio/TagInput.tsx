"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  id?: string;
}

export default function TagInput({ value, onChange, placeholder = "Add and press Enter", id }: Props) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const tag = draft.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft("");
  };

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag));

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-stone-200 px-2 py-1.5 transition-colors focus-within:border-stone-400">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            aria-label={`Remove ${tag}`}
            className="text-stone-400 transition-colors hover:text-stone-700"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag();
          } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
            removeTag(value[value.length - 1]);
          }
        }}
        onBlur={addTag}
        placeholder={value.length === 0 ? placeholder : ""}
        className="min-w-[120px] flex-1 bg-transparent py-1 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
      />
    </div>
  );
}
