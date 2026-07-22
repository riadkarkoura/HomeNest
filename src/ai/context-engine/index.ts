/**
 * Barrel export for the Context Engine.
 *
 * The Context Engine gathers, resolves, and assembles the complete,
 * immutable context an AI request needs — before any prompt is generated
 * or any provider is called. It is organized as three single-responsibility
 * layers coordinated by the engine: sources (provide), resolver (decide),
 * assembler (assemble). Concrete sources, resolvers, and validators arrive
 * with the features that need them; this module ships their contracts plus
 * the real, feature-agnostic mechanics (registry, assembler, engine, and
 * the immutable assembled context).
 */
export * from "./model";
export * from "./request";
export * from "./source";
export * from "./registry";
export * from "./resolver";
export * from "./context";
export * from "./assembler";
export * from "./validation";
export * from "./engine";
