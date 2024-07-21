import {
  FocusNode,
  NodeShape,
  PropertyShape,
  ShaclProcessor,
  ShapesGraph,
} from "..";
import { DataFactory } from "n3";
import { schema } from "@tpluscode/rdf-ns-builders";
import { beforeAll, describe, it } from "vitest";
import { testData } from "./testData";

describe("ShaclProcessor", () => {
  let shapesGraph: ShapesGraph;

  beforeAll(() => {
    shapesGraph = ShapesGraph.fromDataset(testData.shapesGraph);
  });

  it("should get the node shapes for a given rdf:type", ({ expect }) => {
    const nodeShapes: NodeShape[] = [];
    new ShaclProcessor({
      dataGraph: testData.dataGraph,
      shapesGraph,
    }).someRdfTypeNodeShapes((nodeShape) => {
      nodeShapes.push(nodeShape);
      return false;
    }, schema.Person);
    expect(nodeShapes).toHaveLength(1);
  });

  it("should get the property shapes for a focus node that has them", ({
    expect,
  }) => {
    const propertyShapes: PropertyShape[] = [];
    new ShaclProcessor({
      dataGraph: testData.dataGraph,
      shapesGraph,
    }).someFocusNodePropertyShapes((propertyShape) => {
      propertyShapes.push(propertyShape);
      return false;
    }, DataFactory.namedNode("urn:example:MinorGordon"));
    expect(propertyShapes).toHaveLength(4);
    expect(
      propertyShapes.find((propertyShape) =>
        propertyShape.path.equals(schema.givenName),
      ),
    ).toBeDefined();
  });

  it("should get no property shapes for a focus node that has none", ({
    expect,
  }) => {
    const propertyShapes: PropertyShape[] = [];
    new ShaclProcessor({
      dataGraph: testData.dataGraph,
      shapesGraph,
    }).someFocusNodePropertyShapes((propertyShape) => {
      propertyShapes.push(propertyShape);
      return false;
    }, DataFactory.namedNode("urn:example:troy"));
    expect(propertyShapes).toHaveLength(0);
  });

  it("should get the focus nodes for a shape", ({ expect }) => {
    const nodeShape = shapesGraph
      .nodeShapeByNode(DataFactory.namedNode("http://schema.org/PersonShape"))
      .unsafeCoerce();
    const focusNodes: FocusNode[] = [];
    new ShaclProcessor({
      dataGraph: testData.dataGraph,
      shapesGraph,
    }).someShapeFocusNodes((focusNode) => {
      focusNodes.push(focusNode);
      return false;
    }, nodeShape);
    expect(focusNodes).toHaveLength(1);
  });
});
