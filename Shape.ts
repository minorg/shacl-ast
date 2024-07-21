import { Resource } from "./Resource.js";
import { sh } from "@tpluscode/rdf-ns-builders";
import { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { NodeKind } from "./NodeKind.js";
import { Maybe } from "purify-ts";
import { getRdfList } from "./getRdfList.js";
import { NodeShape } from "./NodeShape.js";
import { mapTermToNumber } from "./mapTermToNumber.js";

export abstract class Shape extends Resource {
  abstract readonly constraints: Shape.Constraints;
  readonly targets: Shape.Targets;

  constructor(parameters: Resource.Parameters) {
    super(parameters);
    this.targets = new Shape.Targets(parameters);
  }

  get description(): Maybe<Literal> {
    return this.findAndMapObject(sh.description, (term) =>
      term.termType === "Literal" ? Maybe.of(term) : Maybe.empty(),
    );
  }

  get name(): Maybe<Literal> {
    return this.findAndMapObject(sh.name, (term) =>
      term.termType === "Literal" ? Maybe.of(term) : Maybe.empty(),
    );
  }
}

export namespace Shape {
  export class Constraints extends Resource {
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

    get hasValue(): Maybe<BlankNode | Literal | NamedNode> {
      return this.findAndMapObject(sh.hasValue, (term) => {
        switch (term.termType) {
          case "BlankNode":
          case "Literal":
          case "NamedNode":
            return Maybe.of(term);
          default:
            return Maybe.empty();
        }
      });
    }

    get in_(): Maybe<readonly (BlankNode | Literal | NamedNode)[]> {
      return this.findAndMapObject(sh.in, (term) => {
        switch (term.termType) {
          case "BlankNode":
          case "NamedNode":
            return Maybe.of(
              [
                ...getRdfList({
                  dataset: this.dataset,
                  node: term,
                }),
              ].filter((term) => {
                switch (term.termType) {
                  case "BlankNode":
                  case "Literal":
                  case "NamedNode":
                    return true;
                  default:
                    return false;
                }
              }),
            );
          default:
            return Maybe.empty();
        }
      });
    }

    get maxCount(): Maybe<number> {
      return this.findAndMapObject(sh.maxCount, mapTermToNumber);
    }

    get maxExclusive(): Maybe<Literal> {
      return this.findAndMapObject(sh.maxExclusive, (term) =>
        term.termType === "Literal" ? Maybe.of(term) : Maybe.empty(),
      );
    }

    get maxInclusive(): Maybe<Literal> {
      return this.findAndMapObject(sh.maxInclusive, (term) =>
        term.termType === "Literal" ? Maybe.of(term) : Maybe.empty(),
      );
    }

    get minCount(): Maybe<number> {
      return this.findAndMapObject(sh.minCount, mapTermToNumber);
    }

    get minExclusive(): Maybe<Literal> {
      return this.findAndMapObject(sh.minExclusive, (term) =>
        term.termType === "Literal" ? Maybe.of(term) : Maybe.empty(),
      );
    }

    get minInclusive(): Maybe<Literal> {
      return this.findAndMapObject(sh.minInclusive, (term) =>
        term.termType === "Literal" ? Maybe.of(term) : Maybe.empty(),
      );
    }

    get nodeKinds(): readonly NodeKind[] {
      return this.filterAndMapObjects(sh.nodeKind, (term) => {
        if (term.termType !== "NamedNode") {
          return Maybe.empty();
        }
        if (term.equals(sh.BlankNode)) {
          return Maybe.of(NodeKind.BLANK_NODE);
        } else if (term.equals(sh.BlankNodeOrIRI)) {
          return Maybe.of(NodeKind.BLANK_NODE_OR_IRI);
        } else if (term.equals(sh.BlankNodeOrLiteral)) {
          return Maybe.of(NodeKind.BLANK_NODE_OR_LITERAL);
        } else if (term.equals(sh.IRI)) {
          return Maybe.of(NodeKind.IRI);
        } else if (term.equals(sh.IRIOrLiteral)) {
          return Maybe.of(NodeKind.IRI_OR_LITERAL);
        } else if (term.equals(sh.Literal)) {
          return Maybe.of(NodeKind.LITERAL);
        } else {
          return Maybe.empty();
        }
      });
    }

    get nodes(): readonly NodeShape[] {
      return this.filterAndMapObjects(sh.node, (term) => {
        switch (term.termType) {
          case "BlankNode":
          case "NamedNode":
            return this.shapesGraph.nodeShapeByNode(term);
          default:
            return Maybe.empty();
        }
      });
    }

    get or(): readonly Shape[] {
      const shapes: Shape[] = [];
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

        for (const shapeNode of getRdfList({
          dataset: this.dataset,
          graph: this.shapesGraph.graphNode,
          node: orQuad.object,
        })) {
          switch (shapeNode.termType) {
            case "BlankNode":
            case "NamedNode":
              shapes.push(...this.shapesGraph.shapeByNode(shapeNode).toList());
              break;
          }
        }
      }
      return shapes;
    }
  }

  export class Targets extends Resource {
    get targetClasses(): readonly NamedNode[] {
      return this.filterAndMapObjects(sh.targetClass, (term) =>
        term.termType === "NamedNode" ? Maybe.of(term) : Maybe.empty(),
      );
    }

    get targetNodes(): readonly (Literal | NamedNode)[] {
      return this.filterAndMapObjects(sh.targetNode, (term) =>
        term.termType === "Literal" || term.termType === "NamedNode"
          ? Maybe.of(term)
          : Maybe.empty(),
      );
    }

    get targetObjectsOf(): readonly NamedNode[] {
      return this.filterAndMapObjects(sh.targetObjectsOf, (term) =>
        term.termType === "NamedNode" ? Maybe.of(term) : Maybe.empty(),
      );
    }

    get targetSubjectsOf(): readonly NamedNode[] {
      return this.filterAndMapObjects(sh.targetSubjectsOf, (term) =>
        term.termType === "NamedNode" ? Maybe.of(term) : Maybe.empty(),
      );
    }
  }
}
