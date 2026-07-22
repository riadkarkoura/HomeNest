/**
 * Stage 7 — Validate Prompt.
 *
 * Mirrors `context-engine/validation.ts` closely and deliberately: what
 * "valid" means for a given strategy (which sections are mandatory, is an
 * empty context acceptable) is feature-specific policy, not something
 * this foundation decides. A missing validator is not an error — see
 * `DefaultPromptEngine` in `./engine`, which treats validation as
 * optional, exactly as `DefaultContextEngine` already does.
 */

import type { AIPrompt } from "./model";
import type { AIPromptStrategy } from "./strategy";

/** A single completeness or correctness problem found in a prompt. */
export interface AIPromptValidationIssue {
  readonly field?: string;
  readonly message: string;
}

/** The outcome of validating a prompt against its strategy. */
export interface AIPromptValidationResult {
  readonly valid: boolean;
  readonly issues: readonly AIPromptValidationIssue[];
}

/**
 * Checks whether a built prompt is valid for the strategy it was built under.
 *
 * Takes no separate `language` parameter (2026-07-22 architecture review
 * closure) because it doesn't need one: `prompt.metadata.language` is
 * already reachable through `prompt` itself by the time this stage runs,
 * so a validator that genuinely needs to check something language-specific
 * already can, with no interface change — confirmed by design, not an
 * oversight.
 */
export interface AIPromptValidator {
  validate(prompt: AIPrompt, strategy: AIPromptStrategy): AIPromptValidationResult;
}
