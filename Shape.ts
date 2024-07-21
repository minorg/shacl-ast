import { ShaclModel } from "./ShaclModel";
import { rdf, rdfs, sh } from "@tpluscode/rdf-ns-builders";
import { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { NodeKind } from "./NodeKind.js";
import { isRdfSubClassOf } from "./isRdfSubClassOf.js";
import { Maybe } from "purify-ts";
import { getRdfList } from "./getRdfList.js";
import { NodeShape } from "./NodeShape.js";
import { mapTermToNumber } from "./mapTermToNumber.js";

export class Shape extends ShaclModel {
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

  get description(): Maybe<Literal> {
    return this.findAndMapObject(sh.description, (term) =>
      term.termType === "Literal" ? Maybe.of(term) : Maybe.empty(),
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

  /**
   * The rdf:Class's this shape is or is a subClassOf.
   */
  get implicitClassTargets(): readonly NamedNode[] {
    return this.filterAndMapObjects(rdf.type, (term) =>
      term.termType === "NamedNode" &&
      isRdfSubClassOf({
        dataset: this.dataset,
        graph: this.shapesGraph.graphNode,
        subClass: term,
        superClass: rdfs.Class,
      })
        ? Maybe.of(term)
        : Maybe.empty(),
    );
  }

  get maxCount(): Maybe<number> {
    return this.findAndMapObject(sh.maxCount, mapTermToNumber);
  }

  get minCount(): Maybe<number> {
    return this.findAndMapObject(sh.minCount, mapTermToNumber);
  }

  get name(): Maybe<Literal> {
    return this.findAndMapObject(sh.name, (term) =>
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

  get nodeShapes(): readonly NodeShape[] {
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
