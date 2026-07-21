/**
 * Layer 2 — the Context Resolver contract.
 *
 * The resolver's single responsibility is to decide *which categories of
 * context a request requires* — nothing more. It never fetches data, never
 * touches a source, and never assembles anything; it only returns the list
 * of categories the engine must then gather. This strict separation is
 * what lets "what context does this feature need" evolve (new features,
 * new rules) entirely independently of how that context is fetched or
 * assembled.
 *
 * This is a contract only. A real resolver's logic ("a Home Consultant
 * request needs user + home + session context") is feature/business
 * knowledge, out of scope for this foundation — a feature provides its own
 * resolver, and the engine consumes it without change.
 */

import type { AIContextRequest } from "./request";
import type { AIContextCategory } from "./model";

/** Decides which context categories a request requires. */
export interface AIContextResolver {
  /** The categories required for this request. Pure decision — no fetching. */
  resolve(request: AIContextRequest): readonly AIContextCategory[];
}
