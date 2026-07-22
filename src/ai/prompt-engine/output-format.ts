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

/**
 * Resolves the output format a prompt should request.
 *
 * Deliberately does not take the resolved `AILanguageCode` (2026-07-22
 * architecture review closure): a format's *structure* — plain text,
 * JSON, a schema's field names — doesn't change with language; only the
 * human-readable content that eventually fills it does, downstream, at
 * render time. `request` (already a parameter here) carries
 * `languagePreference` if a genuinely format-affecting, language-driven
 * override is ever needed.
 */
export interface AIOutputFormatResolver {
  resolve(strategy: AIPromptStrategy, request: AIPromptRequest): AIPromptOutputFormat;
}
