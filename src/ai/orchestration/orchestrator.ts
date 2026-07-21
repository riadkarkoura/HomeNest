/**
 * The orchestrator: the single, minimal public entry point for running an
 * AI request through its lifecycle.
 *
 * {@link AIOrchestrator} is the contract callers depend on;
 * {@link PipelineOrchestrator} is the provided implementation. Its entire
 * job is coordination: build the initial execution context for a request,
 * hand it to a {@link AIPipeline}, emit request-level lifecycle events,
 * and translate the pipeline's outcome into a caller-facing result. It
 * contains no business logic and no provider logic — it does not know
 * which stages exist, what any stage does, or which provider (if any) a
 * stage will call. It depends only on the {@link AIPipeline} contract, so
 * how stages are executed can change entirely without changing the
 * orchestrator.
 */

import type { AIPipeline } from "./pipeline";
import type { AIExecutionContext } from "./context";
import { createExecutionContext } from "./context";
import type { AIOrchestrationRequest, AIOrchestrationStatus } from "./request";
import type { AIOrchestrationError } from "./errors";
import type { AICancellationToken } from "./cancellation";
import type { AIOrchestrationObserver } from "./events";

/** Per-run options, distinct from the orchestrator's construction-time wiring. */
export interface AIOrchestrationRunOptions {
  /** A cancellation signal for this specific run. */
  readonly cancellation?: AICancellationToken;
}

/** The caller-facing result of an orchestration run. */
export interface AIOrchestrationResult {
  /** How the run ended. */
  readonly status: AIOrchestrationStatus;
  /**
   * The run's final execution context. On success this holds everything
   * the stages produced (a response-producing stage stores its output
   * here under a known key); on failure it is the context as it stood
   * when the run started.
   */
  readonly context: AIExecutionContext;
  /** The failure, present only when `status` is not `"completed"`. */
  readonly error?: AIOrchestrationError;
}

/** Runs a request through its lifecycle and returns the outcome. */
export interface AIOrchestrator {
  run(
    request: AIOrchestrationRequest,
    options?: AIOrchestrationRunOptions
  ): Promise<AIOrchestrationResult>;
}

/**
 * The provided orchestrator. Coordinates a run over any {@link AIPipeline}
 * and emits request-level events to an optional observer. Stage-level
 * events are the pipeline's concern; this class only marks the boundaries
 * of the whole run.
 */
export class PipelineOrchestrator implements AIOrchestrator {
  constructor(
    private readonly pipeline: AIPipeline,
    private readonly observer?: AIOrchestrationObserver
  ) {}

  async run(
    request: AIOrchestrationRequest,
    options?: AIOrchestrationRunOptions
  ): Promise<AIOrchestrationResult> {
    const context = createExecutionContext(request, options?.cancellation);

    this.observer?.onEvent({
      type: "request.started",
      requestId: context.requestId,
      timestamp: Date.now(),
    });

    const outcome = await this.pipeline.execute(context);

    if (outcome.ok) {
      this.observer?.onEvent({
        type: "request.completed",
        requestId: context.requestId,
        timestamp: Date.now(),
      });
      return { status: "completed", context: outcome.context };
    }

    const status: AIOrchestrationStatus =
      outcome.error.code === "cancelled" ? "cancelled" : "failed";

    this.observer?.onEvent({
      type: "request.failed",
      requestId: context.requestId,
      timestamp: Date.now(),
      error: outcome.error,
    });

    return { status, context, error: outcome.error };
  }
}
