/**
 * The cancellation abstraction.
 *
 * A cancellation token is a read-only signal a caller can pass into a
 * request so the orchestrator can stop advancing between stages once it's
 * tripped. It is deliberately a plain observable flag, not a mechanism —
 * nothing here starts timers, aborts in-flight work, or knows *why* it
 * was cancelled. That keeps timeout, user-initiated cancellation, and any
 * future cancellation source all expressible as "something that produces
 * a token whose `isCancelled` becomes true," without the orchestrator
 * needing a distinct code path for each.
 *
 * This is why there is no separate timeout type: a timeout is simply a
 * cancellation source that trips the token after a deadline. The
 * orchestrator only ever observes the token, never the clock.
 */

/**
 * A read-only cancellation signal observed by the orchestrator between
 * stages. Cooperative by design — a tripped token stops the *next* stage
 * from starting; it does not interrupt a stage already running.
 */
export interface AICancellationToken {
  /** Whether cancellation has been requested. */
  readonly isCancelled: boolean;
  /** An optional human-readable explanation of why, safe to log. */
  readonly reason?: string;
}
