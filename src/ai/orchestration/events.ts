/**
 * Orchestration lifecycle events, and the observer that receives them.
 *
 * These are strongly-typed lifecycle events (request/stage started,
 * completed, failed) — deliberately distinct from the generic
 * `AITelemetrySink` in `@/ai/telemetry`, which takes a loosely-typed
 * payload bag and serves the whole AI system. The orchestrator *emits*
 * these events; it does not record or store them. A future telemetry
 * adapter can implement {@link AIOrchestrationObserver} and forward each
 * event into the telemetry sink — so the two compose (orchestration
 * produces events, telemetry consumes them) rather than duplicate each
 * other. This keeps observability entirely optional: with no observer,
 * the orchestrator runs identically and emits nothing.
 */

import type { AIOrchestrationError } from "./errors";

/** The lifecycle moments the orchestrator emits. */
export type AIOrchestrationEventType =
  | "request.started"
  | "request.completed"
  | "request.failed"
  | "stage.started"
  | "stage.completed"
  | "stage.failed";

/** A single lifecycle event. */
export interface AIOrchestrationEvent {
  /** Which lifecycle moment this event marks. */
  readonly type: AIOrchestrationEventType;
  /** The id of the orchestration run this event belongs to. */
  readonly requestId: string;
  /** Epoch milliseconds at which this event was emitted. */
  readonly timestamp: number;
  /** The stage involved, present for `stage.*` events. */
  readonly stageName?: string;
  /** The failure, present for `*.failed` events. */
  readonly error?: AIOrchestrationError;
}

/**
 * A destination for orchestration events. Synchronous and
 * return-nothing, exactly like the telemetry sink it will one day feed:
 * observing a run must never be able to change or fail that run. Entirely
 * optional — the orchestrator functions with or without one.
 */
export interface AIOrchestrationObserver {
  onEvent(event: AIOrchestrationEvent): void;
}
