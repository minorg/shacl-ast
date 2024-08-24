/**
 * TypeScript enum corresponding to sh:NodeKind, for simpler manipulation.
 */
export enum NodeKind {
  BLANK_NODE = 1,
  BLANK_NODE_OR_IRI = 2,
  BLANK_NODE_OR_LITERAL = 3,
  IRI = 4,
  IRI_OR_LITERAL = 5,
  LITERAL = 6,
}
