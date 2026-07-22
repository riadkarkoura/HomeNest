/**
 * Stage 1 — Select Strategy.
 *
 * A strategy is a named recipe for one kind of prompt (a Home Consultant
 * turn, a product-recommendation turn, a future admin content-generation
 * turn): which persona it defaults to, which output format it expects,
 * and the strategy-level content — system instructions, few-shot
 * examples — that belongs to "which recipe applies" rather than to any
 * later stage. Selecting one is a pure decision, exactly like
 * `context-engine/resolver.ts`'s `AIContextResolver`: no fetching, no
 * side effects, just "which strategy applies to this request."
 */

import type { AIPromptRequest } from "./request";
import type {
  AIPromptOutputFormatType,
  AIPromptSystemInstructions,
  AIPromptExample,
} from "./model";

/** A named, reusable prompt recipe. */
export interface AIPromptStrategy {
  /** A stable identifier, unique across the registry it's registered in. */
  readonly id: string;
  /** A short, human-readable description of what this strategy is for. */
  readonly description: string;
  /** The persona `./persona`'s resolver defaults to for this strategy. */
  readonly defaultPersonaId?: string;
  /** The output format `./output-format`'s resolver defaults to. */
  readonly defaultOutputFormat?: AIPromptOutputFormatType;
  /** Verbatim instructional framing this strategy contributes. */
  readonly systemInstructions?: AIPromptSystemInstructions;
  /** Few-shot examples this strategy ships with. */
  readonly examples?: readonly AIPromptExample[];
}

/** Decides which strategy applies to a request. Pure — no fetching. */
export interface AIPromptStrategySelector {
  select(request: AIPromptRequest): AIPromptStrategy;
}

/** A lookup contract for a library of strategies. */
export interface AIPromptStrategyRegistry {
  register(strategy: AIPromptStrategy): void;
  get(id: string): AIPromptStrategy | undefined;
  list(): readonly AIPromptStrategy[];
}
