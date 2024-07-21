import { BlankNode, NamedNode, Term } from "@rdfjs/types";
import { ShapesGraph } from "./ShapesGraph.js";
import { Maybe } from "purify-ts";

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
    callback: (value: Term) => Maybe<NonNullable<T>>,
  ): readonly NonNullable<T>[] {
    const mappedObjects: NonNullable<T>[] = [];
    for (const quad of this.dataset.match(
      this.node,
      property,
      null,
      this.shapesGraph.graphNode,
    )) {
      const mappedObject: Maybe<NonNullable<T>> = callback(quad.object);
      if (mappedObject.isJust()) {
        mappedObjects.push(mappedObject.extract());
      }
    }
    return mappedObjects;
  }

  protected findAndMapObject<T>(
    property: NamedNode,
    callback: (value: Term) => Maybe<NonNullable<T>>,
  ): Maybe<NonNullable<T>> {
    for (const quad of this.dataset.match(
      this.node,
      property,
      null,
      this.shapesGraph.graphNode,
    )) {
      const mappedObject: Maybe<NonNullable<T>> = callback(quad.object);
      if (mappedObject.isJust()) {
        return mappedObject;
      }
    }
    return Maybe.empty();
  }
}
