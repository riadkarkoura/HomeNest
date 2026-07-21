/**
 * The context contract: the assembled information an AI operation
 * reasons over during a single run — a visitor's stated problem, relevant
 * catalog data, prior conversation turns, and anything else a workflow
 * step or prompt template needs to read.
 *
 * {@link AIContext} is deliberately not "the conversation" or "the user
 * session" specifically — it's a generic, run-scoped bag of named
 * values, so it can carry whatever a given workflow actually needs
 * without this module needing to know about HomeNest's product catalog,
 * cart, or account shape in advance.
 */

/**
 * A single named piece of context, tagged with where it came from. The
 * `source` field exists so telemetry and debugging can answer "why does
 * the context contain this?" without guessing — a value seeded by the
 * catalog lookup step should be distinguishable from one seeded by user
 * input.
 */
export interface AIContextEntry {
  /** The key this value is stored under. */
  readonly key: string;
  /** The stored value. Intentionally untyped at this level — see {@link AIContext.get}. */
  readonly value: unknown;
  /** What produced this entry (a step id, `"user"`, `"system"`, etc.). */
  readonly source: string;
}

/**
 * A run-scoped bag of named values, shared across every step of a single
 * workflow run. Deliberately small: get, set, and enumerate — anything
 * more (querying, filtering, expiry) belongs in a future implementation,
 * not this contract.
 */
export interface AIContext {
  /**
   * Read a previously stored value by key. The type parameter is a
   * caller-asserted expectation, not something this interface can verify
   * at runtime — callers reading context they didn't write themselves
   * should treat the result as untrusted input.
   */
  get<TValue>(key: string): TValue | undefined;
  /** Store a value under a key, recording what produced it. */
  set(key: string, value: unknown, source: string): void;
  /** Every entry currently held, in insertion order. */
  entries(): readonly AIContextEntry[];
}

/**
 * A factory for producing a fresh {@link AIContext}, optionally seeded
 * with initial values (for example, values already known before a
 * workflow starts, like an authenticated user's id). Kept separate from
 * `AIContext` itself so different seeding strategies — one that pulls in
 * product catalog data, one that doesn't — can exist side by side without
 * changing the context shape those strategies produce.
 */
export interface AIContextBuilder {
  build(seed?: Record<string, unknown>): AIContext;
}
