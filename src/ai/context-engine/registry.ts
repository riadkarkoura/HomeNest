/**
 * The source registry: how the engine finds the sources for a category
 * without knowing any concrete source.
 *
 * The resolver decides *which categories* are required; the registry
 * answers *which sources provide a category*. This indirection is the
 * Open/Closed seam for sources — registering a new source adds a
 * capability to the engine without changing the engine, the resolver, or
 * any existing source.
 *
 * {@link InMemoryContextSourceRegistry} is the one provided, real
 * implementation — a plain in-memory collection, which is all a registry
 * needs to be. It is not a placeholder: it genuinely stores and looks up
 * sources.
 */

import type { AIContextCategory } from "./model";
import type { AIContextSource } from "./source";

/** Holds the available context sources and looks them up by category. */
export interface AIContextSourceRegistry {
  /** Add a source to the registry. */
  register(source: AIContextSource): void;
  /** Every registered source that provides the given category. */
  getByCategory(category: AIContextCategory): readonly AIContextSource[];
  /** Every registered source. */
  list(): readonly AIContextSource[];
}

/** A simple in-memory {@link AIContextSourceRegistry}. */
export class InMemoryContextSourceRegistry implements AIContextSourceRegistry {
  private readonly sources: AIContextSource[] = [];

  register(source: AIContextSource): void {
    this.sources.push(source);
  }

  getByCategory(category: AIContextCategory): readonly AIContextSource[] {
    return this.sources.filter((source) => source.descriptor.category === category);
  }

  list(): readonly AIContextSource[] {
    return [...this.sources];
  }
}
