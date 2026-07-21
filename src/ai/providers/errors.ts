/**
 * The provider error-normalization contract.
 *
 * The provider-independent error shape ({@link AIError}) already exists
 * in `@/ai/shared` — it's shared infrastructure, not something specific
 * to providers, and duplicating it here would be exactly the kind of
 * redundant abstraction this architecture avoids. What's missing until
 * now is the seam: *how* a vendor-specific error (an OpenAI SDK
 * exception, an HTTP error from a local Ollama instance) becomes an
 * {@link AIError}. {@link AIProviderErrorMapper} is that seam — the rest
 * of HomeNest depends on {@link AIError} alone and never needs to know
 * which provider produced it or what that provider's native error shape
 * looks like.
 */

import type { AIError } from "@/ai/shared";

/**
 * The contract a future provider adapter uses to normalize its own
 * errors. `error` is `unknown` deliberately — a mapper's entire job is
 * to take whatever a vendor's SDK actually throws (a shape this
 * architecture has no reason to know about) and produce the one normalized
 * {@link AIError} shape every other module already depends on.
 */
export interface AIProviderErrorMapper {
  map(error: unknown): AIError;
}
