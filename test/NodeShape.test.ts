import {ShapesGraph} from "../src";
import {DataFactory} from "n3";
import {testShapesGraph} from "./testShapesGraph";

describe("Shapes", () => {
  let shapes: ShapesGraph;

  beforeAll(() => {
    shapes = ShapesGraph.fromDataset(testShapesGraph);
  });

  it("should have properties", () => {
    {
      const personNodeShape = shapes.nodeShapeByNode(
        DataFactory.namedNode("https://schema.org/PersonShape")
      );
      expect(personNodeShape.properties).toHaveLength(4);
    }
    {
      const addressNodeShape = shapes.nodeShapeByNode(
        DataFactory.namedNode("https://schema.org/AddressShape")
      );
      expect(addressNodeShape.properties).toHaveLength(2);
    }
  });
});
