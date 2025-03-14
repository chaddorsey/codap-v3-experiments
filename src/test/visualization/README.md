# Visualization Testing in CODAP v3

This directory contains utilities and tests for visualization components in CODAP v3.

## Overview

The visualization testing framework provides tools for testing various aspects of visualization components:

1. **Rendering Tests**: Verify that components render correctly with different data inputs
2. **Interaction Tests**: Verify that components respond correctly to user interactions
3. **Performance Tests**: Measure and ensure acceptable performance for rendering and interactions
4. **Snapshot Tests**: Capture and compare visual representations to detect unexpected changes

## Available Utilities

- `visualization-test-utils.ts`: Core utilities for rendering and verifying visualizations
- `interaction-test-utils.ts`: Utilities for simulating user interactions (zoom, pan, selection, etc.)
- `performance-test-utils.ts`: Utilities for measuring rendering and interaction performance
- `snapshot-test-utils.ts`: Utilities for capturing and comparing visual snapshots

## Testing Plan

### Identified Visualization Components

Based on the codebase analysis, we need to test the following visualization components:

1. **Scatter Plot** (`v3/src/components/graph/plots/scatter-plot/scatter-plot.tsx`)
   - Status: Initial tests created ✅

2. **Bar Chart** (`v3/src/components/graph/plots/bar-chart/bar-chart.tsx`)
   - Status: Initial tests created ✅

3. **Dot Plot** (`v3/src/components/graph/plots/dot-plot/dot-line-plot.tsx`)
   - Status: Initial tests created ✅

4. **Case Plot** (`v3/src/components/graph/plots/case-plot/case-plot.tsx`)
   - Status: Not tested yet

5. **Binned Dot Plot** (`v3/src/components/graph/plots/binned-dot-plot/binned-dot-plot.tsx`)
   - Status: Not tested yet

6. **Dot Chart** (`v3/src/components/graph/plots/dot-chart/dot-chart.tsx`)
   - Status: Not tested yet

7. **Line Plot** (`v3/src/components/graph/plots/line-plot/line-plot.tsx`)
   - Status: Not tested yet

8. **Histogram** (`v3/src/components/graph/plots/histogram/histogram.tsx`)
   - Status: Not tested yet

9. **Dot Line Plot** (`v3/src/components/graph/plots/dot-line-plot/dot-line-plot.tsx`)
   - Status: Not tested yet

### Testing Aspects for Each Component

For each visualization component, we should test:

#### 1. Rendering
- Basic rendering with minimal data
- Rendering with different data sizes (empty, small, large)
- Rendering with different attribute configurations
- Rendering with categorical vs. numerical data
- Rendering with split attributes (subplots)
- Rendering with legends

#### 2. Interactions
- Point selection (single and multiple)
- Hovering over points
- Zooming and panning
- Drag and drop operations
- Keyboard navigation
- Right-click context menus

#### 3. Performance
- Rendering performance with different data sizes
- Interaction performance (selection, zoom, pan)
- Data update performance

#### 4. Accessibility
- Keyboard navigation
- Screen reader compatibility
- Color contrast and visibility

## TODO List

### High Priority
- [x] Create test for Scatter Plot component
- [x] Create test for Bar Chart component
- [x] Create test for Dot Plot component
- [ ] Create test for Case Plot component
- [ ] Create test for Binned Dot Plot component
- [ ] Create test for Dot Chart component

### Medium Priority
- [ ] Create test for Line Plot component
- [ ] Create test for Histogram component
- [ ] Create test for Dot Line Plot component

### Low Priority
- [ ] Add integration tests for multiple visualizations working together
- [ ] Add tests for visualization-specific features (e.g., bar chart stacking, line plot smoothing)
- [ ] Create performance benchmarks for all visualization types

## How to Add a New Visualization Test

1. Create a new test file in this directory named `[visualization-name].test.tsx`
2. Import the necessary testing utilities
3. Mock the component and its dependencies as needed
4. Write tests for rendering, interactions, and performance
5. Run the tests using `npm test`

## Example Test Structure

```typescript
describe('[Visualization] Component', () => {
  describe('Rendering Tests', () => {
    it('should render data points correctly', () => {
      // Test rendering
    });
    
    // More rendering tests...
  });

  describe('Interaction Tests', () => {
    it('should handle clicking on data points', async () => {
      // Test interactions
    });
    
    // More interaction tests...
  });

  describe('Performance Tests', () => {
    it('should render efficiently', async () => {
      // Test performance
    });
    
    // More performance tests...
  });
});
```

## Best Practices

1. **Add data-testid attributes**: Add data-testid attributes to key elements in your visualization components to make them easier to select in tests.

2. **Test with realistic data**: Use realistic data sets that represent the kinds of data your visualization will encounter in production.

3. **Test interactions thoroughly**: Visualizations often involve complex user interactions, so test these thoroughly.

4. **Test performance with large data sets**: Test performance with large data sets to ensure your visualization remains responsive.

5. **Test accessibility**: Ensure your visualizations are accessible by testing keyboard navigation, screen reader compatibility, and color contrast.

6. **Test responsiveness**: Test how your visualizations respond to different screen sizes and window resizing.

## Examples

The `examples` directory contains a simple scatter plot example that demonstrates how to use these utilities. This example is for demonstration purposes only and should not be used in production.

- **scatter-plot-example.tsx**: A simple scatter plot component for testing
- **scatter-plot-example.test.tsx**: Tests for the scatter plot example

## Testing Existing Components

When testing existing visualization components in CODAP v3, follow these guidelines:

1. Identify key elements that need data-testid attributes for testing
2. Write comprehensive tests using the utilities in this directory
3. Test rendering, performance, interactions, and edge cases
4. Document any special testing considerations for each component

The utilities in this directory are designed to work with existing components and do not require creating new components for testing purposes. 