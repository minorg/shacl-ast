import {
  BlankNode,
  DatasetCore,
  DefaultGraph,
  NamedNode,
} from "@rdfjs/types";
import { rdfs } from "@tpluscode/rdf-ns-builders";
import TermSet from "@rdfjs/term-set";

export const isRdfSubClassOf = (kwds: {
  dataset: DatasetCore;
  graph?: BlankNode | DefaultGraph | NamedNode;
  subClass: NamedNode;
  superClass: NamedNode;
}): boolean => {
  return isRdfSubClassOfRecursive({ ...kwds, visited: new TermSet() });
};

const isRdfSubClassOfRecursive = (kwds: {
  dataset: DatasetCore;
  graph?: BlankNode | DefaultGraph | NamedNode;
  subClass: NamedNode;
  superClass: NamedNode;
  visited: TermSet;
}): boolean => {
  const { dataset, graph, subClass, superClass, visited } = kwds;

  for (const subClassOfQuad of dataset.match(
    subClass,
    rdfs.subClassOf,
    null,
    graph,
  )) {
    const immediateSuperClass = subClassOfQuad.object;
    if (immediateSuperClass.termType !== "NamedNode") {
      continue;
    }

    if (superClass.equals(immediateSuperClass)) {
      return true;
    }

    if (!visited.add(immediateSuperClass)) {
      // Already visited
      continue;
    }

    // Go up the chain
    if (
      isRdfSubClassOfRecursive({
        dataset,
        graph,
        subClass: immediateSuperClass,
        superClass,
        visited,
      })
    ) {
      return true;
    }
  }

  return false;
};
