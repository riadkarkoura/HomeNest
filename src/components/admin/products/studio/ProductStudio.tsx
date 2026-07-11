"use client";

import { useState } from "react";
import BasicInfoSection from "./sections/BasicInfoSection";
import PricingSection from "./sections/PricingSection";
import OrganizationSection from "./sections/OrganizationSection";
import MediaSection from "./sections/MediaSection";
import ProductStorySection from "./sections/ProductStorySection";
import SeoSection from "./sections/SeoSection";
import AIAssistantPanel from "./sections/AIAssistantPanel";
import PublishCard from "./sections/PublishCard";
import { createEmptyDraft, type ProductDraft } from "./types";

export default function ProductStudio() {
  const [draft, setDraft] = useState<ProductDraft>(createEmptyDraft);
  const [slugTouched, setSlugTouched] = useState(false);

  const update = (patch: Partial<ProductDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <BasicInfoSection
          draft={draft}
          onChange={update}
          slugTouched={slugTouched}
          onSlugTouched={() => setSlugTouched(true)}
        />
        <PricingSection draft={draft} onChange={update} />
        <ProductStorySection draft={draft} onChange={update} />
        <SeoSection draft={draft} onChange={update} />
      </div>
      <div className="space-y-6">
        <PublishCard />
        <OrganizationSection draft={draft} onChange={update} />
        <MediaSection />
        <AIAssistantPanel />
      </div>
    </div>
  );
}
