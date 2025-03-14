import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { GraphContentModel } from "../../components/graph/models/graph-content-model"
import { DataSet } from "../../models/data/data-set"
import { Attribute } from "../../models/data/attribute"
import { DotPlotModel } from "../../components/graph/plots/dot-plot/dot-plot-model"
import { DotLinePlot } from "../../components/graph/plots/dot-plot/dot-line-plot"
import { GraphDataConfigurationModel } from "../../components/graph/models/graph-data-configuration-model"
import { GraphPointLayerModel } from "../../components/graph/models/graph-point-layer-model"
import { GraphLayout } from "../../components/graph/models/graph-layout"
import { PixiPoints } from "../../components/data-display/pixi/pixi-points"
import { SharedCaseMetadata } from "../../models/shared/shared-case-metadata"
import { AttributeType } from "../../models/data/attribute-types"
import { CollectionModel } from "../../models/data/collection"
import { DataDisplayModelContext } from "../../components/data-display/hooks/use-data-display-model"
import { GraphContentModelContext } from "../../components/graph/hooks/use-graph-content-model-context"
import { GraphLayoutContext } from "../../components/graph/hooks/use-graph-layout-context"
import { DataSetContext } from "../../hooks/use-data-set-context"
import { GraphDataConfigurationContext } from "../../components/graph/hooks/use-graph-data-configuration-context"
import { createRef } from "react"

// Mock the DotLinePlot component to avoid rendering actual Pixi components
jest.mock("../../components/graph/plots/dot-plot/dot-line-plot", () => ({
  DotLinePlot: jest.fn(({ pixiPoints }) => {
    return <div data-testid="dot-line-plot">Dot Line Plot</div>
  })
}))

// Mock the PixiPoints class
jest.mock("../../components/data-display/pixi/pixi-points", () => ({
  PixiPoints: jest.fn().mockImplementation(() => ({
    forEachPoint: jest.fn(),
    matchPointsToData: jest.fn(),
    setPointStyle: jest.fn(),
    setPointRaised: jest.fn(),
    getSelectedPoints: jest.fn(() => []),
    getPointsInRect: jest.fn(() => []),
    getPointsInRadius: jest.fn(() => []),
    getPointData: jest.fn(() => ({ caseID: "case1" })),
    cancelAnimationFrame: jest.fn()
  }))
}))

// Create a GraphContextProvider component for testing
const GraphContextProvider: React.FC<{
  graphModel: typeof GraphContentModel.Type
  dataset: typeof DataSet.Type
  layout: GraphLayout
  children: React.ReactNode
}> = ({ graphModel, dataset, layout, children }) => {
  return (
    <DataSetContext.Provider value={dataset}>
      <DataDisplayModelContext.Provider value={graphModel}>
        <GraphContentModelContext.Provider value={graphModel}>
          <GraphDataConfigurationContext.Provider value={graphModel.dataConfiguration}>
            <GraphLayoutContext.Provider value={layout}>
              {children}
            </GraphLayoutContext.Provider>
          </GraphDataConfigurationContext.Provider>
        </GraphContentModelContext.Provider>
      </DataDisplayModelContext.Provider>
    </DataSetContext.Provider>
  )
}

