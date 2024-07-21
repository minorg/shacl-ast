import { NodeShape, ShapesGraph } from "..";
import { DataFactory } from "n3";
import { beforeAll, describe, expect, it } from "vitest";
import { testData } from "./testData";

describe("NodeShape", () => {
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

  it("should have properties", ({ expect }) => {
    expect(personNodeShape.properties).toHaveLength(4);
    expect(addressNodeShape.properties).toHaveLength(2);
  });

  it("should be closed", ({ expect }) => {
    expect(addressNodeShape.closed.unsafeCoerce()).toStrictEqual(true);
  });
});
