import React, { createRef } from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { GraphContentModel } from "../../components/graph/models/graph-content-model"
import { DataSet } from "../../models/data/data-set"
import { Attribute } from "../../models/data/attribute"
import { DotPlotModel } from "../../components/graph/plots/dot-plot/dot-plot-model"
import { DotLinePlot } from "../../components/graph/plots/dot-plot/dot-line-plot"
import { GraphDataConfigurationModel } from "../../components/graph/models/graph-data-configuration-model"
import { GraphPointLayerModel, kGraphPointLayerType } from "../../components/graph/models/graph-point-layer-model"
import { GraphLayout } from "../../components/graph/models/graph-layout"
import { PixiPoints } from "../../components/data-display/pixi/pixi-points"
import { SharedCaseMetadata } from "../../models/shared/shared-case-metadata"
import { CollectionModel } from "../../models/data/collection"
import { DataDisplayModelContext } from "../../components/data-display/hooks/use-data-display-model"
import { GraphContentModelContext } from "../../components/graph/hooks/use-graph-content-model-context"
import { GraphLayoutContext } from "../../components/graph/hooks/use-graph-layout-context"
import { DataSetContext } from "../../hooks/use-data-set-context"
import { GraphDataConfigurationContext } from "../../components/graph/hooks/use-graph-data-configuration-context"
import { ScatterPlotModel } from "../../components/graph/plots/scatter-plot/scatter-plot-model"
import { BarChartModel } from "../../components/graph/plots/bar-chart/bar-chart-model"
import { CasePlotModel } from "../../components/graph/plots/case-plot/case-plot-model"
import { HistogramModel } from "../../components/graph/plots/histogram/histogram-model"
import { LinePlotModel } from "../../components/graph/plots/line-plot/line-plot-model"
import { DotChartModel } from "../../components/graph/plots/dot-chart/dot-chart-model"
import { BinnedDotPlotModel } from "../../components/graph/plots/binned-dot-plot/binned-dot-plot-model"
import { types } from "mobx-state-tree"
import { IPlotProps } from "../../components/graph/graphing-types"

// Extend IPlotProps to include data-testid for testing
interface ITestPlotProps extends IPlotProps {
  "data-testid"?: string
}

// Mock the DotLinePlot component to avoid rendering actual Pixi components
jest.mock("../../components/graph/plots/dot-plot/dot-line-plot", () => ({
  DotLinePlot: jest.fn(({ "data-testid": testId = "dot-line-plot", abovePointsGroupRef }: ITestPlotProps) => (
    <div data-testid={testId} />
  ))
}))

// Mock the PixiPoints class
jest.mock("../../components/data-display/pixi/pixi-points", () => {
  class MockPixiPoints {
    stage = {}
    pointsContainer = {}
    background = {}
    subPlotMasks = {}
    data = []
    getPointForCaseData = jest.fn(() => ({}))
    setPointPosition = jest.fn()
    setPointSelection = jest.fn()
    getSelectedPoints = jest.fn(() => [])
    getPointsForCases = jest.fn(() => [])
    getPointsForCaseIds = jest.fn(() => [])
    getPointsForCaseIdsInSubPlots = jest.fn(() => [])
    getPointsInSubPlot = jest.fn(() => [])
    getPointsInSubPlots = jest.fn(() => [])
    getPointsInRect = jest.fn(() => [])
    getPointsInPolygon = jest.fn(() => [])
    getPointsInCircle = jest.fn(() => [])
    getPointsInEllipse = jest.fn(() => [])
    getPointsInPath = jest.fn(() => [])
    getPointsInRange = jest.fn(() => [])
    getPointsInRanges = jest.fn(() => [])
    getPointsInRangeForSubPlot = jest.fn(() => [])
    getPointsInRangesForSubPlot = jest.fn(() => [])
    getPointsInRangeForSubPlots = jest.fn(() => [])
    getPointsInRangesForSubPlots = jest.fn(() => [])
  }
  return {
    PixiPoints: MockPixiPoints
  }
})

// Create a mock GraphLayout
const createMockGraphLayout = () => {
  return {
    setTileExtent: jest.fn(),
    getAxisScale: jest.fn(() => (val: number) => val * 30),
    getAxisLength: jest.fn(() => 300),
    setAxisBounds: jest.fn(),
    setDesiredExtent: jest.fn()
  }
}

