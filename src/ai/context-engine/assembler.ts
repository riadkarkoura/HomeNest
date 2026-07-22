/**
 * Layer 3 — the Context Assembler contract.
 *
 * The assembler's single responsibility is to turn a set of gathered
 * fragments into one immutable {@link AIAssembledContext}. It fulfils the
 * "Context Builder" role of the three-layer design; it is named
 * *Assembler* to avoid colliding with the pre-existing `AIContextBuilder`
 * in `@/ai/context`, which is an unrelated primitive.
 *
 * Making assembly a contract (not just a function) is the Open/Closed seam
 * for the final step: a different assembly strategy — deduplication,
 * priority merging, redaction — is a new {@link AIContextAssembler}, with
 * no change to the engine. {@link DefaultContextAssembler} is the provided,
 * real default: a straight, order-preserving assembly.
 */

import type { AIContextRequest } from "./request";
import type { AIContextFragment } from "./model";
import type { AIAssembledContext } from "./context";
import { createAssembledContext } from "./context";

/** Assembles gathered fragments into the final immutable context. */
export interface AIContextAssembler {
  assemble(
    request: AIContextRequest,
    fragments: readonly AIContextFragment[]
  ): AIAssembledContext;
}

/** The default assembler: assembles fragments as gathered, no transformation. */
export class DefaultContextAssembler implements AIContextAssembler {
  assemble(
    request: AIContextRequest,
    fragments: readonly AIContextFragment[]
  ): AIAssembledContext {
    return createAssembledContext(request, fragments);
  }
}
