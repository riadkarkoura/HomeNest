/**
 * Stage 2 — Resolve Persona.
 *
 * Turns the selected strategy's persona reference into the concrete
 * {@link AIPromptPersona} that will frame the prompt's voice. Kept
 * independent of `AIPromptStrategy` itself (a strategy only carries a
 * persona *id*) so personas can be authored, versioned, and reused across
 * strategies without this stage or the strategy contract changing.
 *
 * The one collaborator in this pipeline that takes the resolved
 * `AILanguageCode` explicitly, unlike its siblings (`./strategy`,
 * `./business-rules`, `./constraints`, `./output-format` — see each
 * file's own note on why). Voice, tone, and cultural framing are
 * inherently language-coupled in a way none of those other stages are:
 * a persona resolver may legitimately return a different concrete
 * `AIPromptPersona` for the same strategy depending on language (a
 * different name, a different register of formality), which is a
 * *selection* decision this stage owns — not phrasing, which stays the
 * Renderer's job alone via `AIPromptLocalizer`.
 */

import type { AIPromptStrategy } from "./strategy";
import type { AIPromptPersona } from "./model";
import type { AILanguageCode } from "./language";

/** Resolves a strategy's default persona reference to a concrete persona. */
export interface AIPersonaResolver {
  resolve(strategy: AIPromptStrategy, language: AILanguageCode): AIPromptPersona | undefined;
}

/** A lookup contract for a library of personas. */
export interface AIPersonaRegistry {
  register(persona: AIPromptPersona): void;
  get(id: string): AIPromptPersona | undefined;
}
