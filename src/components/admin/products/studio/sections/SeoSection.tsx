"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import StudioSection from "../StudioSection";
import FormField from "../FormField";
import TagInput from "../TagInput";
import type { ProductDraft } from "../types";

interface Props {
  draft: ProductDraft;
  onChange: (patch: Partial<ProductDraft>) => void;
}

export default function SeoSection({ draft, onChange }: Props) {
  return (
    <StudioSection icon={Search} title="SEO" description="How this product appears in search results.">
      <FormField label="Meta title" htmlFor="metaTitle" hint={`${draft.metaTitle.length}/60 characters`}>
        <Input
          id="metaTitle"
          value={draft.metaTitle}
          onChange={(e) => onChange({ metaTitle: e.target.value })}
          placeholder={draft.title || "Silicone Sink Splash Guard | HomeNest"}
          maxLength={60}
        />
      </FormField>

      <FormField label="Meta description" htmlFor="metaDescription" hint={`${draft.metaDescription.length}/160 characters`}>
        <Textarea
          id="metaDescription"
          value={draft.metaDescription}
          onChange={(e) => onChange({ metaDescription: e.target.value })}
          placeholder={draft.shortDescription || "Stops water splash before it reaches your wall or countertop."}
          rows={2}
          maxLength={160}
        />
      </FormField>

      <FormField label="Keywords" htmlFor="keywords">
        <TagInput id="keywords" value={draft.keywords} onChange={(keywords) => onChange({ keywords })} placeholder="splash guard, sink accessory…" />
      </FormField>
    </StudioSection>
  );
}
