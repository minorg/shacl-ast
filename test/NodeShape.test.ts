import {expect} from "chai";
import {ShapesGraph} from "../src";
import {DataFactory} from "n3";
import {testShapesGraph} from "./testShapesGraph";

describe("Shapes", () => {
  let shapes: ShapesGraph;

  before(() => {
    shapes = ShapesGraph.fromDataset(testShapesGraph);
  });

  it("should have properties", () => {
    {
      const personNodeShape = shapes.nodeShapeByNode(
        DataFactory.namedNode("https://schema.org/PersonShape")
      );
      expect(personNodeShape.properties).have.length(4);
    }
    {
      const addressNodeShape = shapes.nodeShapeByNode(
        DataFactory.namedNode("https://schema.org/AddressShape")
      );
      expect(addressNodeShape.properties).to.have.length(2);
    }
  });
});
