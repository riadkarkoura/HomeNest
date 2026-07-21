/**
 * The orchestration request and the terminal status an orchestration run
 * can end in.
 *
 * A request is deliberately thin and business-agnostic: it names *which*
 * AI feature is being invoked and carries an opaque `input` payload, but
 * the orchestrator itself never interprets either — a validation or
 * feature-resolution stage does. This is what lets one orchestrator serve
 * every future AI feature (Home Consultant, Room Analyzer, and beyond)
 * without the orchestrator knowing anything about any of them.
 */

/** The terminal state of a completed orchestration run. */
export type AIOrchestrationStatus = "completed" | "failed" | "cancelled";

/**
 * A single request submitted to the orchestrator. The orchestrator treats
 * `input` as opaque — its shape is defined and validated by the stages a
 * given `feature` resolves to, never by the orchestrator, which is why
 * `input` is `unknown` rather than a specific type.
 */
export interface AIOrchestrationRequest {
  /** Which AI feature this request targets; resolved by a stage, not the orchestrator. */
  readonly feature: string;
  /** The feature-specific payload. Opaque to the orchestrator; narrowed by stages. */
  readonly input: unknown;
  /** Optional caller-supplied metadata (locale, request origin, etc.). */
  readonly metadata?: Readonly<Record<string, unknown>>;
}
