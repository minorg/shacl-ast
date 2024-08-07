import { Term } from "@rdfjs/types";
import { Maybe } from "purify-ts";
import { mapTermToPrimitive } from "./mapTermToPrimitive.js";

export const mapTermToNumber = (term: Term): Maybe<number> => {
  return mapTermToPrimitive(term).filter(
    (primitive) => typeof primitive === "number",
  );
};
