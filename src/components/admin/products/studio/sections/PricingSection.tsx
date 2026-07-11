"use client";

import { Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import StudioSection from "../StudioSection";
import FormField from "../FormField";
import type { ProductDraft } from "../types";

interface Props {
  draft: ProductDraft;
  onChange: (patch: Partial<ProductDraft>) => void;
}

function PriceInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex items-center rounded-lg border border-stone-200 pl-2.5 text-sm text-stone-400 transition-colors focus-within:border-stone-400">
      <span>$</span>
      <Input
        id={id}
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-0 pl-1 shadow-none focus-visible:ring-0"
      />
    </div>
  );
}

export default function PricingSection({ draft, onChange }: Props) {
  return (
    <StudioSection icon={Tag} title="Pricing" description="What customers pay, and what it costs you.">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <FormField label="Price" htmlFor="price" required>
          <PriceInput id="price" value={draft.price} onChange={(price) => onChange({ price })} placeholder="24.00" />
        </FormField>
        <FormField label="Compare at price" htmlFor="compareAtPrice" hint="Shown as a strikethrough.">
          <PriceInput
            id="compareAtPrice"
            value={draft.compareAtPrice}
            onChange={(compareAtPrice) => onChange({ compareAtPrice })}
            placeholder="34.00"
          />
        </FormField>
        <FormField label="Cost" htmlFor="cost" hint="Admin-only. Never shown to customers.">
          <PriceInput id="cost" value={draft.cost} onChange={(cost) => onChange({ cost })} placeholder="9.50" />
        </FormField>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-stone-100 bg-stone-50 px-4 py-3">
        <div>
          <Label htmlFor="featured" className="text-sm font-medium text-stone-700">
            Featured product
          </Label>
          <p className="text-xs text-stone-400">Shown in the homepage featured section.</p>
        </div>
        <Switch id="featured" checked={draft.featured} onCheckedChange={(featured) => onChange({ featured })} />
      </div>
    </StudioSection>
  );
}
