/**
 * The Prompt Engine: the coordinator that drives the fixed, eight-stage
 * pipeline (Select Strategy → Resolve Persona → Apply Context → Apply
 * Business Rules → Apply Constraints → Apply Output Format → Validate →
 * Render) to turn a request and an already-assembled `AIAssembledContext`
 * into one provider-ready `AIRenderedPrompt`.
 *
 * Unlike the Orchestrator's `SequentialPipeline` (a homogeneous list of
 * interchangeable `AIStage`s, reorderable and extensible by construction),
 * the Prompt Engine's stages are named, distinctly-typed collaborators in
 * a fixed, meaningful order — exactly like Context Engine's
 * resolver/registry/assembler/validator split. That's a deliberate
 * choice, not an oversight: these eight steps are not interchangeable,
 * and forcing them into a generic stage list would hide, not express,
 * the sequence this module's mission specifies.
 *
 * The Prompt Engine never calls a provider and never executes an AI
 * request — its only output is a rendered prompt. Wiring it into an
 * actual request (Context Engine first, then this, then a Provider) is
 * an orchestration-layer concern (a future "prompt.render" `AIStage`),
 * deliberately outside this module — exactly as `DefaultContextEngine`
 * has no dependency on the orchestrator that will one day call it.
 *
 * {@link DefaultPromptEngine} is the provided, real implementation. It
 * reuses the shared `AIResult`/`AIError` (like Context Engine, unlike
 * Orchestration) because a missing strategy, an unresolved persona, or a
 * failed validation are the same class of data/domain failure `AIError`
 * already models — there is no orchestration-lifecycle concern here to
 * isolate from, the way there was for the Orchestrator (see
 * `orchestration/errors.ts`'s own note on why it forked instead).
 *
 * Every injected collaborator below is synchronous, mirroring Context
 * Engine's own split: `AIContextSource.provide` is async because it
 * fetches real data, while `AIContextResolver`/`AIContextAssembler`/
 * `AIContextValidator` are sync because they only decide, transform, or
 * check in-memory values. None of this module's eight collaborators do
 * I/O in this foundation — only `build` itself is `async`, so a future
 * collaborator that does need to fetch (a database-backed persona
 * registry, say) can become async later without changing this class's
 * public shape.
 *
 * Language propagation (2026-07-22 architecture review closure): the
 * resolved `AILanguageCode` is computed once, here, before any stage
 * runs. Of the eight stages, only `personaResolver.resolve` receives it
 * explicitly — voice/tone/culture is a genuine *selection* decision that
 * can vary by language. Every other stage's independence from language
 * was reviewed individually and is documented in its own file (`./strategy`,
 * `./context-application`, `./business-rules`, `./constraints`,
 * `./output-format`, `./validation`): each decides *what content applies*
 * (a strategy, a set of rules, a format), never *how it's phrased* —
 * phrasing is the Renderer's job alone (`./renderer`), which already has
 * full access to the resolved language via `prompt.metadata.language` by
 * the time it runs. Adding a `language` parameter to those other six
 * would be coupling with no current caller and no current stage that
 * needs it — deferred deliberately, not overlooked; each is an additive,
 * non-breaking change to make if a real future strategy/rule/format
 * ever needs to vary by language.
 */

import type { AIResult } from "@/ai/shared";
import type { AIAssembledContext } from "@/ai/context-engine";
import type { AIRenderedPrompt } from "@/ai/prompts";
import type { AIPromptRequest } from "./request";
import type { AIPromptStrategySelector } from "./strategy";
import type { AIPersonaResolver } from "./persona";
import type { AIPromptContextApplier } from "./context-application";
import type { AIBusinessRuleProvider } from "./business-rules";
import type { AIConstraintProvider } from "./constraints";
import type { AIOutputFormatResolver } from "./output-format";
import type { AIPromptValidator } from "./validation";
import type { AIPromptRenderer } from "./renderer";
import type { AILanguageResolver } from "./language";
import { createEmptyPrompt } from "./model";
import type { AIPrompt } from "./model";

/** Builds a provider-ready rendered prompt for a request. */
export interface AIPromptEngine {
  build(
    request: AIPromptRequest,
    context: AIAssembledContext
  ): Promise<AIResult<AIRenderedPrompt>>;
}

/**
 * The default engine. Runs the fixed eight-stage sequence over its
 * injected collaborators. The validator is optional, exactly like
 * `DefaultContextEngine`'s: with none supplied, the engine renders
 * whatever the earlier stages produced and never judges completeness
 * itself.
 */
export class DefaultPromptEngine implements AIPromptEngine {
  constructor(
    private readonly languageResolver: AILanguageResolver,
    private readonly strategySelector: AIPromptStrategySelector,
    private readonly personaResolver: AIPersonaResolver,
    private readonly contextApplier: AIPromptContextApplier,
    private readonly businessRuleProvider: AIBusinessRuleProvider,
    private readonly constraintProvider: AIConstraintProvider,
    private readonly outputFormatResolver: AIOutputFormatResolver,
    private readonly renderer: AIPromptRenderer,
    private readonly validator?: AIPromptValidator
  ) {}

  async build(
    request: AIPromptRequest,
    context: AIAssembledContext
  ): Promise<AIResult<AIRenderedPrompt>> {
    const language = this.languageResolver.resolve(request.languagePreference);
    const strategy = this.strategySelector.select(request);

    let prompt: AIPrompt = createEmptyPrompt({
      strategyId: strategy.id,
      language,
      createdAt: Date.now(),
    });

    if (strategy.systemInstructions) {
      prompt = { ...prompt, systemInstructions: strategy.systemInstructions };
    }
    if (strategy.examples) {
      prompt = { ...prompt, examples: strategy.examples };
    }

    const persona = this.personaResolver.resolve(strategy, language);
    if (persona) {
      prompt = {
        ...prompt,
        persona,
        metadata: { ...prompt.metadata, personaId: persona.id },
      };
    }

    prompt = { ...prompt, context: this.contextApplier.apply(context) };
    prompt = { ...prompt, businessRules: this.businessRuleProvider.provide(strategy) };
    prompt = { ...prompt, constraints: this.constraintProvider.provide(strategy) };
    prompt = { ...prompt, outputFormat: this.outputFormatResolver.resolve(strategy, request) };

    if (this.validator) {
      const validation = this.validator.validate(prompt, strategy);
      if (!validation.valid) {
        return {
          ok: false,
          error: {
            code: "invalid_request",
            message: "Assembled prompt failed validation for its strategy.",
            retryable: false,
            cause: validation.issues,
          },
        };
      }
    }

    return { ok: true, value: this.renderer.render(prompt) };
  }
}
