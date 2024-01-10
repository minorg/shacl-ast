import {Shape} from "./Shape";
import {PropertyShape} from "./PropertyShape";
import {BlankNode, NamedNode} from "@rdfjs/types";
import {sh} from "@tpluscode/rdf-ns-builders";

export class NodeShape extends Shape {
  get properties(): readonly PropertyShape[] {
    return this.filterAndMapObjects(sh.property, (propertyObject) => {
      switch (propertyObject.termType) {
        case "BlankNode":
        case "NamedNode":
          return this.shapesGraph.propertyShapeByNode(
            propertyObject as BlankNode | NamedNode
          );
        default:
          return null;
      }
    });
  }
}
