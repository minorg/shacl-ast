import { Shape } from "./Shape.js";
import { BlankNode, Literal, NamedNode, Term } from "@rdfjs/types";
import { dash, sh, xsd } from "@tpluscode/rdf-ns-builders";
import { PropertyGroup } from "./PropertyGroup.js";
import { NodeShape } from "./NodeShape.js";
import { getRdfList } from "./getRdfList.js";
import { mapTermToNumber } from "./mapTermToNumber.js";
import { Maybe } from "purify-ts";

type PropertyShapeValue = BlankNode | Literal | NamedNode;

export class PropertyShape extends Shape {
  get classes(): readonly NamedNode[] {
    return this.filterAndMapObjects(sh.class, (term) =>
      term.termType === "NamedNode" ? Maybe.of(term) : Maybe.empty(),
    );
  }

  get datatype(): Maybe<NamedNode> {
    return this.findAndMapObject(sh.datatype, (term) =>
      term.termType === "NamedNode" ? Maybe.of(term) : Maybe.empty(),
    );
  }

  get defaultValue(): Maybe<PropertyShapeValue> {
    return this.findAndMapObject(sh.defaultValue, (term) =>
      hasPropertyShapeValueTermType(term)
        ? Maybe.of(term as PropertyShapeValue)
        : Maybe.empty(),
    );
  }

  get editor(): Maybe<NamedNode> {
    return this.findAndMapObject(dash.editor, (term) =>
      term.termType === "NamedNode" ? Maybe.of(term) : Maybe.empty(),
    );
  }

  get group(): Maybe<PropertyGroup> {
    return this.findAndMapObject(sh.group, (term) =>
      term.termType === "NamedNode"
        ? Maybe.of(this.shapesGraph.propertyGroupByNode(term))
        : Maybe.empty(),
    );
  }

  get hasValue(): Maybe<PropertyShapeValue> {
    return this.findAndMapObject(sh.hasValue, (term) =>
      hasPropertyShapeValueTermType(term)
        ? Maybe.of(term as PropertyShapeValue)
        : Maybe.empty(),
    );
  }

  get in_(): Maybe<readonly PropertyShapeValue[]> {
    return this.findAndMapObject(sh.in, (term) => {
      switch (term.termType) {
        case "BlankNode":
        case "NamedNode":
          return Maybe.of([
            ...getRdfList({
              dataset: this.dataset,
              node: term,
            }),
          ]);
        default:
          return Maybe.empty();
      }
    });
  }

  get maxCount(): Maybe<number> {
    return this.findAndMapObject(sh.maxCount, mapTermToNumber);
  }

  get minCount(): Maybe<number> {
    return this.findAndMapObject(sh.minCount, mapTermToNumber);
  }

  get nodeShapes(): readonly NodeShape[] {
    return this.filterAndMapObjects(sh.node, (term) => {
      switch (term.termType) {
        case "BlankNode":
        case "NamedNode":
          return Maybe.of(this.shapesGraph.nodeShapeByNode(term));
        default:
          return Maybe.empty();
      }
    });
  }

  get or(): readonly PropertyShape[] {
    const propertyShapes: PropertyShape[] = [];
    for (const orQuad of this.dataset.match(
      this.node,
      sh.or,
      null,
      this.shapesGraph.graphNode,
    )) {
      switch (orQuad.object.termType) {
        case "BlankNode":
        case "NamedNode":
          break;
        default:
          continue;
      }

      for (const propertyShapeNode of getRdfList({
        dataset: this.dataset,
        graph: this.shapesGraph.graphNode,
        node: orQuad.object,
      })) {
        switch (propertyShapeNode.termType) {
          case "BlankNode":
          case "NamedNode":
            propertyShapes.push(
              this.shapesGraph.propertyShapeByNode(propertyShapeNode),
            );
            break;
        }
      }
    }
    return propertyShapes;
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
    return this.findAndMapObject(dash.singleLine, (term) => {
      if (term.termType !== "Literal") {
        return Maybe.empty();
      } else if (!term.datatype.equals(xsd.boolean)) {
        return Maybe.empty();
      }
      switch (term.value.toLowerCase()) {
        case "1":
        case "true":
          return Maybe.of(true);
        case "0":
        case "false":
          return Maybe.of(false);
        default:
          return Maybe.empty();
      }
    });
  }

  get viewer(): Maybe<NamedNode> {
    return this.findAndMapObject(dash.viewer, (term) =>
      term.termType === "NamedNode" ? Maybe.of(term) : Maybe.empty(),
    );
  }
}

const hasPropertyShapeValueTermType = (term: Term): boolean => {
  switch (term.termType) {
    case "BlankNode":
    case "NamedNode":
    case "Literal":
      return true;
    default:
      return false;
  }
};
