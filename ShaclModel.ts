import { BlankNode, NamedNode, Term } from "@rdfjs/types";
import { ShapesGraph } from "./ShapesGraph.js";

export abstract class ShaclModel {
  readonly node: BlankNode | NamedNode;
  readonly shapesGraph: ShapesGraph;

  constructor({
    node,
    shapesGraph,
  }: {
    node: BlankNode | NamedNode;
    shapesGraph: ShapesGraph;
  }) {
    this.node = node;
    this.shapesGraph = shapesGraph;
  }

  get dataset() {
    return this.shapesGraph.dataset;
  }

  protected filterAndMapObjects<T>(
    property: NamedNode,
    callback: (value: Term) => NonNullable | null,
  ): readonly NonNullable[] {
    const mappedObjects: NonNullable[] = [];
    for (const quad of this.dataset.match(
      this.node,
      property,
      null,
      this.shapesGraph.graphNode,
    )) {
      const mappedObject: T | null = callback(quad.object);
      if (mappedObject !== null) {
        mappedObjects.push(mappedObject as NonNullable);
      }
    }
    return mappedObjects;
  }

  protected findAndMapObject<T>(
    property: NamedNode,
    callback: (value: Term) => NonNullable | null,
  ): NonNullable | null {
    for (const quad of this.dataset.match(
      this.node,
      property,
      null,
      this.shapesGraph.graphNode,
    )) {
      const mappedObject: T | null = callback(quad.object);
      if (mappedObject !== null) {
        return mappedObject as NonNullable;
      }
    }
    return null;
  }
}
