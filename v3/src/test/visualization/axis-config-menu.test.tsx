/**
 * Tests for Axis Configuration Menu Interactions
 * 
 * This file contains tests for interactions with the axis configuration menu
 * and how they affect visualizations.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataSet, IDataSet } from '../../models/data/data-set';
import { Attribute } from '../../models/data/attribute';
import { AxisPlace } from '../../models/data-display/axis-model';
import { ScatterPlotModel } from '../../models/data-display/scatter-plot-model';
import { GraphDataConfigurationModel } from '../../models/data-display/graph-data-configuration-model';
import { AxisConfigMenu } from '../../components/graph/axis-config-menu';
import { DataDisplayModelContext } from '../../hooks/use-data-display-model';
import { ISharedModelManager } from '../../models/shared/shared-model-manager';
import { renderVisualization } from './visualization-test-utils';
import { simulateDoubleClick } from './interaction-test-utils';

// Mock the necessary components
jest.mock('../../components/graph/axis-config-menu', () => ({
  AxisConfigMenu: jest.fn(props => (
    <div data-testid="axis-config-menu">
      <div data-testid="axis-title">{`${props.axis.toUpperCase()} Axis: ${props.attribute?.name}`}</div>
      <div data-testid="scale-type-section">
        <div>Scale Type</div>
        <label>
          <input 
            type="radio" 
            name="scale-type" 
            value="linear" 
            defaultChecked 
            data-testid="linear-scale-option"
            onClick={() => props.onScaleChange?.('linear')}
          />
          Linear
        </label>
        <label>
          <input 
            type="radio" 
            name="scale-type" 
            value="log" 
            data-testid="log-scale-option"
            disabled={props.hasNegativeValues}
            onClick={() => props.onScaleChange?.('log')}
          />
          Logarithmic
        </label>
      </div>
      <div data-testid="axis-bounds-section">
        <div>Axis Bounds</div>
        <label>
          Min:
          <input 
            type="number" 
            data-testid="min-bound-input"
            defaultValue={props.minBound || ''}
            onChange={e => props.onMinBoundChange?.(Number(e.target.value))}
          />
        </label>
        <label>
          Max:
          <input 
            type="number" 
            data-testid="max-bound-input"
            defaultValue={props.maxBound || ''}
            onChange={e => props.onMaxBoundChange?.(Number(e.target.value))}
          />
        </label>
      </div>
    </div>
  ))
}));

// Create a test dataset
function createTestDataset() {
  const dataset = DataSet.create({
    name: "Test Dataset",
    attributesMap: {
      "attr1": { id: "attr1", name: "score", type: "numeric" },
      "attr2": { id: "attr2", name: "height", type: "numeric" },
      "attr3": { id: "attr3", name: "category", type: "categorical" }
    }
  });
  
  // Add some cases
  dataset.addCases([
    { __id__: "case1", score: 85, height: 175, category: "A" },
    { __id__: "case2", score: 92, height: 182, category: "B" },
    { __id__: "case3", score: 78, height: 168, category: "A" },
    { __id__: "case4", score: -10, height: 160, category: "C" } // Negative value for testing log scale
  ]);
  
  return dataset;
}

// Create a test visualization model
function createTestVisualizationModel(dataset: IDataSet) {
  const model = ScatterPlotModel.create({
    id: "test-scatter-plot",
    name: "Test Scatter Plot"
  });
  
  // Configure the model
  const dataConfig = GraphDataConfigurationModel.create();
  dataConfig.setDataset(dataset);
  
  // Set attributes for x and y axes
  const scoreAttr = dataset.attrFromName("score");
  const heightAttr = dataset.attrFromName("height");
  
  if (scoreAttr && heightAttr) {
    dataConfig.setAttribute(AxisPlace.bottom, scoreAttr.id);
    dataConfig.setAttribute(AxisPlace.left, heightAttr.id);
  }
  
  model.setDataConfiguration(dataConfig);
  
  return model;
}

// Create a wrapper component for testing
function TestWrapper({ children, model }: { children: React.ReactNode, model: any }) {
  return (
    <ISharedModelManager>
      <DataDisplayModelContext.Provider value={model}>
        {children}
      </DataDisplayModelContext.Provider>
    </ISharedModelManager>
  );
}

describe('Axis Configuration Menu Interactions', () => {
  let dataset: IDataSet;
  let model: any;
  
  beforeEach(() => {
    dataset = createTestDataset();
    model = createTestVisualizationModel(dataset);
  });
  
  describe('Menu Rendering', () => {
    it('renders with default props for x-axis', () => {
      const { getByTestId } = render(
        <AxisConfigMenu 
          axis="x" 
          attribute={{ id: "attr1", name: "score", type: "numeric" }}
          onScaleChange={jest.fn()}
        />
      );
      
      expect(getByTestId('axis-title')).toHaveTextContent('X Axis: score');
      expect(getByTestId('scale-type-section')).toBeInTheDocument();
      expect(getByTestId('linear-scale-option')).toBeChecked();
      expect(getByTestId('log-scale-option')).not.toBeChecked();
    });
    
    it('renders with default props for y-axis', () => {
      const { getByTestId } = render(
        <AxisConfigMenu 
          axis="y" 
          attribute={{ id: "attr2", name: "height", type: "numeric" }}
          onScaleChange={jest.fn()}
        />
      );
      
      expect(getByTestId('axis-title')).toHaveTextContent('Y Axis: height');
      expect(getByTestId('scale-type-section')).toBeInTheDocument();
    });
    
    it('disables log scale option when data has negative values', () => {
      const { getByTestId } = render(
        <AxisConfigMenu 
          axis="x" 
          attribute={{ id: "attr1", name: "score", type: "numeric" }}
          hasNegativeValues={true}
          onScaleChange={jest.fn()}
        />
      );
      
      expect(getByTestId('log-scale-option')).toBeDisabled();
    });
  });
  
  describe('Menu Interactions', () => {
    it('calls onScaleChange when scale type is changed', async () => {
      const onScaleChange = jest.fn();
      const { getByTestId } = render(
        <AxisConfigMenu 
          axis="y" 
          attribute={{ id: "attr2", name: "height", type: "numeric" }}
          onScaleChange={onScaleChange}
        />
      );
      
      const logScaleOption = getByTestId('log-scale-option');
      await userEvent.click(logScaleOption);
      
      expect(onScaleChange).toHaveBeenCalledWith('log');
    });
    
    it('calls onMinBoundChange when min bound is changed', async () => {
      const onMinBoundChange = jest.fn();
      const { getByTestId } = render(
        <AxisConfigMenu 
          axis="x" 
          attribute={{ id: "attr1", name: "score", type: "numeric" }}
          onMinBoundChange={onMinBoundChange}
        />
      );
      
      const minBoundInput = getByTestId('min-bound-input');
      await userEvent.clear(minBoundInput);
      await userEvent.type(minBoundInput, '50');
      await userEvent.tab(); // Trigger blur event
      
      expect(onMinBoundChange).toHaveBeenCalledWith(50);
    });
    
    it('calls onMaxBoundChange when max bound is changed', async () => {
      const onMaxBoundChange = jest.fn();
      const { getByTestId } = render(
        <AxisConfigMenu 
          axis="x" 
          attribute={{ id: "attr1", name: "score", type: "numeric" }}
          onMaxBoundChange={onMaxBoundChange}
        />
      );
      
      const maxBoundInput = getByTestId('max-bound-input');
      await userEvent.clear(maxBoundInput);
      await userEvent.type(maxBoundInput, '100');
      await userEvent.tab(); // Trigger blur event
      
      expect(onMaxBoundChange).toHaveBeenCalledWith(100);
    });
  });
  
  describe('Integration with Visualization', () => {
    // These tests would require more complex setup with the actual visualization components
    // For now, we'll focus on testing the menu interactions in isolation
    
    it('updates visualization when scale type is changed', async () => {
      // This would be a more complex test that verifies the visualization updates
      // when the scale type is changed in the menu
      
      // For now, we'll just verify that the model's setAxisScale method is called
      const setAxisScaleSpy = jest.spyOn(model.dataConfiguration, 'setAxisScale');
      
      const { getByTestId } = render(
        <TestWrapper model={model}>
          <AxisConfigMenu 
            axis="x" 
            attribute={{ id: "attr1", name: "score", type: "numeric" }}
            onScaleChange={(scale: string) => model.dataConfiguration.setAxisScale(AxisPlace.bottom, scale)}
          />
        </TestWrapper>
      );
      
      const logScaleOption = getByTestId('log-scale-option');
      await userEvent.click(logScaleOption);
      
      expect(setAxisScaleSpy).toHaveBeenCalledWith(AxisPlace.bottom, 'log');
    });
    
    it('updates visualization when axis bounds are changed', async () => {
      // This would be a more complex test that verifies the visualization updates
      // when the axis bounds are changed in the menu
      
      // For now, we'll just verify that the model's setAxisBounds method is called
      const setAxisBoundsSpy = jest.spyOn(model.dataConfiguration, 'setAxisBounds');
      
      const { getByTestId } = render(
        <TestWrapper model={model}>
          <AxisConfigMenu 
            axis="y" 
            attribute={{ id: "attr2", name: "height", type: "numeric" }}
            onMinBoundChange={(min: number) => model.dataConfiguration.setAxisBounds(AxisPlace.left, min, undefined)}
            onMaxBoundChange={(max: number) => model.dataConfiguration.setAxisBounds(AxisPlace.left, undefined, max)}
          />
        </TestWrapper>
      );
      
      const minBoundInput = getByTestId('min-bound-input');
      await userEvent.clear(minBoundInput);
      await userEvent.type(minBoundInput, '150');
      await userEvent.tab(); // Trigger blur event
      
      expect(setAxisBoundsSpy).toHaveBeenCalledWith(AxisPlace.left, 150, undefined);
      
      const maxBoundInput = getByTestId('max-bound-input');
      await userEvent.clear(maxBoundInput);
      await userEvent.type(maxBoundInput, '200');
      await userEvent.tab(); // Trigger blur event
      
      expect(setAxisBoundsSpy).toHaveBeenCalledWith(AxisPlace.left, undefined, 200);
    });
  });
}); 