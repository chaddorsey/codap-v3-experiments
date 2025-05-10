# CODAP v3 Visualization Interaction Testing Plan

## Overview

This document outlines a comprehensive testing strategy for visualization interactions and menus in CODAP v3. It focuses on ensuring that all user interactions with visualizations and their configuration menus work correctly, consistently, and efficiently.

## Goals

1. Ensure all visualization interactions (selection, zooming, panning, etc.) work correctly
2. Verify that visualization menus and configuration panels function properly
3. Confirm that changes in menus correctly update visualizations
4. Test cross-visualization interactions (e.g., selection synchronization)
5. Validate accessibility of visualization interactions and menus

## Test Categories

### 1. Visualization Menu Component Tests

#### 1.1 Menu Rendering Tests

| Test Type | Description | Priority |
|-----------|-------------|----------|
| Unit | Verify menu components render correctly with different props | High |
| Unit | Test menu state management (open/closed, selected options) | High |
| Unit | Verify conditional rendering based on visualization type | Medium |
| Unit | Test menu responsiveness and layout | Medium |
| Unit | Verify accessibility compliance (ARIA attributes, keyboard navigation) | High |

#### 1.2 Menu Interaction Tests

| Test Type | Description | Priority |
|-----------|-------------|----------|
| Unit | Test click handlers for menu options | High |
| Unit | Verify form controls (dropdowns, sliders, checkboxes) | High |
| Unit | Test drag-and-drop interactions for attribute assignment | High |
| Unit | Verify keyboard navigation and shortcuts | Medium |
| Unit | Test tooltips and help elements | Low |

### 2. Visualization-Menu Integration Tests

#### 2.1 Configuration Flow Tests

| Test Type | Description | Priority |
|-----------|-------------|----------|
| Integration | Verify visualization updates when menu options change | High |
| Integration | Test attribute assignment to different visualization roles | High |
| Integration | Verify visualization state is reflected in menu options | High |
| Integration | Test multi-step configuration workflows | Medium |
| Integration | Verify undo/redo functionality for menu actions | Medium |

#### 2.2 Context-Aware Menu Tests

| Test Type | Description | Priority |
|-----------|-------------|----------|
| Integration | Verify appropriate menu options based on data types | High |
| Integration | Test context menus for different visualization elements | High |
| Integration | Verify disabled states for incompatible options | Medium |
| Integration | Test dynamic menu content based on visualization state | Medium |

### 3. User Interaction Tests

#### 3.1 Selection Interaction Tests

| Test Type | Description | Priority |
|-----------|-------------|----------|
| Integration | Test point selection (single, multiple) | High |
| Integration | Verify rectangle/lasso selection tools | High |
| Integration | Test selection with modifier keys (Shift, Ctrl/Cmd) | High |
| Integration | Verify selection state updates menus appropriately | High |
| Integration | Test selection synchronization across visualizations | High |

#### 3.2 Navigation Interaction Tests

| Test Type | Description | Priority |
|-----------|-------------|----------|
| Integration | Test zooming (mouse wheel, buttons, pinch) | High |
| Integration | Verify panning (drag, arrow keys) | High |
| Integration | Test axis rescaling and auto-fit | Medium |
| Integration | Verify navigation history (forward/back) | Low |

#### 3.3 Data Manipulation Interaction Tests

| Test Type | Description | Priority |
|-----------|-------------|----------|
| Integration | Test data point dragging (when applicable) | Medium |
| Integration | Verify data editing through visualization | Medium |
| Integration | Test filtering through visualization interactions | Medium |

### 4. Performance Tests

| Test Type | Description | Priority |
|-----------|-------------|----------|
| Performance | Measure menu rendering time | Medium |
| Performance | Test interaction responsiveness with large datasets | High |
| Performance | Verify smooth animations and transitions | Low |
| Performance | Test memory usage during extended interactions | Medium |

## Test Implementation Strategy

### Phase 1: Core Menu Component Testing

1. Implement unit tests for all menu components
2. Create snapshot tests for menu rendering
3. Test basic interactions with menu controls
4. Verify accessibility compliance

### Phase 2: Basic Integration Testing

1. Test simple configuration changes (e.g., changing point size)
2. Verify attribute assignment to visualization roles
3. Test context menus for visualization elements
4. Implement tests for selection interactions

### Phase 3: Advanced Interaction Testing

1. Implement tests for complex selection scenarios
2. Test navigation interactions (zoom, pan)
3. Verify cross-visualization selection synchronization
4. Test undo/redo functionality

### Phase 4: Performance and Edge Case Testing

1. Implement performance tests for menu interactions
2. Test with large datasets
3. Verify behavior with unusual data values
4. Test error handling and recovery

## Exemplar Test Cases

### Example 1: Axis Configuration Menu Test

