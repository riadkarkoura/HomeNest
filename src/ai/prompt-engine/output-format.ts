/**
 * Stage 6 — Apply Output Format.
 *
 * Resolves the final {@link AIPromptOutputFormat} for a prompt — usually
 * the strategy's default, but kept as its own resolver contract (not just
 * a strategy field read directly) so a future per-request override (a
 * caller explicitly asking for JSON) can exist without changing
 * `AIPromptStrategy` itself.
 */

import type { AIPromptStrategy } from "./strategy";
import type { AIPromptRequest } from "./request";
import type { AIPromptOutputFormat } from "./model";

/** Resolves the output format a prompt should request. */
export interface AIOutputFormatResolver {
  resolve(strategy: AIPromptStrategy, request: AIPromptRequest): AIPromptOutputFormat;
}
