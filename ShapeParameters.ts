import { BlankNode, NamedNode } from "@rdfjs/types";
import { ShapesGraph } from "./ShapesGraph.js";

export interface ShapeParameters {
  node: BlankNode | NamedNode;
  shapesGraph: ShapesGraph;
}
