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

/** Supplies the constraints that apply to a strategy. */
export interface AIConstraintProvider {
  provide(strategy: AIPromptStrategy): readonly AIPromptConstraint[];
}
