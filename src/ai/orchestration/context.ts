/**
 * The execution context: the single object that travels through every
 * stage of one orchestration run.
 *
 * It is immutable. A stage never mutates the context it receives — it
 * returns a *new* context (via {@link AIExecutionContext.with}) carrying
 * whatever it produced, which the orchestrator threads into the next
 * stage. This is what "avoid global mutable state" means concretely here:
 * there is no shared bag being written to from many places; each stage's
 * contribution is an explicit, traceable new value.
 *
 * The context is an *envelope*, not a knowledge store. It carries run
 * identity (`requestId`, `startedAt`), the originating request, an
 * optional cancellation signal, and an extensible keyed area for stages
 * to hand results to one another. The richer "content context" a future
 * Context-Assembly stage builds (the `AIContext` from `@/ai/context`) is
 * one such value a stage would place *inside* this envelope under a key —
 * the two compose, they are not the same thing.
 */

import type { AIOrchestrationRequest } from "./request";
import type { AICancellationToken } from "./cancellation";

/**
 * The immutable, per-run execution envelope passed to every stage.
 */
export interface AIExecutionContext {
  /** A unique identifier for this orchestration run. */
  readonly requestId: string;
  /** The request that started this run. */
  readonly request: AIOrchestrationRequest;
  /** Epoch milliseconds at which this run began. */
  readonly startedAt: number;
  /** The cancellation signal for this run, if the caller supplied one. */
  readonly cancellation?: AICancellationToken;
  /**
   * Read a value a previous stage stored. The type parameter is a
   * caller-asserted expectation, not a runtime guarantee — a stage
   * reading data it did not itself write should treat the result as
   * untrusted.
   */
  get<TValue>(key: string): TValue | undefined;
  /**
   * Return a new context with `value` stored under `key`. Never mutates
   * the current context — the returned context is what the next stage
   * receives.
   */
  with(key: string, value: unknown): AIExecutionContext;
}

/**
 * The one concrete {@link AIExecutionContext}. Kept private to this module
 * (only the {@link createExecutionContext} factory is exported) so callers
 * depend on the interface, never the class — and so the internal storage
 * representation stays free to change.
 */
class ExecutionContext implements AIExecutionContext {
  private constructor(
    readonly requestId: string,
    readonly request: AIOrchestrationRequest,
    readonly startedAt: number,
    private readonly store: ReadonlyMap<string, unknown>,
    readonly cancellation?: AICancellationToken
  ) {}

  static create(
    request: AIOrchestrationRequest,
    cancellation?: AICancellationToken
  ): ExecutionContext {
    return new ExecutionContext(
      crypto.randomUUID(),
      request,
      Date.now(),
      new Map<string, unknown>(),
      cancellation
    );
  }

  get<TValue>(key: string): TValue | undefined {
    return this.store.get(key) as TValue | undefined;
  }

  with(key: string, value: unknown): AIExecutionContext {
    const next = new Map(this.store);
    next.set(key, value);
    return new ExecutionContext(
      this.requestId,
      this.request,
      this.startedAt,
      next,
      this.cancellation
    );
  }
}

/**
 * Create the initial execution context for a run. The only supported way
 * to obtain an {@link AIExecutionContext} — every subsequent context comes
 * from calling {@link AIExecutionContext.with} on this one.
 */
export function createExecutionContext(
  request: AIOrchestrationRequest,
  cancellation?: AICancellationToken
): AIExecutionContext {
  return ExecutionContext.create(request, cancellation);
}
