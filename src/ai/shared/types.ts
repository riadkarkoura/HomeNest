/**
 * Cross-cutting primitives shared by every AI Core module.
 *
 * Nothing in this file is specific to a single provider, workflow, or
 * feature — if a type is only needed by one module, it belongs in that
 * module's own `types.ts`, not here. This file exists to give every other
 * module in `src/ai` a single, consistent vocabulary for messages,
 * errors, and results, so a provider adapter, a workflow step, and a
 * guardrail can all speak the same language without importing from each
 * other.
 */

/**
 * The role a single message in a conversation was authored under.
 *
 * Deliberately limited to the four roles every major chat-completion
 * provider (OpenAI, Anthropic, Google, Ollama) already models — this is
 * the common denominator that makes `AIMessage` provider-agnostic, not an
 * exhaustive list of every role a specific vendor's API happens to name.
 */
export type AIRole = "system" | "user" | "assistant" | "tool";

/**
 * The smallest unit of conversational content every provider can accept
 * and return. A single {@link AIMessage} is the building block for
 * prompts, completions, and conversation history alike.
 */
export interface AIMessage {
  /** Who authored this message. */
  readonly role: AIRole;
  /** The message's plain-text content. */
  readonly content: string;
  /**
   * An optional identifier for the message's author, used when `role` is
   * `"tool"` to name which tool produced the content. Omitted for
   * `system`/`user`/`assistant` messages.
   */
  readonly name?: string;
}

/**
 * Token accounting for a single completion, reported in the shape every
 * major provider already returns it in (prompt tokens, completion
 * tokens, and their sum) — a foundation for cost and usage tracking that
 * doesn't need to change as new providers are added.
 */
export interface AITokenUsage {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
}

/**
 * A provider-specific model name (for example `"gpt-4o"` or
 * `"claude-sonnet-5"`). Kept as a plain string rather than a closed union
 * deliberately — the set of valid models changes far more often than the
 * architecture around them, and enumerating them here would recreate the
 * exact coupling this foundation exists to avoid. Each provider adapter
 * is responsible for validating the model names it actually accepts.
 */
export type AIModelIdentifier = string;

/**
 * The closed set of AI providers this architecture is designed to
 * support. Adding a fifth provider later means extending this union and
 * implementing the {@link AIProvider} contract for it — never
 * restructuring anything else in `src/ai`.
 */
export type AIProviderName = "openai" | "anthropic" | "google" | "ollama";

/**
 * A stable, provider-agnostic classification for why an AI operation
 * failed. Every provider adapter is responsible for mapping its own
 * vendor-specific error shapes onto this set, so calling code never
 * needs to know which provider it's talking to in order to handle a
 * failure correctly.
 */
export type AIErrorCode =
  | "rate_limited"
  | "invalid_request"
  | "authentication_failed"
  | "provider_unavailable"
  | "guardrail_blocked"
  | "timeout"
  | "unknown";

/**
 * A normalized error shape for every failure that can occur anywhere in
 * `src/ai` — a provider call, a workflow step, a guardrail check. Having
 * one error shape (rather than each module inventing its own) is what
 * lets {@link AIResult} be genuinely shared infrastructure instead of a
 * per-module convention.
 */
export interface AIError {
  /** A stable, provider-agnostic classification of the failure. */
  readonly code: AIErrorCode;
  /** A human-readable description, safe to log. */
  readonly message: string;
  /**
   * Whether the operation that produced this error is safe to retry
   * as-is. Left to each error site to decide — a `rate_limited` error is
   * usually retryable, an `invalid_request` error usually is not.
   */
  readonly retryable: boolean;
  /** The original, provider-specific error or exception, if any. */
  readonly cause?: unknown;
}

/**
 * A `Result`-style wrapper used across every AI Core module for any
 * operation that can fail in an expected way (a provider call, a
 * workflow run, a memory read). Callers branch on `ok` instead of
 * catching exceptions across module boundaries — this keeps failure a
 * first-class, typed outcome rather than something that can silently
 * escape a `try`/`catch` a caller forgot to write.
 */
export type AIResult<TValue> =
  | { readonly ok: true; readonly value: TValue }
  | { readonly ok: false; readonly error: AIError };

