/**
 * The provider factory contract: the one place construction logic for a
 * provider instance is allowed to live.
 *
 * Without this seam, "which class do I instantiate for this config"
 * naturally turns into an `if (name === "openai") ... else if (name ===
 * "anthropic") ...` scattered across every call site that ever needs a
 * provider. With it, every call site does the same thing —
 * `factory.create(config)` — and the one switch statement this
 * architecture will ever need lives inside a single future
 * {@link AIProviderFactory} implementation, not spread through the app.
 * This is the Factory Method pattern applied for exactly the reason it
 * exists: centralizing a decision that would otherwise be duplicated
 * everywhere it's needed.
 */

import type { AIProvider, AIProviderConfig } from "./types";

/**
 * The contract a future provider factory implementation satisfies.
 * Takes the provider-agnostic {@link AIProviderConfig} and produces a
 * ready-to-use {@link AIProvider} — how it decides which concrete
 * adapter class to instantiate is entirely the implementation's
 * business, not something this contract exposes.
 */
export interface AIProviderFactory {
  create(config: AIProviderConfig): AIProvider;
}
