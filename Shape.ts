import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { sh } from "@tpluscode/rdf-ns-builders";
import type { Maybe } from "purify-ts";
import type { Resource } from "rdfjs-resource";
import { NodeKind } from "./NodeKind.js";
import type { NodeShape } from "./NodeShape.js";
import type { ShapesGraph } from "./ShapesGraph.js";

export abstract class Shape {
  abstract readonly constraints: Shape.Constraints;
  readonly targets: Shape.Targets;

  protected constructor(readonly resource: Resource) {
    this.targets = new Shape.Targets(resource);
  }

  get description(): Maybe<Literal> {
    return this.resource
      .value(sh.description)
      .chain((value) => value.toLiteral());
  }

  get name(): Maybe<Literal> {
    return this.resource.value(sh.name).chain((value) => value.toLiteral());
  }
}

export namespace Shape {
  export class Constraints {
    constructor(
      protected readonly resource: Resource,
      protected readonly shapesGraph: ShapesGraph,
    ) {}

    get and(): readonly Shape[] {
      return this.listTakingLogicalConstraint(sh.and);
    }

    get classes(): readonly NamedNode[] {
      return [...this.resource.values(sh.class)].flatMap((value) =>
        value.toIri().toList(),
      );
    }

    get datatype(): Maybe<NamedNode> {
      return this.resource.value(sh.datatype).chain((value) => value.toIri());
    }

    get hasValue(): Maybe<BlankNode | Literal | NamedNode> {
      return this.resource.value(sh.hasValue).map((value) => value.toTerm());
    }

    get in_(): Maybe<readonly (BlankNode | Literal | NamedNode)[]> {
      return this.resource
        .value(sh.in)
        .chain((value) => value.toList().toMaybe())
        .map((values) => values.map((value) => value.toTerm()));
    }

    get maxCount(): Maybe<number> {
      return this.resource
        .value(sh.maxCount)
        .chain((value) => value.toNumber());
    }

    get maxExclusive(): Maybe<Literal> {
      return this.resource
        .value(sh.maxExclusive)
        .chain((value) => value.toLiteral());
    }

    get maxInclusive(): Maybe<Literal> {
      return this.resource
        .value(sh.maxInclusive)
        .chain((value) => value.toLiteral());
    }

    get minCount(): Maybe<number> {
      return this.resource
        .value(sh.minCount)
        .chain((value) => value.toNumber());
    }

    get minExclusive(): Maybe<Literal> {
      return this.resource
        .value(sh.minExclusive)
        .chain((value) => value.toLiteral());
    }

    get minInclusive(): Maybe<Literal> {
      return this.resource
        .value(sh.minInclusive)
        .chain((value) => value.toLiteral());
    }

    get nodeKinds(): Set<NodeKind> {
      const nodeKinds = new Set<NodeKind>();
      for (const nodeKindValue of this.resource.values(sh.nodeKind)) {
        const nodeKindIri = nodeKindValue.toIri().extractNullable();
        if (nodeKindIri === null) {
        } else if (nodeKindIri.equals(sh.BlankNode)) {
          nodeKinds.add(NodeKind.BLANK_NODE);
        } else if (nodeKindIri.equals(sh.BlankNodeOrIRI)) {
          nodeKinds.add(NodeKind.BLANK_NODE);
          nodeKinds.add(NodeKind.IRI);
        } else if (nodeKindIri.equals(sh.BlankNodeOrLiteral)) {
          nodeKinds.add(NodeKind.BLANK_NODE);
          nodeKinds.add(NodeKind.LITERAL);
        } else if (nodeKindIri.equals(sh.IRI)) {
          nodeKinds.add(NodeKind.IRI);
        } else if (nodeKindIri.equals(sh.IRIOrLiteral)) {
          nodeKinds.add(NodeKind.IRI);
          nodeKinds.add(NodeKind.LITERAL);
        } else if (nodeKindIri.equals(sh.Literal)) {
          nodeKinds.add(NodeKind.LITERAL);
        }
      }
      return nodeKinds;
    }

    get nodes(): readonly NodeShape[] {
      return [...this.resource.values(sh.node)].flatMap((value) =>
        value
          .toIdentifier()
          .chain((shapeNode) => this.shapesGraph.nodeShapeByNode(shapeNode))
          .toList(),
      );
    }

    get not(): readonly Shape[] {
      return [...this.resource.values(sh.not)].flatMap((value) =>
        value
          .toIdentifier()
          .chain((shapeNode) => this.shapesGraph.shapeByNode(shapeNode))
          .toList(),
      );
    }

    get or(): readonly Shape[] {
      return this.listTakingLogicalConstraint(sh.or);
    }

    get xone(): readonly Shape[] {
      return this.listTakingLogicalConstraint(sh.xone);
    }

    private listTakingLogicalConstraint(
      predicate: NamedNode,
    ): readonly Shape[] {
      return this.resource
        .value(predicate)
        .chain((value) => value.toList().toMaybe())
        .map((values) =>
          values.flatMap((value) =>
            value
              .toIdentifier()
              .chain((shapeNode) => this.shapesGraph.shapeByNode(shapeNode))
              .toList(),
          ),
        )
        .orDefault([]);
    }
  }

  export class Targets {
    constructor(protected readonly resource: Resource) {}

    get targetClasses(): readonly NamedNode[] {
      return [...this.resource.values(sh.targetClass)].flatMap((value) =>
        value.toIri().toList(),
      );
    }

    get targetNodes(): readonly (Literal | NamedNode)[] {
      return [...this.resource.values(sh.targetNode)].flatMap((value) =>
        (value.toLiteral() as Maybe<Literal | NamedNode>)
          .altLazy(() => value.toIri())
          .toList(),
      );
    }

    get targetObjectsOf(): readonly NamedNode[] {
      return [...this.resource.values(sh.targetObjectsOf)].flatMap((value) =>
        value.toIri().toList(),
      );
    }

    get targetSubjectsOf(): readonly NamedNode[] {
      return [...this.resource.values(sh.targetSubjectsOf)].flatMap((value) =>
        value.toIri().toList(),
      );
    }
  }
}
