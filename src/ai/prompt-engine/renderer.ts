/**
 * Stage 8 — Render Prompt.
 *
 * The only stage allowed to produce text. Turns a validated, immutable
 * {@link AIPrompt} into the `AIRenderedPrompt` shape `@/ai/prompts`
 * already defines and an `AIProvider` already accepts directly as
 * `AICompletionRequest.messages` — reusing that existing Core Foundation
 * contract rather than inventing a new one, since a rendered prompt *is*
 * exactly what that type was built for. A renderer depends on a
 * {@link AIPromptLocalizer} (`./language`) for language-specific phrasing
 * so it never hardcodes English. `render` is a pure function, matching
 * `AIPromptTemplate.render`'s own "pure function" contract in
 * `@/ai/prompts` — a prompt that reached this stage already passed
 * validation, so rendering never fails.
 *
 * The language this stage renders in comes from `prompt.metadata.language`
 * — already resolved, once, before any stage ran (2026-07-22 architecture
 * review closure). This is the one stage every fragment of the pipeline's
 * language handling was ultimately building toward: every other stage's
 * decision to *not* take language explicitly (see `./strategy`,
 * `./context-application`, `./business-rules`, `./constraints`,
 * `./output-format`) rests on phrasing being exclusively this stage's
 * responsibility — a concrete `AIPromptRenderer` implementation is
 * expected to read `prompt.metadata.language` and pass it to its
 * `AIPromptLocalizer` for every piece of text it produces.
 */

import type { AIRenderedPrompt } from "@/ai/prompts";
import type { AIPrompt } from "./model";

/** Renders a validated prompt into provider-ready messages. */
export interface AIPromptRenderer {
  render(prompt: AIPrompt): AIRenderedPrompt;
}
