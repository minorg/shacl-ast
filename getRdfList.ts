import {
  BlankNode,
  DatasetCore,
  DefaultGraph,
  Literal,
  NamedNode,
} from "@rdfjs/types";
import { rdf } from "@tpluscode/rdf-ns-builders";

export function* getRdfList({
  dataset,
  graph,
  node,
}: {
  dataset: DatasetCore;
  graph?: BlankNode | DefaultGraph | NamedNode | null;
  node: BlankNode | NamedNode;
}): Generator<BlankNode | Literal | NamedNode> {
  if (node.equals(rdf.nil)) {
    return;
  }

  const firstQuads = [...dataset.match(node, rdf.first, null, graph)];
  if (firstQuads.length === 0) {
    throw new RangeError("RDF list has no rdf:first quad");
  } else if (firstQuads.length > 1) {
    throw new RangeError("RDF list has multiple rdf:first quads");
  }
  const firstTerm = firstQuads[0].object;
  switch (firstTerm.termType) {
    case "BlankNode":
    case "Literal":
    case "NamedNode":
      break;
    default:
      throw new RangeError(
        "rdf:first must point to a blank or named node or a literal",
      );
  }

  const restQuads = [...dataset.match(node, rdf.rest, null, graph)];
  if (restQuads.length === 0) {
    throw new RangeError("RDF list has no rdf:rest quad");
  } else if (restQuads.length > 1) {
    throw new RangeError("RDF list has multiple rdf:rest quads");
  }
  const restTerm = restQuads[0].object;
  switch (restTerm.termType) {
    case "BlankNode":
    case "NamedNode":
      break;
    default:
      throw new RangeError("rdf:rest must point to a blank or named node");
  }

  yield firstTerm;

  yield* getRdfList({
    dataset,
    graph,
    node: restTerm,
  });
}
