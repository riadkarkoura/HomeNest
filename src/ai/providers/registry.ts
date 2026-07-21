/**
 * The provider registry contract: where providers become discoverable
 * and resolvable, without the registry ever needing to know how any of
 * them are actually implemented.
 *
 * Nothing in this file imports or references a concrete provider — no
 * OpenAI, no Anthropic, no Google, no Ollama. A registry implementation
 * only ever deals in {@link AIProvider} (the runtime contract) and
 * {@link AIProviderMetadata} (the descriptive record), both of which are
 * already provider-agnostic. This is what "the registry must not know
 * provider implementations" means architecturally: it's not a promise
 * kept by convention, it's a promise this file's own import list
 * enforces.
 */

import type { AIProviderName } from "@/ai/shared";
import type { AIProvider } from "./types";
import type { AIProviderMetadata } from "./metadata";

/**
 * The contract a future provider registry implementation satisfies.
 * Deliberately synchronous and in-memory in shape — registration is
 * expected to happen once, at application startup, not as a recurring
 * runtime operation; a future implementation is free to back this with
 * whatever storage makes sense without changing this contract.
 */
export interface AIProviderRegistry {
  /**
   * Make a provider discoverable under its metadata's name. A registry
   * implementation decides what happens if the same name is registered
   * twice (reject, replace, etc.) — this contract only requires that
   * after `register` succeeds, `resolve` for that name returns this
   * provider.
   */
  register(metadata: AIProviderMetadata, provider: AIProvider): void;

  /** Look up a previously registered provider by name, if one exists. */
  resolve(name: AIProviderName): AIProvider | undefined;

  /** Every provider currently registered, described by its metadata. */
  list(): readonly AIProviderMetadata[];

  /**
   * Whether a provider is registered and reports itself as usable right
   * now. Distinct from `resolve` returning a value — a provider can be
   * registered but still unavailable (see {@link AIProviderStatus}).
   */
  isAvailable(name: AIProviderName): boolean;
}
