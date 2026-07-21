/**
 * Barrel export for the AI provider abstraction layer.
 *
 * Concrete provider adapters (OpenAI, Anthropic, Google, Ollama) are
 * intentionally not implemented here yet — this module defines the
 * {@link AIProvider} runtime contract they will each satisfy, plus the
 * surrounding abstraction (capabilities, metadata, registry, factory,
 * resolution, and error normalization) that lets any future adapter plug
 * in without changing anything that depends on this barrel.
 */
export * from "./types";
export * from "./capabilities";
export * from "./metadata";
export * from "./registry";
export * from "./factory";
export * from "./resolution";
export * from "./errors";
