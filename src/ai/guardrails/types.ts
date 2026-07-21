/**
 * The guardrail contract: a policy or safety check applied to AI input
 * or output.
 *
 * This is where HomeNest's own brand principles — "AI is a consultant,
 * not a salesperson," "never recommend a product that doesn't genuinely
 * solve the user's problem" — become something the architecture can
 * actually enforce, rather than a rule that only lives in a prompt or a
 * document. A guardrail is what a future implementation checks a
 * completion or a recommendation against before it ever reaches a
 * visitor.
 */

/** How serious a single guardrail violation is. */
export type AIGuardrailSeverity = "info" | "warning" | "blocking";

/** A single rule violation found while checking some input. */
export interface AIGuardrailViolation {
  /** The id of the {@link AIGuardrail} rule that was violated. */
  readonly ruleId: string;
  /** A human-readable explanation of what was violated and why. */
  readonly message: string;
  /** How serious this particular violation is. */
  readonly severity: AIGuardrailSeverity;
}

/** The outcome of running one or more guardrails against some input. */
export interface AIGuardrailCheckResult {
  /**
   * Whether the input is safe to proceed with. `false` whenever any
   * violation of `"blocking"` severity was found — `"info"` and
   * `"warning"` violations may still be present even when `passed` is
   * `true`, for cases worth surfacing without stopping anything.
   */
  readonly passed: boolean;
  /** Every violation found, regardless of severity. */
  readonly violations: readonly AIGuardrailViolation[];
}

/**
 * A single, named policy check. `input` is intentionally `unknown`
 * rather than generic over a specific shape — a guardrail might check a
 * rendered prompt, a provider's completion, or a list of recommended
 * products, and forcing one shared type parameter across every guardrail
 * would either be too broad to be useful or too narrow to reuse. Each
 * concrete guardrail is responsible for narrowing and validating its own
 * `input` internally.
 */
export interface AIGuardrail {
  /** A stable identifier for this rule. */
  readonly id: string;
  /** A short, human-readable description of what this guardrail checks for. */
  readonly description: string;
  /** Evaluate `input` against this rule. May be synchronous or asynchronous. */
  check(input: unknown): AIGuardrailCheckResult | Promise<AIGuardrailCheckResult>;
}

/**
 * A contract for running a set of guardrails together and combining
 * their results into one outcome. Not implemented here — a future
 * implementation decides how violations from multiple guardrails are
 * merged (for example, whether one blocking violation short-circuits the
 * rest).
 */
export interface AIGuardrailPipeline {
  run(input: unknown): Promise<AIGuardrailCheckResult>;
}