```typescript
describe('AxisConfigMenu', () => {
  it('renders with default props', () => {
    const { getByText } = render(<AxisConfigMenu axis="x" attribute={{ name: 'score', type: 'numeric' }} />);
    
    expect(getByText('X Axis: score')).toBeInTheDocument();
    expect(getByText('Scale Type')).toBeInTheDocument();
    expect(getByText('Linear')).toBeInTheDocument();
  });
  
  it('updates axis scale when scale type is changed', async () => {
    const onScaleChange = jest.fn();
    const { getByLabelText } = render(
      <AxisConfigMenu 
        axis="y" 
        attribute={{ name: 'score', type: 'numeric' }} 
        onScaleChange={onScaleChange} 
      />
    );
    
    const logScaleRadio = getByLabelText('Logarithmic');
    await userEvent.click(logScaleRadio);
    
    expect(onScaleChange).toHaveBeenCalledWith('log');
  });
  
  it('disables log scale option for non-positive data', () => {
    const { getByLabelText } = render(
      <AxisConfigMenu 
        axis="y" 
        attribute={{ name: 'score', type: 'numeric' }} 
        hasNegativeValues={true} 
      />
    );
    
    const logScaleRadio = getByLabelText('Logarithmic');
    expect(logScaleRadio).toBeDisabled();
    expect(getByLabelText('Linear')).not.toBeDisabled();
  });
});
```

### Example 2: Point Selection Integration Test

```typescript
describe('ScatterPlot Selection Integration', () => {
  it('selects a point when clicked', async () => {
    const onSelectionChange = jest.fn();
    const dataset = createTestDataset([
      { id: 'case1', score: 85, category: 'A' },
      { id: 'case2', score: 92, category: 'B' },
      { id: 'case3', score: 78, category: 'A' }
    ]);
    
    const { getDataPointByIndex } = renderVisualization(
      <ScatterPlot 
        dataset={dataset} 
        xAttribute="score" 
        yAttribute="category" 
        onSelectionChange={onSelectionChange} 
      />
    );
    
    const point = getDataPointByIndex(1); // Get the second point
    await userEvent.click(point);
    
    expect(onSelectionChange).toHaveBeenCalledWith(['case2']);
    expect(point).toHaveAttribute('aria-selected', 'true');
  });
  
  it('selects multiple points with shift key', async () => {
    const onSelectionChange = jest.fn();
    const dataset = createTestDataset([
      { id: 'case1', score: 85, category: 'A' },
      { id: 'case2', score: 92, category: 'B' },
      { id: 'case3', score: 78, category: 'A' }
    ]);
    
    const { getDataPointByIndex } = renderVisualization(
      <ScatterPlot 
        dataset={dataset} 
        xAttribute="score" 
        yAttribute="category" 
        onSelectionChange={onSelectionChange} 
      />
    );
    
    // Select first point
    await userEvent.click(getDataPointByIndex(0));
    expect(onSelectionChange).toHaveBeenCalledWith(['case1']);
    
    // Select third point with shift key
    await userEvent.keyboard('{Shift>}');
    await userEvent.click(getDataPointByIndex(2));
    await userEvent.keyboard('{/Shift}');
    
    expect(onSelectionChange).toHaveBeenCalledWith(['case1', 'case3']);
  });
});
```

### Example 3: Cross-Visualization Selection Test

```typescript
describe('Cross-Visualization Selection', () => {
  it('synchronizes selection across visualizations with the same dataset', async () => {
    const dataset = createTestDataset([
      { id: 'case1', score: 85, height: 175, category: 'A' },
      { id: 'case2', score: 92, height: 182, category: 'B' },
      { id: 'case3', score: 78, height: 168, category: 'A' }
    ]);
    
    const { getByTestId } = render(
      <DataContext dataset={dataset}>
        <ScatterPlot 
          id="scatter1"
          xAttribute="score" 
          yAttribute="height" 
          data-testid="scatter-plot"
        />
        <BarChart 
          id="bar1"
          xAttribute="category" 
          yAttribute="score" 
          data-testid="bar-chart"
        />
      </DataContext>
    );
    
    const scatterPlot = getByTestId('scatter-plot');
    const barChart = getByTestId('bar-chart');
    
    // Get the first point in the scatter plot
    const scatterPoint = within(scatterPlot).getAllByRole('graphics-symbol')[0];
    await userEvent.click(scatterPoint);
    
    // Verify the corresponding bar is selected in the bar chart
    const selectedBar = within(barChart).getByRole('graphics-symbol', { selected: true });
    expect(selectedBar).toHaveAttribute('data-case-id', 'case1');
  });
});
```

## Next Steps

1. Prioritize test implementation based on the test categories and priorities outlined above
2. Select exemplar tests to implement first as proof of concept
3. Integrate with existing visualization testing utilities
4. Establish CI/CD pipeline for automated testing
5. Monitor and improve test coverage over time

## Conclusion

This testing plan provides a comprehensive approach to ensuring the quality and reliability of visualization interactions and menus in CODAP v3. By implementing these tests, we can ensure that users have a consistent and intuitive experience when working with data visualizations. 