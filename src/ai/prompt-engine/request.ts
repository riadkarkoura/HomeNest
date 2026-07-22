/**
 * The Prompt Engine's own input contract.
 *
 * Deliberately not the orchestration layer's `AIOrchestrationRequest`,
 * nor the Context Engine's `AIContextRequest` — the same reasoning
 * `context-engine/request.ts` gives for its own separation applies here
 * one layer up: the Prompt Engine sits *above* Context Engine in the
 * pipeline (it consumes an already-assembled `AIAssembledContext`, passed
 * separately to `AIPromptEngine.build`, not raw gathering parameters), so
 * it must not depend on how that context was gathered, and it must not
 * depend on the orchestrator that will one day call it.
 */

import type { AILanguagePreference } from "./language";

/** A single request to build a provider-ready prompt. */
export interface AIPromptRequest {
  /** Which AI feature this prompt is for; a strategy selector's input. */
  readonly feature: string;
  /** How to determine this prompt's language — see `./language`. */
  readonly languagePreference: AILanguagePreference;
  /**
   * An optional caller-supplied hint for strategy selection. A selector
   * is free to ignore it — `feature` alone may be enough to decide.
   */
  readonly strategyHint?: string;
  /** Optional caller-supplied metadata (locale, request origin, etc.). */
  readonly metadata?: Readonly<Record<string, unknown>>;
}
