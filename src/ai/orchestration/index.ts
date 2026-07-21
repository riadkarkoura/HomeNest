/**
 * Barrel export for the AI orchestration layer.
 *
 * The public surface is the orchestrator, the pipeline contract and its
 * sequential implementation, the stage contract, the execution context
 * (interface + factory only — the concrete class stays internal), and the
 * supporting request/result, event, error, and cancellation types.
 * Internal mechanics (the concrete context class, event construction) are
 * deliberately not exported.
 */
export * from "./cancellation";
export * from "./request";
export * from "./errors";
export * from "./events";
export * from "./context";
export * from "./outcome";
export * from "./stage";
export * from "./pipeline";
export * from "./orchestrator";
