import type { Literal, NamedNode } from "@rdfjs/types";
import { rdfs } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";
import { Resource } from "./Resource.js";
import type { ShapesGraph } from "./ShapesGraph.js";

export class PropertyGroup extends Resource {
  constructor(kwds: { node: NamedNode; shapesGraph: ShapesGraph }) {
    super(kwds);
  }

  get label(): Maybe<Literal> {
    return this.findAndMapObject(rdfs.label, (term) =>
      term.termType === "Literal" ? Maybe.of(term) : Maybe.empty(),
    );
  }
}
