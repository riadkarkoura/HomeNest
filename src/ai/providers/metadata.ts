/**
 * The provider metadata model: descriptive, queryable information about
 * a provider, as distinct from {@link AIProviderConfig} (the construction
 * input a factory uses) or {@link AIProvider} (the runtime contract an
 * adapter implements).
 *
 * A registry stores and lists {@link AIProviderMetadata}; it does not
 * need to inspect a live {@link AIProvider} instance to answer "what
 * models does this provider support?" or "is this provider currently
 * available?" — that's exactly the question this shape exists to answer
 * without constructing anything.
 */

import type { AIModelIdentifier, AIProviderName } from "@/ai/shared";
import type { AIProviderCapability } from "./capabilities";

/**
 * The operational status of a provider, independent of whether it's
 * reachable right now — `"available"` and `"unavailable"` describe
 * registration/configuration state (for example, whether an API key is
 * present), not live network reachability, which is a runtime concern
 * this foundation deliberately doesn't model yet.
 */
export type AIProviderStatus = "available" | "unavailable" | "degraded" | "deprecated";

/**
 * Usage limits a provider may impose. Every field is optional and
 * unitless assumptions are avoided deliberately — this shape describes
 * *that* a limit exists and can be reported, not any specific vendor's
 * actual current numbers, which change independently of this
 * architecture and must never be hardcoded here.
 */
export interface AIProviderLimits {
  /** The largest combined prompt+completion size this provider accepts, in tokens. */
  readonly maxContextTokens?: number;
  /** The largest single completion this provider will generate, in tokens. */
  readonly maxOutputTokens?: number;
  /** A rate limit, in requests per minute, if the provider enforces one. */
  readonly requestsPerMinute?: number;
}

/**
 * Descriptive metadata about a single provider — what a registry stores
 * and lists, so callers can discover what's available without
 * constructing or calling anything.
 */
export interface AIProviderMetadata {
  /** Which provider this metadata describes. */
  readonly name: AIProviderName;
  /** The adapter implementation's own version, for diagnostics and compatibility checks. */
  readonly version: string;
  /** This provider's current operational status. */
  readonly status: AIProviderStatus;
  /** Every model this provider supports. */
  readonly supportedModels: readonly AIModelIdentifier[];
  /** Every capability this provider supports, across all of its models. */
  readonly supportedCapabilities: readonly AIProviderCapability[];
  /** Known usage limits, if any apply and are worth surfacing. */
  readonly limits?: AIProviderLimits;
}
