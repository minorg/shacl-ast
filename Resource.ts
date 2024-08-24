import type { BlankNode, NamedNode, Term } from "@rdfjs/types";
import { Maybe } from "purify-ts";
import type { ShapesGraph } from "./ShapesGraph.js";

export abstract class Resource {
  readonly node: BlankNode | NamedNode;
  readonly shapesGraph: ShapesGraph;

  constructor({ node, shapesGraph }: Resource.Parameters) {
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
      this.shapesGraph.node,
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
      this.shapesGraph.node,
    )) {
      const mappedObject: Maybe<NonNullable<T>> = callback(quad.object);
      if (mappedObject.isJust()) {
        return mappedObject;
      }
    }
    return Maybe.empty();
  }
}

export namespace Resource {
  export interface Parameters {
    node: BlankNode | NamedNode;
    shapesGraph: ShapesGraph;
  }
}
