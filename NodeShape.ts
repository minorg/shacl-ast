import { Shape } from "./Shape.js";
import { PropertyShape } from "./PropertyShape.js";
import { BlankNode, NamedNode } from "@rdfjs/types";
import { sh } from "@tpluscode/rdf-ns-builders";
import { Maybe } from "purify-ts";
import { mapTermToBoolean } from "./mapTermToBoolean.js";

export class NodeShape extends Shape {
  get closed(): Maybe<boolean> {
    return this.findAndMapObject(sh.closed, mapTermToBoolean);
  }

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
