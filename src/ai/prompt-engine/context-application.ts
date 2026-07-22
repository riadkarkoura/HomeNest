/**
 * Stage 3 — Apply Context.
 *
 * The seam between the Context Engine and the Prompt Engine: takes the
 * already-assembled, immutable `AIAssembledContext` (Context Engine's
 * finished output — this stage never gathers data itself, never touches
 * a source, never calls the engine) and reshapes its fragments into
 * {@link AIPromptContextSection}s. This one narrow translation step is
 * the whole answer to "how does structured AI Context become a
 * provider-ready prompt" — not a dependency from the Prompt Engine back
 * into how context was gathered, which stays entirely Context Engine's
 * concern.
 */

import type { AIAssembledContext } from "@/ai/context-engine";
import type { AIPromptContextSection } from "./model";

/** Reshapes an assembled context into the prompt's context sections. */
export interface AIPromptContextApplier {
  apply(context: AIAssembledContext): readonly AIPromptContextSection[];
}
