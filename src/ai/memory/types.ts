/**
 * The memory contract: information that persists *across* interactions,
 * as distinct from {@link AIContext}, which only lives for the duration
 * of a single run.
 *
 * A visitor's previously stated problems or preferences are memory; the
 * catalog data pulled in to answer their current question is context.
 * Keeping these as two separate contracts means a future memory
 * implementation (backed by Supabase, Redis, or anything else) can
 * change independently of how a single workflow run assembles its
 * working context.
 */

import type { AIResult } from "@/ai/shared";

/**
 * A single stored memory. `scope` is a plain string rather than a
 * HomeNest-specific "user id" or "session id" field deliberately — this
 * keeps the contract generic enough to partition memory however a future
 * implementation needs to (per user, per session, per household), without
 * this module needing to know which partitioning scheme is in use.
 */
export interface AIMemoryRecord {
  /** A stable identifier for this record. */
  readonly id: string;
  /** The partition this record belongs to (a user id, a session id, etc.). */
  readonly scope: string;
  /** The remembered content, as plain text. */
  readonly content: string;
  /** Arbitrary, implementation-defined metadata attached to this record. */
  readonly metadata?: Record<string, unknown>;
  /** An ISO-8601 timestamp of when this record was created. */
  readonly createdAt: string;
}

/**
 * A request to recall previously stored memories. Deliberately minimal —
 * no similarity search or ranking fields, since that's a property of a
 * specific future implementation (for example, a vector-backed store),
 * not something every {@link AIMemoryStore} needs to support.
 */
export interface AIMemoryQuery {
  /** Which partition to recall memories from. */
  readonly scope: string;
  /** An upper bound on how many records to return. */
  readonly limit?: number;
}

/**
 * The contract a future memory implementation satisfies. A minimal,
 * CRUD-shaped surface — remember, recall, forget — chosen so that
 * whatever actually backs it (a database table, a cache, an in-memory
 * store for tests) is swappable without changing any calling code.
 */
export interface AIMemoryStore {
  /** Persist a new memory, returning the stored record (with its assigned id and timestamp). */
  remember(record: Omit<AIMemoryRecord, "id" | "createdAt">): Promise<AIResult<AIMemoryRecord>>;
  /** Retrieve previously stored memories matching a query. */
  recall(query: AIMemoryQuery): Promise<AIResult<readonly AIMemoryRecord[]>>;
  /** Permanently delete a single memory by id. */
  forget(id: string): Promise<AIResult<void>>;
}
