import { NodeShape, PropertyShape, ShapesGraph } from "..";
import { DataFactory } from "n3";
import { beforeAll, describe, expect, it } from "vitest";
import { testData } from "./testData";
import { schema, xsd } from "@tpluscode/rdf-ns-builders";
import { NamedNode } from "@rdfjs/types";

describe("PropertyShape", () => {
  let addressNodeShape: NodeShape;
  let personNodeShape: NodeShape;

  beforeAll(() => {
    const shapesGraph = ShapesGraph.fromDataset(testData.shapesGraph);

    addressNodeShape = shapesGraph
      .nodeShapeByNode(DataFactory.namedNode("http://schema.org/AddressShape"))
      .unsafeCoerce();
    expect(addressNodeShape).toBeDefined();

    personNodeShape = shapesGraph
      .nodeShapeByNode(DataFactory.namedNode("http://schema.org/PersonShape"))
      .unsafeCoerce();
    expect(personNodeShape).toBeDefined();
  });

  const findPropertyShape = (
    nodeShape: NodeShape,
    path: NamedNode,
  ): PropertyShape => {
    const propertyShape = nodeShape.properties.find((propertyShape) =>
      propertyShape.path.equals(path),
    );
    expect(propertyShape).toBeDefined();
    return propertyShape!;
  };

  it("should have a datatype", ({ expect }) => {
    expect(
      findPropertyShape(
        personNodeShape,
        schema.givenName,
      ).datatype.extractNullable()?.value,
    ).toStrictEqual(xsd.string.value);

    expect(
      findPropertyShape(
        personNodeShape,
        schema.gender,
      ).datatype.extractNullable(),
    ).toBeNull();
  });

  it("should have a maxCount", ({ expect }) => {
    expect(
      findPropertyShape(
        personNodeShape,
        schema.birthDate,
      ).maxCount.extractNullable(),
    ).toStrictEqual(1);
  });

  it("should have a name", ({ expect }) => {
    expect(
      findPropertyShape(
        personNodeShape,
        schema.givenName,
      ).name.extractNullable()?.value,
    ).toStrictEqual("given name");
  });

  it("should have a node shape", () => {
    const nodeShapes = findPropertyShape(
      personNodeShape,
      schema.address,
    ).nodeShapes;
    expect(nodeShapes).toHaveLength(1);
    expect(nodeShapes[0].node.value).toStrictEqual(
      "http://schema.org/AddressShape",
    );
  });

  it("should have sh:in", ({ expect }) => {
    const propertyShape = findPropertyShape(personNodeShape, schema.gender);
    const in_ = propertyShape.in_.orDefault([]);
    expect(in_).toHaveLength(2);
    expect(
      in_.find(
        (member) => member.termType === "Literal" && member.value == "female",
      ),
    );
    expect(
      in_.find(
        (member) => member.termType === "Literal" && member.value == "male",
      ),
    );
  });

  it("should have sh:or", ({ expect }) => {
    const propertyShape = findPropertyShape(
      addressNodeShape,
      schema.postalCode,
    );
    const or = propertyShape.or;
    expect(or).toHaveLength(2);
    expect(
      or.some((propertyShape) =>
        propertyShape.datatype.extractNullable()?.equals(xsd.string),
      ),
    ).toStrictEqual(true);
    expect(
      or.some((propertyShape) =>
        propertyShape.datatype.extractNullable()?.equals(xsd.integer),
      ),
    ).toStrictEqual(true);
  });
});
