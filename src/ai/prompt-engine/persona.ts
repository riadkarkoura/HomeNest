/**
 * Stage 2 — Resolve Persona.
 *
 * Turns the selected strategy's persona reference into the concrete
 * {@link AIPromptPersona} that will frame the prompt's voice. Kept
 * independent of `AIPromptStrategy` itself (a strategy only carries a
 * persona *id*) so personas can be authored, versioned, and reused across
 * strategies without this stage or the strategy contract changing.
 */

import type { AIPromptStrategy } from "./strategy";
import type { AIPromptPersona } from "./model";

/** Resolves a strategy's default persona reference to a concrete persona. */
export interface AIPersonaResolver {
  resolve(strategy: AIPromptStrategy): AIPromptPersona | undefined;
}

/** A lookup contract for a library of personas. */
export interface AIPersonaRegistry {
  register(persona: AIPromptPersona): void;
  get(id: string): AIPromptPersona | undefined;
}
