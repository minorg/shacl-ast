import { ShapesGraph } from "..";
import { DataFactory } from "n3";
import { testShapesGraph } from "./testShapesGraph";
import { beforeAll, describe, it } from "vitest";

describe("Shapes", () => {
  let shapes: ShapesGraph;

  beforeAll(() => {
    shapes = ShapesGraph.fromDataset(testShapesGraph);
  });

  it("should have properties", ({ expect }) => {
    {
      const personNodeShape = shapes.nodeShapeByNode(
        DataFactory.namedNode("http://schema.org/PersonShape"),
      );
      expect(personNodeShape.properties).toHaveLength(4);
    }
    {
      const addressNodeShape = shapes.nodeShapeByNode(
        DataFactory.namedNode("http://schema.org/AddressShape"),
      );
      expect(addressNodeShape.properties).toHaveLength(2);
    }
  });
});
