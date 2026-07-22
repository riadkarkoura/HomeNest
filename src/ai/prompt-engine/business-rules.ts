/**
 * Stage 4 — Apply Business Rules.
 *
 * Business rules are the positive guidance a prompt states up front — for
 * example, turning HomeNest's stated principle "recommend a solution, not
 * just a product" (`docs/BRAND_FOUNDATION.md`) into text the prompt
 * actually carries, before generation ever happens. Distinct from
 * `@/ai/guardrails`, which checks output *after* generation — this stage
 * shapes the request, guardrails police the response. Deliberately a
 * passive data-provider contract, exactly like `AIContextSource`: this
 * stage doesn't decide which rules apply, it only supplies them for an
 * already-selected strategy.
 */

import type { AIPromptStrategy } from "./strategy";
import type { AIPromptBusinessRule } from "./model";

/** Supplies the business rules that apply to a strategy. */
export interface AIBusinessRuleProvider {
  provide(strategy: AIPromptStrategy): readonly AIPromptBusinessRule[];
}
