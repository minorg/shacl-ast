import { Shape } from "./Shape.js";
import { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { dash, sh } from "@tpluscode/rdf-ns-builders";
import { PropertyGroup } from "./PropertyGroup.js";
import { mapTermToNumber } from "./mapTermToNumber.js";
import { Maybe } from "purify-ts";
import { mapTermToBoolean } from "./mapTermToBoolean.js";
import { Resource } from "./Resource.js";
import { PropertyPath } from "./PropertyPath.js";

export class PropertyShape extends Shape {
  readonly constraints: PropertyShape.Constraints;

  constructor(parameters: Resource.Parameters) {
    super(parameters);
    this.constraints = new PropertyShape.Constraints(parameters);
  }

  get editor(): Maybe<NamedNode> {
    return this.findAndMapObject(dash.editor, (term) =>
      term.termType === "NamedNode" ? Maybe.of(term) : Maybe.empty(),
    );
  }

  get group(): Maybe<PropertyGroup> {
    return this.findAndMapObject(sh.group, (term) =>
      term.termType === "NamedNode"
        ? this.shapesGraph.propertyGroupByNode(term)
        : Maybe.empty(),
    );
  }

  get order(): Maybe<number> {
    return this.findAndMapObject(sh.maxCount, mapTermToNumber);
  }

  get path(): PropertyPath {
    for (const quad of this.dataset.match(
      this.node,
      sh.path,
      null,
      this.shapesGraph.graphNode,
    )) {
      switch (quad.object.termType) {
        case "BlankNode":
        case "NamedNode":
          const path = PropertyPath.fromNode({
            dataset: this.dataset,
            node: quad.object,
          });
          if (path.isLeft()) {
            throw path.extract() as Error;
          }
          return path.extract() as PropertyPath;
        default:
          throw new Error(
            `non-BlankNode/NamedNode sh:path found on property shape ${this.node.value}: ${quad.object.termType} ${quad.object.value}`,
          );
      }
    }
    throw new Error(`no sh:path found on property shape ${this.node.value}`);
  }

  get singleLine(): Maybe<boolean> {
    return this.findAndMapObject(dash.singleLine, mapTermToBoolean);
  }

  override toString(): string {
    const keyValues: string[] = [`node=${this.node.value}`];
    const path = this.path;
    if (path.kind === "PredicatePath") {
      keyValues.push(`path=${path.iri.value}`);
    }
    return `PropertyShape(${keyValues.join(", ")})`;
  }

  get viewer(): Maybe<NamedNode> {
    return this.findAndMapObject(dash.viewer, (term) =>
      term.termType === "NamedNode" ? Maybe.of(term) : Maybe.empty(),
    );
  }
}

export namespace PropertyShape {
  export class Constraints extends Shape.Constraints {
    get defaultValue(): Maybe<BlankNode | Literal | NamedNode> {
      return this.findAndMapObject(sh.defaultValue, (term) => {
        switch (term.termType) {
          case "BlankNode":
          case "NamedNode":
          case "Literal":
            return Maybe.of(term);
          default:
            return Maybe.empty();
        }
      });
    }
  }
}
