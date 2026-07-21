/**
 * The prompt contract: named, described, renderable templates that turn
 * a set of variables into the provider-agnostic {@link AIMessage} shape
 * a {@link AIProvider} can accept.
 *
 * A template's `render` is a pure function — the same variables always
 * produce the same messages. Anything that depends on external state
 * (the current {@link AIContext}, a memory lookup) belongs in the code
 * that gathers the variables before calling `render`, not inside the
 * template itself.
 */

import type { AIMessage } from "@/ai/shared";

/**
 * The values a {@link AIPromptTemplate} accepts for substitution. Kept to
 * primitive values deliberately — a template's job is to fill in
 * placeholders, not to receive complex objects it would need its own
 * logic to interpret.
 */
export type AIPromptVariables = Record<string, string | number | boolean>;

/** The result of rendering a template: a ready-to-send message list. */
export interface AIRenderedPrompt {
  readonly messages: readonly AIMessage[];
}

/**
 * A single named, reusable prompt. `id` and `description` exist so a
 * library of prompts is self-documenting and discoverable — a future
 * admin or debugging surface can list every registered prompt and what
 * it's for without reading its implementation.
 */
export interface AIPromptTemplate {
  /** A stable identifier, unique across the registry it's registered in. */
  readonly id: string;
  /** A short, human-readable description of what this prompt is for. */
  readonly description: string;
  /** Produce the final messages for this template given a set of variables. */
  render(variables: AIPromptVariables): AIRenderedPrompt;
}

/**
 * A lookup contract for a library of prompts. Deliberately silent about
 * *how* templates are stored (in memory, loaded from files, fetched from
 * a database) — that's an implementation decision for later, not
 * something this contract needs to commit to now.
 */
export interface AIPromptRegistry {
  register(template: AIPromptTemplate): void;
  get(id: string): AIPromptTemplate | undefined;
}
