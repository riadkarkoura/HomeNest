/**
 * The Context Engine's own input contract.
 *
 * This is deliberately not the orchestration layer's `AIOrchestrationRequest`
 * — the Context Engine sits *below* orchestration (a future
 * context-assembly stage would call the engine), so it must not depend on
 * the orchestrator. An {@link AIContextRequest} carries only what the
 * engine needs: which feature context is being assembled for (so the
 * resolver can decide which categories are required) and the parameters
 * sources need to gather it (identifiers such as a user or session id).
 * A future stage maps an orchestration request into this shape.
 */

/** What the Context Engine assembles context for. */
export interface AIContextRequest {
  /** The AI feature this context is being assembled for. */
  readonly feature: string;
  /**
   * The inputs sources need to gather their data (a user id, a session
   * id, etc.). Opaque to the engine and resolver; interpreted only by the
   * individual sources that need a given parameter.
   */
  readonly parameters: Readonly<Record<string, unknown>>;
}
