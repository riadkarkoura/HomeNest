/**
 * The provider contract: the single abstraction every concrete AI vendor
 * (OpenAI, Anthropic, Google, Ollama) implements against.
 *
 * Nothing in this file references a specific vendor's SDK, request
 * shape, or response format. That's deliberate — it's what lets a future
 * OpenAI adapter and a future Ollama adapter both satisfy
 * {@link AIProvider} without any of the types below changing. Adding a
 * new provider is "write a class that implements this interface," never
 * "extend this interface to fit the new provider's quirks."
 */

import type {
  AIMessage,
  AIModelIdentifier,
  AIProviderName,
  AIResult,
  AITokenUsage,
} from "@/ai/shared";

/**
 * A capability a provider may or may not support for a given model.
 * Calling code checks {@link AIProvider.capabilities} before relying on
 * optional behavior (like streaming) instead of assuming every provider
 * supports everything — this is what lets Ollama (which may not support
 * every capability a hosted API does) satisfy the same interface as
 * OpenAI without either side needing special-casing elsewhere.
 */
export type AIProviderCapability =
  | "chat"
  | "streaming"
  | "toolCalling"
  | "embeddings"
  | "vision";

/**
 * The static configuration a provider adapter is constructed with.
 * Intentionally minimal and vendor-neutral — actual credentials are read
 * from environment variables by the concrete implementation, never
 * stored on this config object, consistent with this project's existing
 * no-secrets-in-objects-passed-around discipline.
 */
export interface AIProviderConfig {
  /** Which provider this configuration targets. */
  readonly name: AIProviderName;
  /** The model used when a request doesn't specify one explicitly. */
  readonly defaultModel: AIModelIdentifier;
  /**
   * The name of the environment variable holding this provider's API
   * key, not the key itself. A concrete adapter reads
   * `process.env[apiKeyEnvVar]` at call time.
   */
  readonly apiKeyEnvVar?: string;
}

/**
 * A request to generate a completion, in the one shape every supported
 * provider can be adapted to accept.
 */
export interface AICompletionRequest {
  /** Which model to use for this request. */
  readonly model: AIModelIdentifier;
  /** The conversation so far, oldest message first. */
  readonly messages: readonly AIMessage[];
  /** Sampling temperature, where supported by the provider/model. */
  readonly temperature?: number;
  /** An upper bound on tokens generated in the response. */
  readonly maxTokens?: number;
  /**
   * Whether the caller wants a streamed response. A provider that
   * doesn't support the `"streaming"` capability should reject a request
   * with this set to `true` rather than silently ignoring it.
   */
  readonly stream?: boolean;
}

/** Why a completion stopped generating. */
export type AICompletionFinishReason =
  | "stop"
  | "length"
  | "tool_call"
  | "content_filter";

/** A single, complete (non-streamed) response from a provider. */
export interface AICompletionResponse {
  /** The generated message. */
  readonly message: AIMessage;
  /** Token accounting for this request. */
  readonly usage: AITokenUsage;
  /** The model that actually produced this response. */
  readonly model: AIModelIdentifier;
  /** Why generation stopped. */
  readonly finishReason: AICompletionFinishReason;
}

/**
 * One incremental piece of a streamed completion. A provider adapter
 * yields a sequence of these; the last one has `done: true`.
 */
export interface AICompletionChunk {
  /** The incremental text produced since the previous chunk. */
  readonly delta: string;
  /** Whether this is the final chunk in the stream. */
  readonly done: boolean;
}

/**
 * The contract every AI provider adapter implements. This is the one
 * interface this entire foundation exists to make swappable — a
 * workflow, a guardrail, or a prompt template never depends on a
 * concrete provider, only on this shape.
 */
export interface AIProvider {
  /** Which provider this adapter talks to. */
  readonly name: AIProviderName;
  /** The capabilities this adapter actually supports. */
  readonly capabilities: readonly AIProviderCapability[];

  /**
   * Generate a single, complete response. Must be implemented by every
   * provider adapter, since `"chat"` is the one capability this
   * architecture assumes every provider has.
   */
  complete(request: AICompletionRequest): Promise<AIResult<AICompletionResponse>>;

  /**
   * Generate a streamed response, one chunk at a time. Optional — only
   * present on adapters whose `capabilities` include `"streaming"`.
   */
  stream?(request: AICompletionRequest): AsyncIterable<AICompletionChunk>;
}
