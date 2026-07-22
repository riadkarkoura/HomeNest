/**
 * Context validation contracts.
 *
 * These describe *how completeness is reported*, not what "complete"
 * means. Whether a given assembled context is acceptable — which
 * categories are mandatory, what makes a fragment valid — is
 * feature-specific policy, deliberately left unimplemented here. A feature
 * provides its own {@link AIContextValidator}; the engine runs it (when one
 * is supplied) and treats an incomplete result as a failure. No validation
 * rules are implemented in this foundation.
 */

import type { AIContextCategory } from "./model";
import type { AIAssembledContext } from "./context";

/** A single completeness problem found in an assembled context. */
export interface AIContextValidationIssue {
  /** The category the issue concerns, when it concerns one. */
  readonly category?: AIContextCategory;
  /** A human-readable description of the problem. */
  readonly message: string;
}

/** The outcome of validating an assembled context's completeness. */
export interface AIContextValidationResult {
  /** Whether the context is complete enough to proceed. */
  readonly complete: boolean;
  /** Every completeness problem found; empty when `complete` is `true`. */
  readonly issues: readonly AIContextValidationIssue[];
}

/** Checks whether an assembled context is complete for the required categories. */
export interface AIContextValidator {
  validate(
    context: AIAssembledContext,
    required: readonly AIContextCategory[]
  ): AIContextValidationResult;
}
