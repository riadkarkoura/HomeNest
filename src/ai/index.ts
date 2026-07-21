/**
 * AI Core Foundation — public entry point.
 *
 * HomeNest is an AI-first home decision platform: every AI-driven
 * feature (a consultation flow, a recommendation strategy, a future
 * assistant) is built on the contracts re-exported here, not on a
 * specific vendor's SDK. This module contains no concrete provider
 * integration and no business logic — only the shared vocabulary and
 * interfaces every future AI feature is built against, plus the
 * provider-agnostic orchestration engine that coordinates a request
 * through its lifecycle.
 *
 * Consumers should import from `@/ai` rather than reaching into a
 * specific submodule directly, so this barrel — not the underlying file
 * layout — is what the rest of the app depends on.
 */
export * from "./shared";
export * from "./providers";
export * from "./workflows";
export * from "./context";
export * from "./prompts";
export * from "./memory";
export * from "./guardrails";
export * from "./telemetry";
export * from "./orchestration";
