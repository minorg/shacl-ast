import { Literal, NamedNode } from "@rdfjs/types";
import { ShapesGraph } from "./ShapesGraph.js";
import { rdfs } from "@tpluscode/rdf-ns-builders";
import { Resource } from "./Resource.js";
import { Maybe } from "purify-ts";

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
