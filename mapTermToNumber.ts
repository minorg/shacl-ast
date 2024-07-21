import { Term } from "@rdfjs/types";
import { Maybe } from "purify-ts";
import { fromRdf } from "rdf-literal";

export const mapTermToNumber = (term: Term): Maybe<number> => {
  if (term.termType !== "Literal") {
    return Maybe.empty();
  }

  const primitive = fromRdf(term);
  return typeof primitive === "number" ? Maybe.of(primitive) : Maybe.empty();
};
