import { Shape } from "./Shape.js";
import { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { dash, sh } from "@tpluscode/rdf-ns-builders";
import { PropertyGroup } from "./PropertyGroup.js";
import { getRdfList } from "./getRdfList.js";
import { mapTermToNumber } from "./mapTermToNumber.js";
import { Maybe } from "purify-ts";
import { mapTermToBoolean } from "./mapTermToBoolean.js";
import { Resource } from "./Resource.js";

type PropertyShapeValue = BlankNode | Literal | NamedNode;

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

  get path(): NamedNode {
    return this.findAndMapObject(sh.path, (term) =>
      term.termType === "NamedNode" ? Maybe.of(term) : Maybe.empty(),
    ).unsafeCoerce();
  }

  get singleLine(): Maybe<boolean> {
    return this.findAndMapObject(dash.singleLine, mapTermToBoolean);
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
