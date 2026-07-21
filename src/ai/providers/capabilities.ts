/**
 * The capability model: what a provider can do, independent of which
 * provider it is.
 *
 * Calling code checks a provider's declared capabilities before relying
 * on optional behavior, instead of assuming every provider supports
 * everything — this is what lets a text-only local model and a
 * fully-featured hosted API both satisfy {@link AIProvider} without
 * either side needing special-casing elsewhere. Extending this list to
 * cover a capability no current provider has yet is a pure addition —
 * existing capability names never change meaning, consistent with this
 * module's Open/Closed approach to {@link AIProviderName}.
 */

/**
 * A single capability a provider may support, for a given model.
 *
 * This is intentionally a flat, closed union rather than an open string
 * type — a typo'd capability name should be a compile error, not a
 * silent no-op. Adding a genuinely new capability is a one-line,
 * additive change here; it never requires touching
 * {@link AIProvider} or any code that already checks an existing
 * capability.
 */
export type AIProviderCapability =
  | "chat"
  | "streaming"
  | "toolCalling"
  | "embeddings"
  | "vision"
  | "imageGeneration"
  | "structuredOutput"
  | "reasoning"
  | "audio";
