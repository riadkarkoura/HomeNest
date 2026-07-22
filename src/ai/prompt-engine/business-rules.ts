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

/**
 * Supplies the business rules that apply to a strategy.
 *
 * Deliberately does not take the resolved `AILanguageCode` (2026-07-22
 * architecture review closure): this stage decides *which* rules apply —
 * a policy decision independent of language — never *how a rule's text
 * reads*. The same rule ("recommend a solution, not just a product")
 * governs a Home Consultant conversation whether the visitor is speaking
 * Arabic, German, or English; if a rule's phrasing needs to be
 * language-specific, that's the Renderer's job (`./renderer`) via
 * `AIPromptLocalizer`, not this stage's.
 */
export interface AIBusinessRuleProvider {
  provide(strategy: AIPromptStrategy): readonly AIPromptBusinessRule[];
}
