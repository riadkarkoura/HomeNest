/**
 * The stage contract: one replaceable step in the request lifecycle.
 *
 * Every step of the orchestration flow — validation, feature resolution,
 * context assembly, business rules, prompt preparation, provider
 * resolution, provider execution, response validation, response
 * enrichment, telemetry — is a stage. A stage takes the current execution
 * context and returns an advanced one (or fails). Because every stage has
 * this exact shape, the orchestrator can sequence any list of them without
 * knowing what any individual stage does — which is what makes each stage
 * replaceable without touching the orchestrator.
 *
 * Note the deliberate distinction from `AIWorkflowStep` in
 * `@/ai/workflows`: a workflow step is a *domain* operation with typed
 * input/output, describing a business process (understand a problem,
 * choose a strategy). A stage is an *infrastructure* step in the request
 * lifecycle every request flows through regardless of feature. A future
 * "run a workflow" stage is where the two layers meet — the stage is the
 * plumbing, the workflow is the domain logic that plumbing carries.
 */

import type { AIExecutionContext } from "./context";
import type { AIExecutionOutcome } from "./outcome";

/** One replaceable step in the orchestration pipeline. */
export interface AIStage {
  /** A stable, human-readable name, used in events and error attribution. */
  readonly name: string;
  /** Advance the context, or fail. Never mutates the input context. */
  execute(context: AIExecutionContext): Promise<AIExecutionOutcome>;
}
