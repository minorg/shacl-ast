import {ShapesGraph} from "../src";
import {testShapesGraph} from "./testShapesGraph";

describe("ShapesGraph", () => {
  let shapesGraph: ShapesGraph;

  beforeAll(() => {
    shapesGraph = ShapesGraph.fromDataset(testShapesGraph);
  });

  it("should parse the shapes correctly", () => {
    expect(shapesGraph.nodeShapes).toHaveLength(4);
    expect(shapesGraph.propertyShapes).toHaveLength(6);
  });
});
