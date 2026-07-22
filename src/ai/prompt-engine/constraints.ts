/**
 * Stage 5 — Apply Constraints.
 *
 * Constraints are hard limits on what the prompt should ask for ("only
 * recommend in-stock products", "never invent a price") — see
 * `./model`'s note on how {@link AIPromptConstraint} differs from
 * {@link AIPromptBusinessRule}. Same passive-provider shape as
 * `AIBusinessRuleProvider`, for the same reason: deciding which
 * constraints apply is feature/business policy, not something this
 * foundation commits to.
 */

import type { AIPromptStrategy } from "./strategy";
import type { AIPromptConstraint } from "./model";

/**
 * Supplies the constraints that apply to a strategy.
 *
 * Deliberately does not take the resolved `AILanguageCode`, for the same
 * reason `AIBusinessRuleProvider` doesn't (2026-07-22 architecture review
 * closure): *which* constraints apply is policy, not phrasing. A
 * market/jurisdiction-specific constraint (a region-specific disclaimer
 * requirement, say) is a real future possibility, but that's a
 * market/region concern to model explicitly when it's actually needed —
 * not something to infer from language today, which would only
 * approximate it incorrectly.
 */
export interface AIConstraintProvider {
  provide(strategy: AIPromptStrategy): readonly AIPromptConstraint[];
}
