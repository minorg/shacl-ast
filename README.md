# shacl-ast

Build an Abstract Syntax Tree (AST) of Shapes Constraint Language (SHACL) shapes in an RDF/JS Dataset.

## Installation

    npm i shacl-ast

## Usage

```ts
import {ShapesGraph} from "shacl-ast";

const shapesGraph = ShapesGraph.fromDataset(testShapesGraph);
for (const nodeShape of shapesGraph.nodeShapes) {
    console.info("Node shape: ", nodeShape.node.value);
    for (const propertyShape of shapesGraph.propertyShapes) {
        console.info("  Property shape: ", propertyShape.node.value, propertyShape.path.value);        
    }
}
```
