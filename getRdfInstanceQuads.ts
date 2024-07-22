import {
  DatasetCore,
  NamedNode,
  Quad,
  Quad_Graph,
  Variable,
} from "@rdfjs/types";
import TermSet from "@rdfjs/term-set";
import { rdf, rdfs } from "@tpluscode/rdf-ns-builders";

export interface GetRdfInstanceQuadsParameters {
  class_: NamedNode;
  dataset: DatasetCore;
  excludeSubclasses?: boolean;
  graph?: Exclude<Quad_Graph, Variable> | null;
  instanceOfPredicate?: NamedNode;
  subClassOfPredicate?: NamedNode;
}

/**
 * Get all unique RDF instanceQuads of a given class in the given dataset.
 *
 * Returns the quads declaring an instance to be of the given class or one of its subclasses.
 */
export function* getRdfInstanceQuads({
  class_,
  dataset,
  graph,
  excludeSubclasses,
  instanceOfPredicate,
  subClassOfPredicate,
}: GetRdfInstanceQuadsParameters): Generator<Quad> {
  yield* getRdfInstanceQuadsRecursive({
    class_,
    dataset,
    graph: graph ?? null,
    excludeSubclasses: excludeSubclasses ?? false,
    instanceOfPredicate: instanceOfPredicate ?? rdf.type,
    instanceQuads: new TermSet<Quad>(),
    subClassOfPredicate: subClassOfPredicate ?? rdfs.subClassOf,
    visitedClasses: new TermSet<NamedNode>(),
  });
}

function* getRdfInstanceQuadsRecursive({
  class_,
  dataset,
  excludeSubclasses,
  graph,
  instanceOfPredicate,
  instanceQuads,
  subClassOfPredicate,
  visitedClasses,
}: {
  class_: NamedNode;
  dataset: DatasetCore;
  excludeSubclasses: boolean;
  graph: Exclude<Quad_Graph, Variable> | null;
  instanceOfPredicate: NamedNode;
  instanceQuads: TermSet;
  subClassOfPredicate: NamedNode;
  visitedClasses: TermSet;
}): Generator<Quad> {
  // Get instanceQuads of the class
  for (const quad of dataset.match(null, instanceOfPredicate, class_, graph)) {
    switch (quad.subject.termType) {
      case "BlankNode":
      case "NamedNode":
        if (!instanceQuads.has(quad)) {
          yield quad;
          instanceQuads.add(quad);
        }
        break;
      default:
        break;
    }
  }

  visitedClasses.add(class_);

  if (excludeSubclasses) {
    return;
  }

  // Recurse into class's sub-classes that haven't been visited yet.
  for (const quad of dataset.match(null, subClassOfPredicate, class_, graph)) {
    if (quad.subject.termType !== "NamedNode") {
      continue;
    } else if (visitedClasses.has(quad.subject)) {
      continue;
    }
    yield* getRdfInstanceQuadsRecursive({
      class_: quad.subject,
      dataset,
      excludeSubclasses,
      graph,
      instanceOfPredicate,
      instanceQuads,
      subClassOfPredicate,
      visitedClasses,
    });
  }
}
