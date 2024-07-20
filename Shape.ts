import { ShaclModel } from "./ShaclModel";
import { rdf, rdfs, sh } from "@tpluscode/rdf-ns-builders";
import { Literal, NamedNode } from "@rdfjs/types";
import { NodeKind } from "./NodeKind.js";
import { isRdfSubClassOf } from "./isRdfSubClassOf.js";

export class Shape extends ShaclModel {
  get description(): Literal | null {
    return this.findAndMapObject(sh.description, (term) =>
      term.termType === "Literal" ? (term as Literal) : null,
    );
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
        ? term
        : null,
    );
  }

  get name(): Literal | null {
    return this.findAndMapObject(sh.name, (term) =>
      term.termType === "Literal" ? (term as Literal) : null,
    );
  }

  get nodeKind(): NodeKind | null {
    return this.findAndMapObject(sh.nodeKind, (term) => {
      if (term.termType !== "NamedNode") {
        return null;
      }
      if (term.equals(sh.BlankNode)) {
        return NodeKind.BLANK_NODE;
      } else if (term.equals(sh.BlankNodeOrIRI)) {
        return NodeKind.BLANK_NODE_OR_IRI;
      } else if (term.equals(sh.BlankNodeOrLiteral)) {
        return NodeKind.BLANK_NODE_OR_LITERAL;
      } else if (term.equals(sh.IRI)) {
        return NodeKind.IRI;
      } else if (term.equals(sh.IRIOrLiteral)) {
        return NodeKind.IRI_OR_LITERAL;
      } else if (term.equals(sh.Literal)) {
        return NodeKind.LITERAL;
      } else {
        return null;
      }
    });
  }

  get targetClasses(): readonly NamedNode[] {
    return this.filterAndMapObjects(sh.targetClass, (term) =>
      term.termType === "NamedNode" ? term : null,
    );
  }

  get targetNodes(): readonly (Literal | NamedNode)[] {
    return this.filterAndMapObjects(sh.targetNode, (term) =>
      term.termType === "Literal" || term.termType === "NamedNode"
        ? term
        : null,
    );
  }

  get targetObjectsOf(): readonly NamedNode[] {
    return this.filterAndMapObjects(sh.targetObjectsOf, (term) =>
      term.termType === "NamedNode" ? term : null,
    );
  }

  get targetSubjectsOf(): readonly NamedNode[] {
    return this.filterAndMapObjects(sh.targetSubjectsOf, (term) =>
      term.termType === "NamedNode" ? term : null,
    );
  }
}
