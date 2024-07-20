import { Term } from "@rdfjs/types";
import { fromRdf } from "rdf-literal";

export const mapTermToNumber = (term: Term): number | null => {
  if (term.termType !== "Literal") {
    return null;
  }

  const primitive = fromRdf(term);
  return typeof primitive === "number" ? primitive : null;
};
