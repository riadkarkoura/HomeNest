"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import StudioSection from "../StudioSection";
import FormField from "../FormField";
import TagInput from "../TagInput";
import CharacterCounter from "../CharacterCounter";
import type { ProductDraft } from "../types";

interface Props {
  draft: ProductDraft;
  onChange: (patch: Partial<ProductDraft>) => void;
  errors?: Partial<Record<keyof ProductDraft, string>>;
}

export default function SeoSection({ draft, onChange, errors }: Props) {
  return (
    <StudioSection icon={Search} title="SEO" description="How this product appears in search results.">
      <FormField label="Meta title" htmlFor="metaTitle" error={errors?.metaTitle}>
        <Input
          id="metaTitle"
          value={draft.metaTitle}
          onChange={(e) => onChange({ metaTitle: e.target.value })}
          placeholder={draft.title || "Silicone Sink Splash Guard | HomeNest"}
          maxLength={60}
        />
        <CharacterCounter current={draft.metaTitle.length} max={60} />
      </FormField>

      <FormField label="Meta description" htmlFor="metaDescription" error={errors?.metaDescription}>
        <Textarea
          id="metaDescription"
          value={draft.metaDescription}
          onChange={(e) => onChange({ metaDescription: e.target.value })}
          placeholder={draft.shortDescription || "Stops water splash before it reaches your wall or countertop."}
          rows={2}
          maxLength={160}
        />
        <CharacterCounter current={draft.metaDescription.length} max={160} />
      </FormField>

      <FormField label="Keywords" htmlFor="keywords">
        <TagInput id="keywords" value={draft.keywords} onChange={(keywords) => onChange({ keywords })} placeholder="splash guard, sink accessory…" />
      </FormField>
    </StudioSection>
  );
}
