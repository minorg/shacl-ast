import { BlankNode, NamedNode, Term } from "@rdfjs/types";
import { ShapesGraph } from "./ShapesGraph";

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

  protected findAndMapObject<T>(
    property: NamedNode,
    callback: (value: Term) => NonNullable<T> | null,
  ): NonNullable<T> | null {
    for (const quad of this.dataset.match(
      this.node,
      property,
      null,
      this.shapesGraph.graphNode,
    )) {
      const mappedObject: T | null = callback(quad.object);
      if (mappedObject !== null) {
        return mappedObject as NonNullable<T>;
      }
    }
    return null;
  }

  protected filterAndMapObjects<T>(
    property: NamedNode,
    callback: (value: Term) => NonNullable<T> | null,
  ): readonly NonNullable<T>[] {
    const mappedObjects: NonNullable<T>[] = [];
    for (const quad of this.dataset.match(
      this.node,
      property,
      null,
      this.shapesGraph.graphNode,
    )) {
      const mappedObject: T | null = callback(quad.object);
      if (mappedObject !== null) {
        mappedObjects.push(mappedObject as NonNullable<T>);
      }
    }
    return mappedObjects;
  }
}
