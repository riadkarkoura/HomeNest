/**
 * Layer 1 — the Context Source contract.
 *
 * A source has exactly one responsibility: provide the fragment for its
 * one category. It is the only layer that (in a real implementation) would
 * touch a database, session store, or external service — but no real
 * source is implemented here, per this sprint's scope. This is a contract
 * only; concrete sources (User, Session, Home, …) arrive with the features
 * that need them, and a new source never requires changing the engine.
 *
 * `provide` is async and returns an {@link AIResult} because a real source
 * fetches data and can fail. The shared `AIResult`/`AIError` are reused
 * deliberately: a source failure is a data/infrastructure failure, exactly
 * what that provider-agnostic error shape already represents.
 */

import type { AIResult } from "@/ai/shared";
import type { AIContextRequest } from "./request";
import type { AIContextFragment, AIContextSourceDescriptor } from "./model";

/** Provides the context fragment for one category. */
export interface AIContextSource {
  /** Static metadata identifying this source and the category it serves. */
  readonly descriptor: AIContextSourceDescriptor;
  /** Gather this source's fragment for the given request. */
  provide(request: AIContextRequest): Promise<AIResult<AIContextFragment>>;
}
