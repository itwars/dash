import { SingleStatBaseOptions } from '@grafana/ui';
import {
  ReducerID,
  standardEditorsRegistry,
  FieldOverrideContext,
  getFieldDisplayName,
  escapeStringForRegex,
  PanelOptionsEditorBuilder,
  VizOrientation,
} from '@grafana/data';

// Structure copied from angular
export interface SwitchPanelOptions extends SingleStatBaseOptions {
  displayMode: SwitchDisplayMode;
  switchON: number;
  switchOFF: number;
  sliderMax: number;
  sliderMin: number;
  client: string;
}

export enum SwitchDisplayMode {
  Switch = 'switch',
  Slider = 'slider',
}

export function addStandardDataReduceOptions<T extends SingleStatBaseOptions>(
  builder: PanelOptionsEditorBuilder<T>,
  includeOrientation = true,
  includeFieldMatcher = true
) {
  const valueOptionsCategory = ['Value options'];
  builder.addRadio({
    path: 'reduceOptions.values',
    name: 'Show',
    description: 'Calculate a single value per column or series or show each row',
    settings: {
      options: [
        { value: false, label: 'Calculate' },
        { value: true, label: 'All values' },
      ],
    },
    defaultValue: false,
    category: valueOptionsCategory,
  });

  builder.addNumberInput({
    path: 'reduceOptions.limit',
    name: 'Limit',
    description: 'Max number of rows to display',
    category: valueOptionsCategory,
    settings: {
      placeholder: '5000',
      integer: true,
      min: 1,
      max: 5000,
    },
    showIf: (options) => options.reduceOptions.values === true,
  });

  builder.addCustomEditor({
    id: 'reduceOptions.calcs',
    path: 'reduceOptions.calcs',
    name: 'Calculation',
    description: 'Choose a reducer function / calculation',
    editor: standardEditorsRegistry.get('stats-picker').editor as any,
    defaultValue: [ReducerID.mean],
    category: valueOptionsCategory,
    // Hides it when all values mode is on
    showIf: (currentConfig) => currentConfig.reduceOptions.values === false,
  });

  if (includeFieldMatcher) {
    builder.addSelect({
      path: 'reduceOptions.fields',
      name: 'Fields',
      description: 'Select the fields that should be included in the panel',
      settings: {
        allowCustomValue: true,
        options: [],
        getOptions: async (context: FieldOverrideContext) => {
          const options = [
            { value: '', label: 'Numeric Fields' },
            { value: '/.*/', label: 'All Fields' },
          ];
          if (context && context.data) {
            for (const frame of context.data) {
              for (const field of frame.fields) {
                const name = getFieldDisplayName(field, frame, context.data);
                const value = `/^${escapeStringForRegex(name)}$/`;
                options.push({ value, label: name });
              }
            }
          }
          return Promise.resolve(options);
        },
      },
      defaultValue: '',
      category: valueOptionsCategory,
    });
  }

  if (includeOrientation) {
    builder.addRadio({
      path: 'orientation',
      name: 'Orientation',
      description: 'Stacking direction in case of multiple series or fields',
      settings: {
        options: [
          { value: VizOrientation.Auto, label: 'Auto' },
          { value: VizOrientation.Horizontal, label: 'Horizontal' },
          { value: VizOrientation.Vertical, label: 'Vertical' },
        ],
      },
      defaultValue: VizOrientation.Auto,
    });
  }
}
