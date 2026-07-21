/**
 * The pipeline: the reusable engine that runs an ordered set of stages.
 *
 * {@link AIPipeline} is the contract the orchestrator depends on;
 * {@link SequentialPipeline} is the one concrete implementation provided
 * today — it runs stages strictly in order, threading each stage's
 * advanced context into the next, and stops at the first failure.
 *
 * Every richer execution behavior the platform will eventually want —
 * conditional stages, optional stages, retries, parallel execution,
 * branching, streaming — is a *different implementation of the same
 * {@link AIPipeline} contract*, not a change to the orchestrator or the
 * stages. That is the Open/Closed seam of this whole layer: to change how
 * stages are executed, add a pipeline; to change what runs, add stages.
 * None of those behaviors are implemented here — only the sequential one,
 * which is the minimum a working orchestrator needs.
 */

import type { AIStage } from "./stage";
import type { AIExecutionContext } from "./context";
import type { AIExecutionOutcome } from "./outcome";
import type { AIOrchestrationObserver } from "./events";
import { createOrchestrationError } from "./errors";

/** Runs a set of stages against a context, producing a final outcome. */
export interface AIPipeline {
  execute(context: AIExecutionContext): Promise<AIExecutionOutcome>;
}

/**
 * Runs stages one after another, in declared order. Threads each stage's
 * output context into the next; returns the first failure it hits, or the
 * fully-advanced context if every stage succeeds. Checks the run's
 * cancellation signal before each stage (cooperative cancellation — a
 * tripped token stops the next stage, it does not interrupt a running
 * one). Emits a lifecycle event around each stage if an observer was
 * provided.
 */
export class SequentialPipeline implements AIPipeline {
  constructor(
    private readonly stages: readonly AIStage[],
    private readonly observer?: AIOrchestrationObserver
  ) {}

  async execute(context: AIExecutionContext): Promise<AIExecutionOutcome> {
    let current = context;

    for (const stage of this.stages) {
      if (current.cancellation?.isCancelled) {
        return {
          ok: false,
          error: createOrchestrationError(
            "cancelled",
            `Run cancelled before stage "${stage.name}".`,
            { stageName: stage.name, cause: current.cancellation.reason }
          ),
        };
      }

      this.observer?.onEvent({
        type: "stage.started",
        requestId: current.requestId,
        timestamp: Date.now(),
        stageName: stage.name,
      });

      const outcome = await stage.execute(current);

      if (!outcome.ok) {
        this.observer?.onEvent({
          type: "stage.failed",
          requestId: current.requestId,
          timestamp: Date.now(),
          stageName: stage.name,
          error: outcome.error,
        });
        return outcome;
      }

      current = outcome.context;

      this.observer?.onEvent({
        type: "stage.completed",
        requestId: current.requestId,
        timestamp: Date.now(),
        stageName: stage.name,
      });
    }

    return { ok: true, context: current };
  }
}
