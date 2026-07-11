"use client";

import { FolderTree } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StudioSection from "../StudioSection";
import FormField from "../FormField";
import TagInput from "../TagInput";
import { STUDIO_CATEGORIES, type ProductDraft } from "../types";
import { PRODUCT_STATUSES } from "../../status";

interface Props {
  draft: ProductDraft;
  onChange: (patch: Partial<ProductDraft>) => void;
}

export default function OrganizationSection({ draft, onChange }: Props) {
  return (
    <StudioSection icon={FolderTree} title="Organization" description="How this product is grouped and found.">
      <FormField label="Category" htmlFor="category">
        <Select value={draft.category} onValueChange={(category) => onChange({ category: category as string })}>
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STUDIO_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Status" htmlFor="status">
        <Select value={draft.status} onValueChange={(status) => onChange({ status: status as ProductDraft["status"] })}>
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRODUCT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Tags" htmlFor="tags" hint="Helps search and filtering find this product.">
        <TagInput id="tags" value={draft.tags} onChange={(tags) => onChange({ tags })} placeholder="sink, kitchen, silicone…" />
      </FormField>
    </StudioSection>
  );
}
