/**
 * The language contract: how the Prompt Engine decides which language a
 * prompt is built for, and how a stage that needs to say something in
 * that language does so — all without any stage, or the Renderer itself,
 * ever knowing about a specific AI provider.
 *
 * Explicitly a contract only, per this sprint's scope. No detection
 * algorithm and no translated strings live here — see {@link AIPromptLocalizer}'s
 * own note. Supporting a new language is adding a union member here plus
 * a new concrete {@link AILanguageDetector}/{@link AIPromptLocalizer}
 * elsewhere; nothing in this file, or any pipeline stage, needs to change
 * (the same Open/Closed reasoning `@/ai/shared`'s `AIProviderName`
 * already documents for providers).
 */

/**
 * The closed set of languages this foundation is built for. A plain,
 * closed union rather than an open `string`, mirroring `AIProviderName`'s
 * reasoning: a typo'd language code should be a compile error, not a
 * silent fallback.
 */
export type AILanguageCode = "ar" | "de" | "en";

/**
 * How a request states its language: either the caller already knows it
 * ("preferred" — no detection needed at all), or wants the engine to work
 * it out from some sample text ("auto", via {@link AILanguageDetector}).
 */
export type AILanguagePreference =
  | { readonly mode: "preferred"; readonly language: AILanguageCode }
  | { readonly mode: "auto"; readonly sampleText: string };

/**
 * Guesses a language from a sample of text. Not implemented here — real
 * detection (a model call, a heuristic, a library) is deliberately out of
 * scope for this foundation. Returns `undefined` when the sample is too
 * short or ambiguous to classify; a resolver decides what to do next.
 */
export interface AILanguageDetector {
  detect(sampleText: string): AILanguageCode | undefined;
}

/**
 * Resolves a preference into one concrete {@link AILanguageCode}. Kept
 * separate from {@link AILanguageDetector} on purpose: detection is "what
 * language does this text look like," resolution is "given a preference
 * (and, for `"auto"`, a detector's answer), what language does this
 * prompt actually use" — including the fallback policy when detection is
 * inconclusive, which is implementation policy, not architecture.
 */
export interface AILanguageResolver {
  resolve(preference: AILanguagePreference): AILanguageCode;
}

/**
 * A source of language-specific phrasing (section labels, connective
 * text, persona framing) a {@link AIPromptRenderer} draws on instead of
 * hardcoding English. Deliberately keyed and generic, like
 * `AIPromptRegistry`'s template lookup in `@/ai/prompts` — a concrete
 * localizer (backed by a translation file, a database table, or anything
 * else) is future implementation work; the Renderer only ever depends on
 * this contract, never a specific language's strings.
 */
export interface AIPromptLocalizer {
  localize(key: string, language: AILanguageCode): string;
}
