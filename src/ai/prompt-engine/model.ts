/**
 * The passive data model of the Prompt Engine: the structured
 * {@link AIPrompt} and the components it is built from.
 *
 * "Passive" mirrors `context-engine/model.ts`'s use of the word — nothing
 * here builds, resolves, or renders anything; these are the shapes every
 * pipeline stage reads from and writes to. A Prompt is a plain,
 * immutable value, never a string — turning it into text is the
 * Renderer's job alone (see `./renderer`). Every field but `metadata`,
 * `context`, `businessRules`, `constraints`, and `examples` is optional,
 * because most fields don't exist until their stage has run — the
 * engine (`./engine`) builds a prompt up one stage at a time, never
 * mutating the value it received.
 */

import type { AILanguageCode } from "./language";

/** Freeform instructional framing a strategy provides verbatim. */
export interface AIPromptSystemInstructions {
  readonly text: string;
}

/** The voice a prompt is written in. */
export interface AIPromptPersona {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly traits: readonly string[];
  readonly tone?: string;
}

/**
 * One category's contribution to the prompt. Deliberately structurally
 * close to the Context Engine's `AIContextFragment` (category + opaque
 * data) — this *is* a context fragment, reshaped for prompt consumption
 * by `./context-application`, not a new concept invented here.
 */
export interface AIPromptContextSection {
  readonly category: string;
  readonly content: Readonly<Record<string, unknown>>;
}

/** A positive instruction the prompt asks the model to follow. */
export interface AIPromptBusinessRule {
  readonly id: string;
  readonly description: string;
}

/**
 * A hard limit on what the prompt should ask for. Distinct from
 * {@link AIPromptBusinessRule}'s positive guidance, and from
 * `@/ai/guardrails`'s after-the-fact output checks — a constraint shapes
 * the request itself, before generation ever happens.
 */
export interface AIPromptConstraint {
  readonly id: string;
  readonly description: string;
}

/** A single few-shot example a strategy ships with. */
export interface AIPromptExample {
  readonly input: string;
  readonly output: string;
}

export type AIPromptOutputFormatType = "text" | "json" | "structured";

/** What shape the model's response should take. */
export interface AIPromptOutputFormat {
  readonly type: AIPromptOutputFormatType;
  readonly schema?: Readonly<Record<string, unknown>>;
  readonly instructions?: string;
}

/**
 * Cross-cutting facts about how this prompt was built, populated
 * incrementally by the engine itself as a byproduct of running each
 * stage — not gathered by any one stage on its own, the same way
 * `AIAssembledContext.assembledAt` is set by the Context Engine rather
 * than by any one source.
 */
export interface AIPromptMetadata {
  readonly strategyId?: string;
  readonly personaId?: string;
  readonly language: AILanguageCode;
  readonly createdAt: number;
}

/**
 * The structured prompt every pipeline stage builds up and the Renderer
 * eventually turns into text. Immutable throughout: no stage ever
 * mutates a {@link AIPrompt} it receives, each returns a new one via
 * object spread — the same "no shared mutable state" discipline
 * `orchestration/context.ts`'s `AIExecutionContext.with()` already
 * documents for its own layer.
 */
export interface AIPrompt {
  readonly systemInstructions?: AIPromptSystemInstructions;
  readonly persona?: AIPromptPersona;
  readonly context: readonly AIPromptContextSection[];
  readonly businessRules: readonly AIPromptBusinessRule[];
  readonly constraints: readonly AIPromptConstraint[];
  readonly examples: readonly AIPromptExample[];
  readonly outputFormat?: AIPromptOutputFormat;
  readonly metadata: AIPromptMetadata;
}

/**
 * Create the initial, empty {@link AIPrompt} a pipeline run starts from.
 * The only supported way to obtain one — mirrors `createAssembledContext`
 * and `createExecutionContext` elsewhere in `src/ai`: a factory function,
 * not a public constructor, so the object's shape stays free to evolve.
 */
export function createEmptyPrompt(metadata: AIPromptMetadata): AIPrompt {
  return {
    context: [],
    businessRules: [],
    constraints: [],
    examples: [],
    metadata,
  };
}
