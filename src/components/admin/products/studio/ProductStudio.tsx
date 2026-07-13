"use client";

import { useActionState, useState } from "react";
import { motion } from "framer-motion";
import { stagger, fadeUp } from "@/lib/motion";
import ProductQualitySection from "./sections/ProductQualitySection";
import BasicInfoSection from "./sections/BasicInfoSection";
import PricingSection from "./sections/PricingSection";
import OrganizationSection from "./sections/OrganizationSection";
import MediaSection from "./sections/MediaSection";
import ProductStorySection from "./sections/ProductStorySection";
import SeoSection from "./sections/SeoSection";
import AIAssistantPanel from "./sections/AIAssistantPanel";
import PublishCard from "./sections/PublishCard";
import { createEmptyDraft, type ProductDraft } from "./types";
import type { ProductFormState } from "./validation";
import { createProduct } from "@/app/admin/products/new/actions";

type ProductStudioAction = (prevState: ProductFormState, draft: ProductDraft) => Promise<ProductFormState>;

interface Props {
  // Lets the Edit Product page reuse this exact component tree, pre-filled
  // instead of blank. Create omits it entirely.
  initialDraft?: Partial<ProductDraft>;
  // Defaults to createProduct. The Edit page passes
  // updateProduct.bind(null, id) — same (prevState, draft) shape, so this
  // component doesn't need to know which one it's calling.
  action?: ProductStudioAction;
}

const initialActionState: ProductFormState = { ok: false };

export default function ProductStudio({ initialDraft, action = createProduct }: Props) {
  const [draft, setDraft] = useState<ProductDraft>(() => ({ ...createEmptyDraft(), ...initialDraft }));
  const [slugTouched, setSlugTouched] = useState(Boolean(initialDraft?.slug));
  const [state, dispatch, pending] = useActionState(action, initialActionState);

  const update = (patch: Partial<ProductDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  // Passed to PublishCard as `formAction` prop values, not called here —
  // React invokes them (inside its own transition) when the matching
  // submit button triggers a real form submission. Calling dispatch()
  // directly from a plain onClick throws ("called outside of a
  // transition"), since only the form/button `action` mechanism
  // auto-wraps an async useActionState dispatch.
  const onSaveDraft = () => dispatch({ ...draft, status: "Draft" });
  const onPublish = () => dispatch({ ...draft, status: "Active" });

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      <motion.div variants={fadeUp}>
        <ProductQualitySection draft={draft} />
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <motion.div variants={fadeUp}>
            <BasicInfoSection
              draft={draft}
              onChange={update}
              slugTouched={slugTouched}
              onSlugTouched={() => setSlugTouched(true)}
              errors={state.errors}
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <PricingSection draft={draft} onChange={update} errors={state.errors} />
          </motion.div>
          <motion.div variants={fadeUp}>
            <ProductStorySection draft={draft} onChange={update} />
          </motion.div>
          <motion.div variants={fadeUp}>
            <SeoSection draft={draft} onChange={update} errors={state.errors} />
          </motion.div>
        </div>
        <div className="space-y-6">
          <motion.div variants={fadeUp}>
            <PublishCard onSaveDraft={onSaveDraft} onPublish={onPublish} pending={pending} message={state.message} />
          </motion.div>
          <motion.div variants={fadeUp}>
            <OrganizationSection draft={draft} onChange={update} errors={state.errors} />
          </motion.div>
          <motion.div variants={fadeUp}>
            <MediaSection draft={draft} onChange={update} />
          </motion.div>
          <motion.div variants={fadeUp}>
            <AIAssistantPanel />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
