/**
 * The telemetry contract: a record of what happened during an AI
 * operation — a provider call, a workflow step, a guardrail violation —
 * for observability, debugging, and future cost/usage tracking.
 *
 * Telemetry is deliberately a side channel: recording an event must never
 * be able to fail the operation it's describing. A {@link AITelemetrySink}
 * is a place events are sent, not a dependency the rest of `src/ai`
 * should ever need to await or handle errors from.
 */

/**
 * The starter set of event types this foundation anticipates. Extending
 * this union is how a future module (a new workflow type, a new
 * guardrail category) adds its own telemetry without changing this
 * contract's shape.
 */
export type AITelemetryEventType =
  | "provider.request"
  | "provider.response"
  | "workflow.step"
  | "guardrail.violation"
  | "memory.write";

/** A single recorded event. */
export interface AITelemetryEvent {
  /** What kind of event this is. */
  readonly type: AITelemetryEventType;
  /** An ISO-8601 timestamp of when this event occurred. */
  readonly timestamp: string;
  /** Arbitrary, event-specific detail. */
  readonly payload: Record<string, unknown>;
}

/**
 * A destination for telemetry events. Deliberately synchronous and
 * return-nothing — a sink that writes to the console, a file, or a
 * future analytics service all satisfy this the same way, and none of
 * them should ever be able to make an AI operation fail because
 * recording it didn't work.
 */
export interface AITelemetrySink {
  record(event: AITelemetryEvent): void;
}