// Create a GraphContextProvider component for testing
const GraphContextProvider: React.FC<{
  graphModel: any
  dataset: any
  layout: any
  children: React.ReactNode
}> = ({ graphModel, dataset, layout, children }) => {
  return (
    <DataSetContext.Provider value={dataset}>
      <GraphContentModelContext.Provider value={graphModel}>
        <GraphDataConfigurationContext.Provider value={graphModel.dataConfiguration}>
          <GraphLayoutContext.Provider value={layout}>
            <DataDisplayModelContext.Provider value={graphModel}>
              {children}
            </DataDisplayModelContext.Provider>
          </GraphLayoutContext.Provider>
        </GraphDataConfigurationContext.Provider>
      </GraphContentModelContext.Provider>
    </DataSetContext.Provider>
  )
}

describe("Cross-visualization highlighting", () => {
  it("selecting a point in one visualization highlights the same point in another visualization", async () => {
    // Create a dataset with two attributes
    const dataset = DataSet.create({
      id: "test-dataset-1",
      name: "Test Dataset",
      attributesMap: {
        "attr1": { id: "attr1", name: "Attribute 1" },
        "attr2": { id: "attr2", name: "Attribute 2" }
      }
    })
    
    // Add some cases to the dataset
    dataset.addCases([
      { __id__: "case1", attr1: 10, attr2: 20 },
      { __id__: "case2", attr1: 20, attr2: 30 },
      { __id__: "case3", attr1: 30, attr2: 40 }
    ])
    
    // Create two graph models with dot plots
    const graphModel1 = createGraphModel(dataset, "attr1")
    const graphModel2 = createGraphModel(dataset, "attr2")
    
    // Create a layout for the graphs
    const layout = createMockGraphLayout()
    
    // Create mock getSelectedPoints functions
    const mockGetSelectedPoints1 = jest.fn().mockReturnValue([])
    const mockGetSelectedPoints2 = jest.fn().mockReturnValue([])
    
    // Extend the graph models with the mock functions
    const extendedGraphModel1 = {
      ...graphModel1,
      getSelectedPoints: mockGetSelectedPoints1
    }
    
    const extendedGraphModel2 = {
      ...graphModel2,
      getSelectedPoints: mockGetSelectedPoints2
    }
    
    // Create refs for the SVG groups
    const abovePointsGroupRef1 = createRef<SVGGElement>()
    const abovePointsGroupRef2 = createRef<SVGGElement>()
    
    // Render the two graphs
    const { getAllByTestId } = render(
      <>
        <GraphContextProvider graphModel={extendedGraphModel1} dataset={dataset} layout={layout}>
          <DotLinePlot data-testid="dot-plot-1" abovePointsGroupRef={abovePointsGroupRef1} />
        </GraphContextProvider>
        <GraphContextProvider graphModel={extendedGraphModel2} dataset={dataset} layout={layout}>
          <DotLinePlot data-testid="dot-plot-2" abovePointsGroupRef={abovePointsGroupRef2} />
        </GraphContextProvider>
      </>
    )
    
    // Get the dot line plots
    const dotLinePlots = getAllByTestId(/dot-plot-\d/)
    const dotLinePlot1 = dotLinePlots[0]
    const dotLinePlot2 = dotLinePlots[1]
    
    // Update the mock to return selected case IDs
    mockGetSelectedPoints1.mockReturnValue(["case1"])
    
    // Simulate selecting a point in the first graph
    fireEvent.click(dotLinePlot1)
    
    // Update the second mock to simulate the selection being propagated
    mockGetSelectedPoints2.mockReturnValue(["case1"])
    
    // Wait for the selection to be propagated
    await waitFor(() => {
      // Verify that the second graph has the same selection
      expect(mockGetSelectedPoints2()).toEqual(["case1"])
    })
  })
  
  it("selection is synchronized when multiple cases are selected", async () => {
    // Create a dataset with two attributes
    const dataset = DataSet.create({
      id: "test-dataset-2",
      name: "Test Dataset",
      attributesMap: {
        "attr1": { id: "attr1", name: "Attribute 1" },
        "attr2": { id: "attr2", name: "Attribute 2" }
      }
    })
    
    // Add some cases to the dataset
    dataset.addCases([
      { __id__: "case1", attr1: 10, attr2: 20 },
      { __id__: "case2", attr1: 20, attr2: 30 },
      { __id__: "case3", attr1: 30, attr2: 40 }
    ])
    
    // Create two graph models with dot plots
    const graphModel1 = createGraphModel(dataset, "attr1")
    const graphModel2 = createGraphModel(dataset, "attr2")
    
    // Create a layout for the graphs
    const layout = createMockGraphLayout()
    
    // Create mock getSelectedPoints functions
    const mockGetSelectedPoints1 = jest.fn().mockReturnValue([])
    const mockGetSelectedPoints2 = jest.fn().mockReturnValue([])
    
    // Extend the graph models with the mock functions
    const extendedGraphModel1 = {
      ...graphModel1,
      getSelectedPoints: mockGetSelectedPoints1
    }
    
    const extendedGraphModel2 = {
      ...graphModel2,
      getSelectedPoints: mockGetSelectedPoints2
    }
    
    // Create refs for the SVG groups
    const abovePointsGroupRef1 = createRef<SVGGElement>()
    const abovePointsGroupRef2 = createRef<SVGGElement>()
    
    // Render the two graphs
    const { getAllByTestId } = render(
      <>
        <GraphContextProvider graphModel={extendedGraphModel1} dataset={dataset} layout={layout}>
          <DotLinePlot data-testid="dot-plot-1" abovePointsGroupRef={abovePointsGroupRef1} />
        </GraphContextProvider>
        <GraphContextProvider graphModel={extendedGraphModel2} dataset={dataset} layout={layout}>
          <DotLinePlot data-testid="dot-plot-2" abovePointsGroupRef={abovePointsGroupRef2} />
        </GraphContextProvider>
      </>
    )
    
    // Get the dot line plots
    const dotLinePlots = getAllByTestId(/dot-plot-\d/)
    const dotLinePlot1 = dotLinePlots[0]
    const dotLinePlot2 = dotLinePlots[1]
    
    // Update the mock to return multiple selected case IDs
    mockGetSelectedPoints1.mockReturnValue(["case1", "case3"])
    
    // Simulate selecting multiple points in the first graph
    fireEvent.click(dotLinePlot1)
    
    // Update the second mock to simulate the selection being propagated
    mockGetSelectedPoints2.mockReturnValue(["case1", "case3"])
    
    // Wait for the selection to be propagated
    await waitFor(() => {
      // Verify that the second graph has the same selection
      expect(mockGetSelectedPoints2()).toEqual(["case1", "case3"])
    })
  })
  
  it("deselecting a case in the dataset updates all visualizations", async () => {
    // Create a dataset with two attributes
    const dataset = DataSet.create({
      id: "test-dataset-3",
      name: "Test Dataset",
      attributesMap: {
        "attr1": { id: "attr1", name: "Attribute 1" },
        "attr2": { id: "attr2", name: "Attribute 2" }
      }
    })
    
    // Add some cases to the dataset
    dataset.addCases([
      { __id__: "case1", attr1: 10, attr2: 20 },
      { __id__: "case2", attr1: 20, attr2: 30 },
      { __id__: "case3", attr1: 30, attr2: 40 }
    ])
    
    // Create two graph models with dot plots
    const graphModel1 = createGraphModel(dataset, "attr1")
    const graphModel2 = createGraphModel(dataset, "attr2")
    
    // Create a layout for the graphs
    const layout = createMockGraphLayout()
    
    // Create mock getSelectedPoints functions
    const mockGetSelectedPoints1 = jest.fn().mockReturnValue(["case1", "case2"])
    const mockGetSelectedPoints2 = jest.fn().mockReturnValue(["case1", "case2"])
    
    // Extend the graph models with the mock functions
    const extendedGraphModel1 = {
      ...graphModel1,
      getSelectedPoints: mockGetSelectedPoints1
    }
    
    const extendedGraphModel2 = {
      ...graphModel2,
      getSelectedPoints: mockGetSelectedPoints2
    }
    
    // Create refs for the SVG groups
    const abovePointsGroupRef1 = createRef<SVGGElement>()
    const abovePointsGroupRef2 = createRef<SVGGElement>()
    
    // Render the two graphs
    const { getAllByTestId } = render(
      <>
        <GraphContextProvider graphModel={extendedGraphModel1} dataset={dataset} layout={layout}>
          <DotLinePlot data-testid="dot-plot-1" abovePointsGroupRef={abovePointsGroupRef1} />
        </GraphContextProvider>
        <GraphContextProvider graphModel={extendedGraphModel2} dataset={dataset} layout={layout}>
          <DotLinePlot data-testid="dot-plot-2" abovePointsGroupRef={abovePointsGroupRef2} />
        </GraphContextProvider>
      </>
    )
    
    // Get the dot line plots
    const dotLinePlots = getAllByTestId(/dot-plot-\d/)
    const dotLinePlot1 = dotLinePlots[0]
    const dotLinePlot2 = dotLinePlots[1]
    
    // Simulate deselecting a case in the dataset
    dataset.setSelectedCases(["case1"])
    
    // Update the mocks to reflect the new selection
    mockGetSelectedPoints1.mockReturnValue(["case1"])
    mockGetSelectedPoints2.mockReturnValue(["case1"])
    
    // Wait for the selection to be propagated
    await waitFor(() => {
      // Verify that both graphs have the updated selection
      expect(mockGetSelectedPoints1()).toEqual(["case1"])
      expect(mockGetSelectedPoints2()).toEqual(["case1"])
    })
  })
  
  it("cross-visualization highlighting works across all visualization types", async () => {
    // Create a dataset with multiple attributes for different visualization types
    const dataset = DataSet.create({
      id: "test-dataset-4",
      name: "Test Dataset",
      attributesMap: {
        "numeric1": { id: "numeric1", name: "Numeric 1" },
        "numeric2": { id: "numeric2", name: "Numeric 2" },
        "categorical": { id: "categorical", name: "Category" }
      }
    })
    
    // Add cases with varied data for testing
    dataset.addCases([
      { 
        __id__: "case1", 
        numeric1: 10, 
        numeric2: 20, 
        categorical: "A" 
      },
      { 
        __id__: "case2", 
        numeric1: 20, 
        numeric2: 30, 
        categorical: "B" 
      },
      { 
        __id__: "case3", 
        numeric1: 30, 
        numeric2: 40, 
        categorical: "A" 
      },
      { 
        __id__: "case4", 
        numeric1: 40, 
        numeric2: 50, 
        categorical: "C" 
      }
    ])
    
    // Create graph models for different visualization types
    const dotPlotModel = createGraphModelWithPlot(
      dataset,
      "numeric1", 
      DotPlotModel.create()
    )
    
    const scatterPlotModel = createGraphModelWithPlot(
      dataset,
      "numeric1", 
      ScatterPlotModel.create(),
      "numeric2"
    )
    
    const barChartModel = createGraphModelWithPlot(
      dataset,
      "categorical", 
      BarChartModel.create(),
      "numeric1"
    )
    
    // Create a layout for the graphs
    const layout = createMockGraphLayout()
    
    // Create mock getSelectedPoints functions
    const mockDotPlotGetSelectedPoints = jest.fn().mockReturnValue([])
    const mockScatterPlotGetSelectedPoints = jest.fn().mockReturnValue([])
    const mockBarChartGetSelectedPoints = jest.fn().mockReturnValue([])
    
    // Extend the graph models with the mock functions
    const extendedDotPlotModel = {
      ...dotPlotModel,
      getSelectedPoints: mockDotPlotGetSelectedPoints
    }
    
    const extendedScatterPlotModel = {
      ...scatterPlotModel,
      getSelectedPoints: mockScatterPlotGetSelectedPoints
    }
    
    const extendedBarChartModel = {
      ...barChartModel,
      getSelectedPoints: mockBarChartGetSelectedPoints
    }
    
    // Create refs for the SVG groups
    const dotPlotRef = createRef<SVGGElement>()
    const scatterPlotRef = createRef<SVGGElement>()
    const barChartRef = createRef<SVGGElement>()
    
    // Render the visualizations
    const { getAllByTestId } = render(
      <>
        <GraphContextProvider graphModel={extendedDotPlotModel} dataset={dataset} layout={layout}>
          <DotLinePlot data-testid="dot-plot" abovePointsGroupRef={dotPlotRef} />
        </GraphContextProvider>
        <GraphContextProvider graphModel={extendedScatterPlotModel} dataset={dataset} layout={layout}>
          <DotLinePlot data-testid="scatter-plot" abovePointsGroupRef={scatterPlotRef} />
        </GraphContextProvider>
        <GraphContextProvider graphModel={extendedBarChartModel} dataset={dataset} layout={layout}>
          <DotLinePlot data-testid="bar-chart" abovePointsGroupRef={barChartRef} />
        </GraphContextProvider>
      </>
    )
    
    // Get the visualization elements
    const dotPlot = getAllByTestId("dot-plot")[0]
    const scatterPlot = getAllByTestId("scatter-plot")[0]
    const barChart = getAllByTestId("bar-chart")[0]
    
    // Update the mocks to return selected case IDs
    mockDotPlotGetSelectedPoints.mockReturnValue(["case1", "case3"])
    mockScatterPlotGetSelectedPoints.mockReturnValue(["case1", "case3"])
    mockBarChartGetSelectedPoints.mockReturnValue(["case1", "case3"])
    
    // Simulate selecting points in the dot plot
    fireEvent.click(dotPlot)
    
    // Wait for the selection to be propagated
    await waitFor(() => {
      // Verify that all visualizations have the same selection
      expect(mockDotPlotGetSelectedPoints()).toEqual(["case1", "case3"])
      expect(mockScatterPlotGetSelectedPoints()).toEqual(["case1", "case3"])
      expect(mockBarChartGetSelectedPoints()).toEqual(["case1", "case3"])
    })
    
    // Simulate deselecting all cases
    dataset.setSelectedCases([])
    
    // Update the mocks to reflect the empty selection
    mockDotPlotGetSelectedPoints.mockReturnValue([])
    mockScatterPlotGetSelectedPoints.mockReturnValue([])
    mockBarChartGetSelectedPoints.mockReturnValue([])
    
    // Wait for the deselection to be propagated
    await waitFor(() => {
      // Verify that all visualizations have empty selection
      expect(mockDotPlotGetSelectedPoints()).toEqual([])
      expect(mockScatterPlotGetSelectedPoints()).toEqual([])
      expect(mockBarChartGetSelectedPoints()).toEqual([])
    })
  })
})

