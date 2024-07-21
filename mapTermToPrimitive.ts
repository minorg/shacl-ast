import { Term } from "@rdfjs/types";
import { Maybe } from "purify-ts";
import { fromRdf } from "rdf-literal";

export const mapTermToPrimitive = (
  term: Term,
): Maybe<boolean | Date | number | string> => {
  if (term.termType !== "Literal") {
    return Maybe.empty();
  }

  return Maybe.encase(() => fromRdf(term, true));
};
