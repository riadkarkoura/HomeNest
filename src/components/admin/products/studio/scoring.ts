import type { ProductDraft } from "./types";

export interface ProductQualityScores {
  title: number;
  description: number;
  seo: number;
  images: number;
  overall: number;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

// Deterministic field-completeness heuristics, not AI-generated content
// analysis — that's the AI Assistant panel's job (Sprint 9, still
// disabled). This is the "real computed scores" ROADMAP calls for under
// Sprint 6.1 remaining: simple, explainable rules an admin can reason
// about while filling the form, not a model call.
function scoreTitle(title: string): number {
  const length = title.trim().length;
  if (length === 0) return 0;
  if (length < 10) return clamp((length / 10) * 50);
  if (length <= 70) return 100;
  return clamp(100 - (length - 70) * 2);
}

function scoreDescription(description: string): number {
  const length = description.trim().length;
  if (length === 0) return 0;
  if (length < 40) return clamp((length / 40) * 60);
  if (length <= 200) return 100;
  return clamp(100 - (length - 200) * 0.5);
}

// Mirrors the limits CharacterCounter already enforces in SeoSection
// (metaTitle 60, metaDescription 160) so the score agrees with the field
// hints right next to it instead of using different thresholds.
function scoreSeo(draft: ProductDraft): number {
  let points = 0;
  const metaTitle = draft.metaTitle.trim();
  const metaDescription = draft.metaDescription.trim();

  if (metaTitle.length > 0) points += metaTitle.length <= 60 ? 40 : 20;
  if (metaDescription.length > 0) points += metaDescription.length <= 160 ? 40 : 20;
  if (draft.keywords.length >= 3) points += 20;
  else if (draft.keywords.length > 0) points += 10;

  return clamp(points);
}

function scoreImages(imageCount: number): number {
  if (imageCount === 0) return 0;
  if (imageCount === 1) return 50;
  if (imageCount === 2) return 75;
  return 100;
}

export function computeProductQualityScores(draft: ProductDraft): ProductQualityScores {
  const title = scoreTitle(draft.title);
  const description = scoreDescription(draft.shortDescription);
  const seo = scoreSeo(draft);
  const images = scoreImages(draft.images.length);
  const overall = clamp((title + description + seo + images) / 4);

  return { title, description, seo, images, overall };
}
