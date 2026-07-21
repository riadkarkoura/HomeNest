/**
 * Orchestration-level errors.
 *
 * This is deliberately a *different* error type from the provider-domain
 * `AIError` in `@/ai/shared`. That separation is the whole point: a
 * provider failure (rate limit, auth) is a provider concern, and it must
 * never appear in orchestration control flow. When a provider-execution
 * stage fails, it maps the provider's `AIError` into an
 * {@link AIOrchestrationError} — attaching the original as an opaque
 * `cause` — so the orchestrator only ever reasons about orchestration
 * failures, never provider ones. The type system enforces this: `cause`
 * is `unknown`, so a provider `AIError` can be carried for debugging
 * without the orchestration error type ever depending on it.
 */

/**
 * A stable, provider-agnostic classification of an orchestration failure.
 * These are lifecycle concerns (a stage failed, the request was
 * cancelled), never provider concerns (which live in `AIError`).
 */
export type AIOrchestrationErrorCode =
  | "validation_failed"
  | "stage_failed"
  | "cancelled"
  | "timeout"
  | "no_provider_resolved"
  | "unknown";

/** A single orchestration failure. */
export interface AIOrchestrationError {
  /** A stable, provider-agnostic classification of the failure. */
  readonly code: AIOrchestrationErrorCode;
  /** A human-readable description, safe to log. */
  readonly message: string;
  /** The stage this failure originated in, when it originated in one. */
  readonly stageName?: string;
  /**
   * The underlying cause, if any. Typed `unknown` on purpose — a mapped
   * provider `AIError` may be attached here for diagnostics without the
   * orchestration error type ever depending on the provider error type.
   */
  readonly cause?: unknown;
}

/**
 * Construct an {@link AIOrchestrationError}. A small factory rather than
 * scattered object literals, so every orchestration error is created the
 * same way and the shape can evolve in one place.
 */
export function createOrchestrationError(
  code: AIOrchestrationErrorCode,
  message: string,
  details?: { readonly stageName?: string; readonly cause?: unknown }
): AIOrchestrationError {
  return {
    code,
    message,
    stageName: details?.stageName,
    cause: details?.cause,
  };
}
