import { ShaclModel } from "./ShaclModel";
import { rdf, rdfs, sh } from "@tpluscode/rdf-ns-builders";
import { Literal, NamedNode } from "@rdfjs/types";
import { NodeKind } from "./NodeKind.js";
import { isRdfSubClassOf } from "./isRdfSubClassOf.js";
import { Maybe } from "purify-ts";

export class Shape extends ShaclModel {
  get description(): Maybe<Literal> {
    return this.findAndMapObject(sh.description, (term) =>
      term.termType === "Literal" ? Maybe.of(term) : Maybe.empty(),
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
        ? Maybe.of(term)
        : Maybe.empty(),
    );
  }

  get name(): Maybe<Literal> {
    return this.findAndMapObject(sh.name, (term) =>
      term.termType === "Literal" ? Maybe.of(term) : Maybe.empty(),
    );
  }

  get nodeKind(): Maybe<NodeKind> {
    return this.findAndMapObject(sh.nodeKind, (term) => {
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