describe("Cross-Visualization Highlighting Integration Tests", () => {
  let dataset: typeof DataSet.Type
  let sharedCaseMetadata: typeof SharedCaseMetadata.Type
  
  beforeEach(() => {
    // Create a dataset with test data
    dataset = DataSet.create({
      name: "Test Dataset",
      collections: [
        CollectionModel.create({
          id: "collection1",
          name: "Collection 1",
          attributes: [
            Attribute.create({ 
              id: "attr1", 
              name: "Attribute 1", 
              type: "numeric" 
            }),
            Attribute.create({ 
              id: "attr2", 
              name: "Attribute 2", 
              type: "numeric" 
            })
          ]
        })
      ]
    })
    
    // Add some test cases
    dataset.addCases([
      { __id__: "case1", attr1: 10, attr2: 20 },
      { __id__: "case2", attr1: 15, attr2: 25 },
      { __id__: "case3", attr1: 20, attr2: 30 }
    ])
    
    // Set up shared case metadata
    sharedCaseMetadata = SharedCaseMetadata.create()
  })
  
  test("selecting a point in one visualization highlights the same point in another visualization", async () => {
    // Create two graph models with the same dataset but different attributes
    const graphModel1 = createGraphModel(dataset, "attr1")
    const graphModel2 = createGraphModel(dataset, "attr2")
    
    // Create a mock ref for the abovePointsGroup
    const abovePointsGroupRef = createRef<SVGGElement>()
    
    // Render two graph contexts with their respective models
    const { rerender } = render(
      <div>
        <div data-testid="graph1">
          <GraphContextProvider graphModel={graphModel1} dataset={dataset} layout={new GraphLayout()}>
            <DotLinePlot pixiPoints={new PixiPoints()} abovePointsGroupRef={abovePointsGroupRef} />
          </GraphContextProvider>
        </div>
        <div data-testid="graph2">
          <GraphContextProvider graphModel={graphModel2} dataset={dataset} layout={new GraphLayout()}>
            <DotLinePlot pixiPoints={new PixiPoints()} abovePointsGroupRef={abovePointsGroupRef} />
          </GraphContextProvider>
        </div>
      </div>
    )
    
    // Verify both plots are rendered
    expect(screen.getAllByTestId("dot-line-plot")).toHaveLength(2)
    
    // Simulate selecting a case in the dataset
    dataset.selectCases(["case1"], true)
    
    // Force a re-render to ensure the selection is reflected
    rerender(
      <div>
        <div data-testid="graph1">
          <GraphContextProvider graphModel={graphModel1} dataset={dataset} layout={new GraphLayout()}>
            <DotLinePlot pixiPoints={new PixiPoints()} abovePointsGroupRef={abovePointsGroupRef} />
          </GraphContextProvider>
        </div>
        <div data-testid="graph2">
          <GraphContextProvider graphModel={graphModel2} dataset={dataset} layout={new GraphLayout()}>
            <DotLinePlot pixiPoints={new PixiPoints()} abovePointsGroupRef={abovePointsGroupRef} />
          </GraphContextProvider>
        </div>
      </div>
    )
    
    // Verify the case is selected in the dataset
    expect(dataset.isCaseSelected("case1")).toBe(true)
    
    // Verify the selection count has increased
    expect(dataset.selectionChanges).toBeGreaterThan(0)
    
    // Verify the selection is reflected in both graph models
    expect(Array.from(dataset.selection)).toContain("case1")
  })
  
  test("selection is synchronized when multiple cases are selected", async () => {
    // Create two graph models with the same dataset but different attributes
    const graphModel1 = createGraphModel(dataset, "attr1")
    const graphModel2 = createGraphModel(dataset, "attr2")
    
    // Create a mock ref for the abovePointsGroup
    const abovePointsGroupRef = createRef<SVGGElement>()
    
    // Render two graph contexts with their respective models
    render(
      <div>
        <div data-testid="graph1">
          <GraphContextProvider graphModel={graphModel1} dataset={dataset} layout={new GraphLayout()}>
            <DotLinePlot pixiPoints={new PixiPoints()} abovePointsGroupRef={abovePointsGroupRef} />
          </GraphContextProvider>
        </div>
        <div data-testid="graph2">
          <GraphContextProvider graphModel={graphModel2} dataset={dataset} layout={new GraphLayout()}>
            <DotLinePlot pixiPoints={new PixiPoints()} abovePointsGroupRef={abovePointsGroupRef} />
          </GraphContextProvider>
        </div>
      </div>
    )
    
    // Select multiple cases
    dataset.selectCases(["case1", "case2"], true)
    
    // Verify the cases are selected in the dataset
    expect(dataset.isCaseSelected("case1")).toBe(true)
    expect(dataset.isCaseSelected("case2")).toBe(true)
    
    // Verify the selection is reflected in the dataset
    const selectedCases = Array.from(dataset.selection)
    expect(selectedCases).toContain("case1")
    expect(selectedCases).toContain("case2")
  })
  
  test("deselecting a case in the dataset updates all visualizations", async () => {
    // Create two graph models with the same dataset but different attributes
    const graphModel1 = createGraphModel(dataset, "attr1")
    const graphModel2 = createGraphModel(dataset, "attr2")
    
    // Create a mock ref for the abovePointsGroup
    const abovePointsGroupRef = createRef<SVGGElement>()
    
    // Render two graph contexts with their respective models
    const { rerender } = render(
      <div>
        <div data-testid="graph1">
          <GraphContextProvider graphModel={graphModel1} dataset={dataset} layout={new GraphLayout()}>
            <DotLinePlot pixiPoints={new PixiPoints()} abovePointsGroupRef={abovePointsGroupRef} />
          </GraphContextProvider>
        </div>
        <div data-testid="graph2">
          <GraphContextProvider graphModel={graphModel2} dataset={dataset} layout={new GraphLayout()}>
            <DotLinePlot pixiPoints={new PixiPoints()} abovePointsGroupRef={abovePointsGroupRef} />
          </GraphContextProvider>
        </div>
      </div>
    )
    
    // First select cases
    dataset.selectCases(["case1", "case2"], true)
    
    // Verify the cases are selected
    expect(dataset.isCaseSelected("case1")).toBe(true)
    expect(dataset.isCaseSelected("case2")).toBe(true)
    
    // Now deselect one case
    dataset.selectCases(["case1"], false)
    
    // Force a re-render
    rerender(
      <div>
        <div data-testid="graph1">
          <GraphContextProvider graphModel={graphModel1} dataset={dataset} layout={new GraphLayout()}>
            <DotLinePlot pixiPoints={new PixiPoints()} abovePointsGroupRef={abovePointsGroupRef} />
          </GraphContextProvider>
        </div>
        <div data-testid="graph2">
          <GraphContextProvider graphModel={graphModel2} dataset={dataset} layout={new GraphLayout()}>
            <DotLinePlot pixiPoints={new PixiPoints()} abovePointsGroupRef={abovePointsGroupRef} />
          </GraphContextProvider>
        </div>
      </div>
    )
    
    // Verify case1 is no longer selected but case2 still is
    expect(dataset.isCaseSelected("case1")).toBe(false)
    expect(dataset.isCaseSelected("case2")).toBe(true)
    
    // Verify the selection is reflected in the dataset
    const selectedCases = Array.from(dataset.selection)
    expect(selectedCases).not.toContain("case1")
    expect(selectedCases).toContain("case2")
  })
})

// Helper function to create a graph model with a specific attribute
function createGraphModel(dataset: typeof DataSet.Type, attributeId: string) {
  const dataConfig = GraphDataConfigurationModel.create({
    datasetId: dataset.id
  })
  
  // Set the attribute for the x-axis
  dataConfig.setAttribute("x", {
    attributeId,
    collectionId: "collection1"
  })
  
  // Create a graph model with a dot plot
  const graphModel = GraphContentModel.create({
    id: `graph-${attributeId}`,
    dataConfiguration: dataConfig,
    plot: DotPlotModel.create(),
    layers: [
      GraphPointLayerModel.create({
        id: `layer-${attributeId}`,
        type: "graphPointLayer"
      })
    ]
  })
  
  return graphModel
} 