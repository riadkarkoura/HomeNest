/**
 * The workflow contract: the shape of a multi-step, AI-driven process —
 * for example, understanding a visitor's stated home problem, deciding a
 * recommended strategy, and selecting products that support it.
 *
 * This module defines the *shape* of a workflow and its steps, not an
 * execution engine. Whether steps run sequentially, in parallel, or with
 * retries is an implementation detail for a future orchestrator that
 * satisfies {@link AIWorkflowExecutor} — nothing here commits to that yet.
 */

import type { AIError, AIResult } from "@/ai/shared";
import type { AIContext } from "@/ai/context";

/** The lifecycle state of a single workflow step during a run. */
export type AIWorkflowStepStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "skipped";

/**
 * The outcome of running a single step. Kept separate from the step
 * definition itself so a run's history (an ordered list of these) can be
 * inspected without re-running anything.
 */
export interface AIWorkflowStepResult<TOutput> {
  /** The id of the {@link AIWorkflowStep} this result belongs to. */
  readonly stepId: string;
  /** How the step concluded. */
  readonly status: AIWorkflowStepStatus;
  /** The step's output, present only when `status` is `"completed"`. */
  readonly output?: TOutput;
  /** Why the step failed, present only when `status` is `"failed"`. */
  readonly error?: AIError;
}

/**
 * A single unit of work within a workflow. Generic over its own input and
 * output so a workflow's steps compose type-safely — the output type of
 * one step is exactly what the next step declares as its input type.
 */
export interface AIWorkflowStep<TInput, TOutput> {
  /** A stable identifier for this step, unique within its workflow. */
  readonly id: string;
  /** A short, human-readable name for logging and telemetry. */
  readonly name: string;
  /**
   * Run this step. Receives the shared {@link AIContext} for the workflow
   * run in addition to its own typed input, so a step can read
   * information gathered earlier in the run without every step's input
   * type needing to carry the entire run's accumulated state.
   */
  run(input: TInput, context: AIContext): Promise<AIResult<TOutput>>;
}

/**
 * A named, ordered workflow. Describes what a workflow *is* — its steps —
 * without prescribing how those steps get executed; that's
 * {@link AIWorkflowExecutor}'s job.
 */
export interface AIWorkflowDefinition<TInput, TOutput> {
  /** A stable identifier for this workflow. */
  readonly id: string;
  /** A short, human-readable description of what this workflow does. */
  readonly description: string;
  /**
   * The ordered steps that make up this workflow. Declared as
   * `readonly unknown[]` at this level because a workflow's steps
   * generally differ in input/output type from one another and from the
   * workflow's own overall `TInput`/`TOutput` — an executor is
   * responsible for threading each step's typed output into the next
   * step's typed input at run time.
   */
  readonly steps: readonly AIWorkflowStep<unknown, unknown>[];
}

/** The final outcome of running an entire workflow, start to finish. */
export interface AIWorkflowRunResult<TOutput> {
  /** Whether every step completed successfully. */
  readonly status: "completed" | "failed";
  /** The workflow's final output, present only when `status` is `"completed"`. */
  readonly output?: TOutput;
  /** The result of every step that ran, in execution order. */
  readonly steps: readonly AIWorkflowStepResult<unknown>[];
}

/**
 * The contract a future workflow orchestrator implements. Not implemented
 * in this foundation — this interface exists so that workflow *authors*
 * (code that defines an {@link AIWorkflowDefinition}) never need to
 * change when the *execution strategy* (sequential today, perhaps
 * parallel-where-possible later) evolves.
 */
export interface AIWorkflowExecutor {
  run<TInput, TOutput>(
    workflow: AIWorkflowDefinition<TInput, TOutput>,
    input: TInput,
    context: AIContext
  ): Promise<AIWorkflowRunResult<TOutput>>;
}