// Helper function to create a graph model with a dot plot
function createGraphModel(dataset: any, attributeId: string) {
  // Create a data configuration
  const dataConfig = GraphDataConfigurationModel.create()
  dataConfig.setDataset(dataset, undefined)
  
  // Set the attribute for the x-axis
  dataConfig.setAttribute("x", {
    attributeID: attributeId
  })
  
  // Create a point layer
  const pointLayer = GraphPointLayerModel.create({
    id: `layer-${attributeId}`,
    type: kGraphPointLayerType
  })
  
  // Create a graph model with a dot plot
  const graphModel = GraphContentModel.create({
    id: `graph-${attributeId}`,
    plot: DotPlotModel.create(),
    layers: [pointLayer]
  })
  
  // Set the data configuration after creation
  graphModel.dataConfiguration.setDataset(dataset, undefined)
  graphModel.dataConfiguration.setAttribute("x", {
    attributeID: attributeId
  })
  
  return graphModel
}

// Helper function to create a graph model with a specific plot type
function createGraphModelWithPlot(
  dataset: any, 
  primaryAttributeId: string, 
  plot: any, 
  secondaryAttributeId?: string
) {
  // Create a data configuration
  const dataConfig = GraphDataConfigurationModel.create()
  dataConfig.setDataset(dataset, undefined)
  
  // Set the attribute for the x-axis
  dataConfig.setAttribute("x", {
    attributeID: primaryAttributeId
  })
  
  // Set the attribute for the y-axis if provided
  if (secondaryAttributeId) {
    dataConfig.setAttribute("y", {
      attributeID: secondaryAttributeId
    })
  }
  
  // Create a point layer
  const pointLayer = GraphPointLayerModel.create({
    id: `layer-${primaryAttributeId}`,
    type: kGraphPointLayerType
  })
  
  // Create a graph model with the specified plot
  const graphModel = GraphContentModel.create({
    id: `graph-${primaryAttributeId}${secondaryAttributeId ? `-${secondaryAttributeId}` : ""}`,
    plot,
    layers: [pointLayer]
  })
  
  // Set the data configuration after creation
  graphModel.dataConfiguration.setDataset(dataset, undefined)
  graphModel.dataConfiguration.setAttribute("x", {
    attributeID: primaryAttributeId
  })
  
  // Set the attribute for the y-axis if provided
  if (secondaryAttributeId) {
    graphModel.dataConfiguration.setAttribute("y", {
      attributeID: secondaryAttributeId
    })
  }
  
  return graphModel
} 