/**
 * Barrel export for the AI provider contract.
 *
 * Concrete provider adapters (OpenAI, Anthropic, Google, Ollama) are
 * intentionally not implemented here yet — this module defines only the
 * {@link AIProvider} contract they will each satisfy.
 */
export * from "./types";
