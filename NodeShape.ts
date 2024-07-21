import { Shape } from "./Shape.js";
import { PropertyShape } from "./PropertyShape.js";
import { BlankNode, NamedNode } from "@rdfjs/types";
import { sh } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";

export class NodeShape extends Shape {
  get properties(): readonly PropertyShape[] {
    return this.filterAndMapObjects(sh.property, (propertyObject) => {
      switch (propertyObject.termType) {
        case "BlankNode":
        case "NamedNode":
          return this.shapesGraph.propertyShapeByNode(
            propertyObject as BlankNode | NamedNode,
          );
        default:
          return Maybe.empty();
      }
    });
  }
}
