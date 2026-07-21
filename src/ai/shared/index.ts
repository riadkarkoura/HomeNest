/**
 * Barrel export for cross-cutting AI Core primitives.
 *
 * Every other module under `src/ai` imports its shared vocabulary
 * (messages, errors, results) from here rather than from `./types`
 * directly, so this file — not the underlying file layout — is the
 * stable contract other modules depend on.
 */
export * from "./types";
