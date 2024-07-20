import { Literal, NamedNode } from "@rdfjs/types";
import { ShapesGraph } from "./ShapesGraph";
import { rdfs } from "@tpluscode/rdf-ns-builders";
import { ShaclModel } from "./ShaclModel";

export class PropertyGroup extends ShaclModel {
  constructor(kwds: { node: NamedNode; shapesGraph: ShapesGraph }) {
    super(kwds);
  }

  get label(): Literal | null {
    return this.findAndMapObject(rdfs.label, (term) =>
      term.termType === "Literal" ? (term as Literal) : null,
    );
  }
}
