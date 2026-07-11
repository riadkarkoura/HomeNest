"use client";

import { BookOpen, Plus, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import StudioSection from "../StudioSection";
import FormField from "../FormField";
import type { ProductDraft } from "../types";

interface Props {
  draft: ProductDraft;
  onChange: (patch: Partial<ProductDraft>) => void;
}

export default function ProductStorySection({ draft, onChange }: Props) {
  const addBenefit = () => {
    onChange({ benefits: [...draft.benefits, { id: crypto.randomUUID(), text: "" }] });
  };

  const updateBenefit = (id: string, text: string) => {
    onChange({ benefits: draft.benefits.map((b) => (b.id === id ? { ...b, text } : b)) });
  };

  const removeBenefit = (id: string) => {
    onChange({ benefits: draft.benefits.filter((b) => b.id !== id) });
  };

  return (
    <StudioSection
      icon={BookOpen}
      title="Product Story"
      description="Problem → Solution → Benefits — the sequence every HomeNest listing follows."
    >
      <FormField label="Problem" htmlFor="problem" hint="What household problem does this solve?">
        <Textarea
          id="problem"
          value={draft.problem}
          onChange={(e) => onChange({ problem: e.target.value })}
          placeholder="Water splash around the sink soaks the countertop and wall every time someone washes their hands."
          rows={3}
        />
      </FormField>

      <FormField label="Solution" htmlFor="solution">
        <Textarea
          id="solution"
          value={draft.solution}
          onChange={(e) => onChange({ solution: e.target.value })}
          placeholder="A food-grade silicone guard that redirects every drop back into the sink."
          rows={3}
        />
      </FormField>

      <FormField label="Benefits" htmlFor="benefits" hint="One line per benefit.">
        <div className="space-y-2">
          {draft.benefits.map((benefit) => (
            <div key={benefit.id} className="flex items-center gap-2">
              <Input
                value={benefit.text}
                onChange={(e) => updateBenefit(benefit.id, e.target.value)}
                placeholder="Installs in seconds, no tools required"
              />
              <button
                type="button"
                onClick={() => removeBenefit(benefit.id)}
                aria-label="Remove benefit"
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addBenefit}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 transition-colors hover:text-amber-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Add benefit
          </button>
        </div>
      </FormField>
    </StudioSection>
  );
}
