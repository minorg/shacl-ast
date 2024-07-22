import { BlankNode, DatasetCore, NamedNode, Term } from "@rdfjs/types";
import { rdf, sh } from "@tpluscode/rdf-ns-builders";
import { Either, Left } from "purify-ts";
import { getRdfList } from "./getRdfList.js";

export interface AlternativePath {
  readonly kind: "AlternativePath";
  readonly members: readonly PropertyPath[];
}

export interface InversePath {
  readonly kind: "InversePath";
  readonly path: PropertyPath;
}

export interface OneOrMorePath {
  readonly kind: "OneOrMorePath";
  readonly path: PropertyPath;
}

export interface PredicatePath {
  readonly kind: "PredicatePath";
  readonly iri: NamedNode;
}

export interface SequencePath {
  readonly kind: "SequencePath";
  readonly members: readonly PropertyPath[];
}

export interface ZeroOrMorePath {
  readonly kind: "ZeroOrMorePath";
  readonly path: PropertyPath;
}

export interface ZeroOrOnePath {
  readonly kind: "ZeroOrOnePath";
  readonly path: PropertyPath;
}

// 2.3.1 SHACL Property Paths
export type PropertyPath =
  | AlternativePath
  | InversePath
  | OneOrMorePath
  | PredicatePath
  | SequencePath
  | ZeroOrMorePath
  | ZeroOrOnePath;

export namespace PropertyPath {
  export function fromNode({
    dataset,
    node,
  }: {
    dataset: DatasetCore;
    node: BlankNode | NamedNode;
  }): Either<Error, PropertyPath> {
    // Predicate path
    // sh:path ex:parent
    if (node.termType === "NamedNode") {
      return Either.of({ iri: node, kind: "PredicatePath" });
    }

    // The other property path types are BlankNodes

    const getPropertyPathList = (
      listNode: BlankNode | NamedNode,
    ): Either<Error, readonly PropertyPath[]> => {
      return Either.encase(() => [
        ...getRdfList({ dataset, node: listNode }),
      ]).chain((terms) => {
        const members: PropertyPath[] = [];
        for (const term of terms) {
          const memberNode = toPropertyPathNode(term);
          if (memberNode == null) {
            return Left(
              new Error(
                `property path list has non-BlankNode/NamedNode member: ${term.termType} ${term.value}`,
              ),
            );
          }
          const member = PropertyPath.fromNode({
            dataset,
            node: memberNode,
          });
          if (member.isLeft()) {
            return member;
          }
          members.push(member.extract() as PropertyPath);
        }
        return Either.of(members) satisfies Either<
          Error,
          readonly PropertyPath[]
        >;
      });
    };

    for (const quad of dataset.match(node, null, null, null)) {
      const quadObject = toPropertyPathNode(quad.object);
      if (quadObject === null) {
        return Left(
          new Error(
            `non-BlankNode/NamedNode property path object on path ${node.value}: ${quad.object.termType} ${quad.object.value}`,
          ),
        );
      }

      // Alternative path
      // sh:path: [ sh:alternativePath ( ex:father ex:mother  ) ]
      if (quad.predicate.equals(sh.alternativePath)) {
        return getPropertyPathList(quadObject).map((members) => ({
          kind: "AlternativePath",
          members,
        }));
      }

      // Inverse path
      // sh:path: [ sh:inversePath ex:parent ]
      if (quad.predicate.equals(sh.inversePath)) {
        return PropertyPath.fromNode({ dataset, node: quadObject }).map(
          (path) => ({ kind: "InversePath", path }),
        );
      }

      // One or more path
      if (quad.predicate.equals(sh.oneOrMorePath)) {
        return PropertyPath.fromNode({ dataset, node: quadObject }).map(
          (path) => ({ kind: "OneOrMorePath", path }),
        );
      }

      // Sequence path
      // sh:path ( ex:parent ex:firstName )
      if (quad.predicate.equals(rdf.first)) {
        return getPropertyPathList(node).map((members) => ({
          kind: "SequencePath",
          members,
        }));
      }

      // Zero or more path
      if (quad.predicate.equals(sh.zeroOrMorePath)) {
        return PropertyPath.fromNode({ dataset, node: quadObject }).map(
          (path) => ({ kind: "ZeroOrMorePath", path }),
        );
      }

      if (quad.predicate.equals(sh.zeroOrOnePath)) {
        return PropertyPath.fromNode({ dataset, node: quadObject }).map(
          (path) => ({ kind: "ZeroOrOnePath", path }),
        );
      }
    }

    return Left(
      new Error(`unrecognized or ill-formed SHACL property path ${node.value}`),
    );
  }

  function toPropertyPathNode(term: Term): BlankNode | NamedNode | null {
    switch (term.termType) {
      case "BlankNode":
      case "NamedNode":
        return term;
      default:
        return null;
    }
  }
}
