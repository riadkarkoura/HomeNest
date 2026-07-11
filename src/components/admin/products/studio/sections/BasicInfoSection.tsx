"use client";

import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import StudioSection from "../StudioSection";
import FormField from "../FormField";
import { slugify, type ProductDraft } from "../types";

interface Props {
  draft: ProductDraft;
  onChange: (patch: Partial<ProductDraft>) => void;
  slugTouched: boolean;
  onSlugTouched: () => void;
}

export default function BasicInfoSection({ draft, onChange, slugTouched, onSlugTouched }: Props) {
  return (
    <StudioSection icon={Info} title="Basic Information" description="The essentials every product needs.">
      <FormField label="Product title" htmlFor="title" required>
        <Input
          id="title"
          value={draft.title}
          onChange={(e) => {
            const title = e.target.value;
            onChange(slugTouched ? { title } : { title, slug: slugify(title) });
          }}
          placeholder="Silicone Sink Splash Guard"
        />
      </FormField>

      <FormField label="Slug" htmlFor="slug" hint="Used in the product URL — auto-generated from the title until edited.">
        <div className="flex items-center rounded-lg border border-stone-200 pl-2.5 text-sm text-stone-400 transition-colors focus-within:border-stone-400">
          <span className="whitespace-nowrap">/products/</span>
          <Input
            id="slug"
            value={draft.slug}
            onChange={(e) => {
              onSlugTouched();
              onChange({ slug: slugify(e.target.value) });
            }}
            placeholder="silicone-sink-splash-guard"
            className="border-0 pl-1 shadow-none focus-visible:ring-0"
          />
        </div>
      </FormField>

      <FormField label="Short description" htmlFor="shortDescription" hint="One or two sentences — shown on product cards.">
        <Textarea
          id="shortDescription"
          value={draft.shortDescription}
          onChange={(e) => onChange({ shortDescription: e.target.value })}
          placeholder="Stops water splash before it reaches your wall or countertop."
          rows={2}
        />
      </FormField>
    </StudioSection>
  );
}
