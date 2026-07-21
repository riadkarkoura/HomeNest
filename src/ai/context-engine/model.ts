/**
 * The passive data model of the Context Engine: the categories context is
 * organized by, the fragment a single source produces, and the metadata
 * describing a source.
 *
 * "Passive" means nothing here fetches, decides, or assembles — these are
 * the shapes the three engine layers (sources, resolver, assembler) all
 * agree on. Keeping them in one small module gives every layer a shared
 * vocabulary without any layer importing another.
 */

/**
 * The dimension context is organized by. Each category is one kind of
 * information an AI request may need, and each is provided by its own
 * source. Adding a category is a one-line change here plus a source for
 * it — the resolver, assembler, and engine never change (Open/Closed).
 */
export type AIContextCategory =
  | "user"
  | "home"
  | "session"
  | "conversation"
  | "product"
  | "runtime"
  | "business"
  | "feature"
  | "environment";

/**
 * Static metadata describing one context source: its stable identity, the
 * single category it is responsible for, and a human-readable description.
 * A source's descriptor is how the registry and resolver reason about it
 * without invoking it.
 */
export interface AIContextSourceDescriptor {
  /** A stable, unique identifier for the source. */
  readonly id: string;
  /** The one category this source provides. */
  readonly category: AIContextCategory;
  /** A short, human-readable description of what this source gathers. */
  readonly description: string;
}

/**
 * One source's immutable contribution to the assembled context: the
 * category it belongs to, which source produced it, and the gathered
 * data. `data` is a read-only record because the Context Engine treats a
 * fragment's contents as opaque — only the eventual Prompt Engine
 * interprets them.
 */
export interface AIContextFragment {
  /** The category this fragment belongs to. */
  readonly category: AIContextCategory;
  /** The id of the source that produced this fragment. */
  readonly source: string;
  /** The gathered data, opaque to the engine. */
  readonly data: Readonly<Record<string, unknown>>;
}
