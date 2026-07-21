/**
 * The result of running a stage or a whole pipeline: either an advanced
 * context, or an orchestration error.
 *
 * This is intentionally *not* the shared `AIResult` from `@/ai/shared`.
 * `AIResult`'s failure branch carries an `AIError` (the provider-domain
 * error), and orchestration control flow must never carry a provider
 * error — see the note in `./errors`. {@link AIExecutionOutcome} is the
 * Result pattern specialized to the orchestration error domain, and that
 * specialization is precisely what keeps provider errors out of the
 * orchestrator. One type, used by both {@link AIStage} and the pipeline,
 * so there is a single success/failure shape across the whole layer.
 */

import type { AIExecutionContext } from "./context";
import type { AIOrchestrationError } from "./errors";

/** A stage or pipeline either advances the context, or fails. */
export type AIExecutionOutcome =
  | { readonly ok: true; readonly context: AIExecutionContext }
  | { readonly ok: false; readonly error: AIOrchestrationError };
