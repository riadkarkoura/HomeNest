/**
 * The Context Engine: the coordinator that drives the three layers to
 * produce one complete, immutable {@link AIAssembledContext}.
 *
 * Its whole job is coordination — it owns no data-gathering, no resolution
 * rules, and no assembly strategy. It asks the resolver which categories
 * are required (Layer 2), asks the registry for the sources of each and
 * invokes them (Layer 1), hands the gathered fragments to the assembler
 * (Layer 3), and — if a validator was supplied — checks completeness
 * before returning. Every one of those collaborators is an injected
 * contract, so a new source, a new resolver, or a new assembly strategy
 * changes the behavior without changing this engine.
 *
 * {@link DefaultContextEngine} is the provided, real implementation. It
 * reuses the shared `AIResult`/`AIError`: a source fetch failing, or a
 * context coming back incomplete, is an ordinary data-layer failure that
 * shape already represents — no new error type is introduced.
 */

import type { AIResult } from "@/ai/shared";
import type { AIContextRequest } from "./request";
import type { AIContextCategory, AIContextFragment } from "./model";
import type { AIContextResolver } from "./resolver";
import type { AIContextSourceRegistry } from "./registry";
import type { AIContextAssembler } from "./assembler";
import type { AIContextValidator } from "./validation";
import type { AIAssembledContext } from "./context";

/** Assembles the complete, immutable context for a request. */
export interface AIContextEngine {
  assemble(request: AIContextRequest): Promise<AIResult<AIAssembledContext>>;
}

/**
 * The default engine. Coordinates resolver → sources → assembler →
 * (optional) validator, in that order. The validator is optional: with
 * none, the engine assembles whatever the sources returned and never
 * judges completeness itself — completeness is a policy concern, not the
 * engine's.
 */
export class DefaultContextEngine implements AIContextEngine {
  constructor(
    private readonly resolver: AIContextResolver,
    private readonly registry: AIContextSourceRegistry,
    private readonly assembler: AIContextAssembler,
    private readonly validator?: AIContextValidator
  ) {}

  async assemble(request: AIContextRequest): Promise<AIResult<AIAssembledContext>> {
    const required: readonly AIContextCategory[] = this.resolver.resolve(request);

    const fragments: AIContextFragment[] = [];
    for (const category of required) {
      for (const source of this.registry.getByCategory(category)) {
        const result = await source.provide(request);
        if (!result.ok) {
          return { ok: false, error: result.error };
        }
        fragments.push(result.value);
      }
    }

    const context = this.assembler.assemble(request, fragments);

    if (this.validator) {
      const validation = this.validator.validate(context, required);
      if (!validation.complete) {
        return {
          ok: false,
          error: {
            code: "invalid_request",
            message: "Assembled context is incomplete for the required categories.",
            retryable: false,
            cause: validation.issues,
          },
        };
      }
    }

    return { ok: true, value: context };
  }
}
