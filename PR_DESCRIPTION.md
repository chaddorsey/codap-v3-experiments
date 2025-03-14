# Visualization Testing Utilities for CODAP v3

This PR adds comprehensive testing utilities for visualization components in CODAP v3. These utilities make it easier to test data visualizations, including rendering, user interactions, snapshots, and performance.

## Changes

### Basic Visualization Testing Utilities

Added utilities in `src/test/visualization/visualization-test-utils.ts` for:

- Rendering visualization components with `renderVisualization`
- Verifying data points with `verifyDataPoints` and `verifyDataPoint`
- Interacting with data points using `clickDataPoint` and `hoverDataPoint`

### User Interaction Testing Utilities

Added utilities in `src/test/visualization/interaction-test-utils.ts` for:

- Simulating mouse interactions like zooming, panning, and selection
- Simulating keyboard navigation
- Simulating other interactions like double-clicking, right-clicking, and hovering

### Snapshot Testing Utilities

Added utilities in `src/test/visualization/snapshot-test-utils.ts` for:

- Creating snapshots of visualization components
- Comparing visualizations with baseline snapshots
- Saving and loading baseline snapshots

### Performance Testing Utilities

Added utilities in `src/test/visualization/performance-test-utils.ts` for:

- Measuring rendering performance of visualization components
- Measuring the performance of interactions with visualizations
- Measuring the performance of data updates in visualizations
- Creating performance reports with thresholds

### Tests and Documentation

- Added comprehensive tests for all utilities
- Added detailed documentation in `design/docs/visualization-testing.md` and `design/docs/testing-utilities.md`

## Testing

All tests are passing. The utilities have been tested with simple visualization components and should work with the existing CODAP v3 visualization components.

## Next Steps

These utilities can be used in future tests to simplify the testing of visualization components. They can be extended as needed to support additional visualization types and testing scenarios. 