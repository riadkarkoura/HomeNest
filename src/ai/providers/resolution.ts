/**
 * The provider resolution contract: how a caller's requirements become a
 * chosen provider, without this sprint committing to *any* actual
 * selection logic yet.
 *
 * {@link AIProviderSelectionCriteria} exists so that configuration-based
 * selection, capability-based selection, environment-based selection,
 * and fallback-chain selection can all be expressed as data today — and
 * so that a future concrete {@link AIProviderResolutionStrategy} can
 * implement any one of those approaches (or combine them) without this
 * file, or anything that depends on it, needing to change. No strategy
 * is implemented here — this is deliberately the abstraction only.
 */

import type { AIModelIdentifier, AIProviderName } from "@/ai/shared";
import type { AIProviderCapability } from "./capabilities";
import type { AIProviderMetadata } from "./metadata";
import type { AIProviderRegistry } from "./registry";

/**
 * What a caller is looking for in a provider, expressed as data rather
 * than code. A future strategy reads whichever fields are relevant to
 * it — a purely configuration-driven strategy might only ever look at
 * `preferredProvider`; a capability-aware strategy would consult
 * `requiredCapabilities` and `requiredModel` instead. Nothing about this
 * shape favors one selection approach over another.
 */
export interface AIProviderSelectionCriteria {
  /** Capabilities the selected provider must support. */
  readonly requiredCapabilities?: readonly AIProviderCapability[];
  /** A specific model the selected provider must support. */
  readonly requiredModel?: AIModelIdentifier;
  /** A provider to prefer when more than one candidate otherwise qualifies. */
  readonly preferredProvider?: AIProviderName;
  /** An ordered list of providers to try if the preferred one is unavailable. */
  readonly fallbackOrder?: readonly AIProviderName[];
  /** The runtime environment selection is happening in (for example `"production"`). */
  readonly environment?: string;
}

/**
 * The contract a future provider resolution strategy implements. Given a
 * set of criteria and the registry to consult, it returns the metadata
 * for whichever registered provider it selects — or `undefined` if
 * nothing registered satisfies the criteria. Deliberately returns
 * {@link AIProviderMetadata}, not a constructed {@link AIProvider}
 * instance — resolution decides *which* provider; the {@link
 * AIProviderFactory} is still responsible for actually constructing it.
 */
export interface AIProviderResolutionStrategy {
  select(
    criteria: AIProviderSelectionCriteria,
    registry: AIProviderRegistry
  ): AIProviderMetadata | undefined;
}
