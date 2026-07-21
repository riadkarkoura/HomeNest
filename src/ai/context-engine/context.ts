/**
 * The assembled context: the final, immutable output of the Context
 * Engine, consumed later by the Prompt Engine.
 *
 * This is intentionally a different type from the mutable, general-purpose
 * `AIContext` in `@/ai/context`. That one is a low-level keyed scratchpad
 * any code can write into during a run. {@link AIAssembledContext} is the
 * *finalized, read-only* result of gathering and assembling a request's
 * context — organized by category, never mutated after creation. Primitive
 * scratchpad versus finished, frozen product: the two are a deliberate
 * pair, not a duplicate. The distinct names (`AIAssembledContext` /
 * `AIContextAssembler` versus `AIContext` / `AIContextBuilder`) reflect
 * that.
 */

import type { AIContextCategory, AIContextFragment } from "./model";
import type { AIContextRequest } from "./request";

/** The immutable, category-organized context handed to the Prompt Engine. */
export interface AIAssembledContext {
  /** The request this context was assembled for. */
  readonly request: AIContextRequest;
  /** Epoch milliseconds at which assembly completed. */
  readonly assembledAt: number;
  /** Every category present in this context. */
  readonly categories: readonly AIContextCategory[];
  /** The fragment for a category, or `undefined` if absent. */
  get(category: AIContextCategory): AIContextFragment | undefined;
  /** Whether this context contains a fragment for the given category. */
  has(category: AIContextCategory): boolean;
  /** Every fragment in this context. */
  all(): readonly AIContextFragment[];
}

/**
 * The one concrete {@link AIAssembledContext}. Kept private to this module
 * (only {@link createAssembledContext} is exported) so callers depend on
 * the interface, never the class, and the internal representation stays
 * free to change.
 */
class AssembledContext implements AIAssembledContext {
  readonly categories: readonly AIContextCategory[];

  private constructor(
    readonly request: AIContextRequest,
    readonly assembledAt: number,
    private readonly byCategory: ReadonlyMap<AIContextCategory, AIContextFragment>
  ) {
    this.categories = [...byCategory.keys()];
  }

  static from(
    request: AIContextRequest,
    fragments: readonly AIContextFragment[]
  ): AssembledContext {
    // One source per category is the intended model; if two fragments
    // share a category, the later one wins — a simple, predictable policy.
    const byCategory = new Map<AIContextCategory, AIContextFragment>();
    for (const fragment of fragments) {
      byCategory.set(fragment.category, fragment);
    }
    return new AssembledContext(request, Date.now(), byCategory);
  }

  get(category: AIContextCategory): AIContextFragment | undefined {
    return this.byCategory.get(category);
  }

  has(category: AIContextCategory): boolean {
    return this.byCategory.has(category);
  }

  all(): readonly AIContextFragment[] {
    return [...this.byCategory.values()];
  }
}

/**
 * Create the immutable assembled context from a set of gathered fragments.
 * The only supported way to obtain an {@link AIAssembledContext}.
 */
export function createAssembledContext(
  request: AIContextRequest,
  fragments: readonly AIContextFragment[]
): AIAssembledContext {
  return AssembledContext.from(request, fragments);
}
