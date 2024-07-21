import { Term } from "@rdfjs/types";
import { Maybe } from "purify-ts";
import { mapTermToPrimitive } from "./mapTermToPrimitive.js";

export const mapTermToBoolean = (term: Term): Maybe<boolean> => {
  return mapTermToPrimitive(term).filter(
    (primitive) => typeof primitive === "boolean",
  );
};
