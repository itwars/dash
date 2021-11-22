import { sharedSingleStatMigrationHandler } from '@grafana/ui';
import { PanelPlugin } from '@grafana/data';
import { SwitchPanelOptions, addStandardDataReduceOptions } from './types';
import { SwitchPanel } from './SwitchPanel';
import { switchPanelChangedHandler } from './SwitchMigrations';

export const plugin = new PanelPlugin<SwitchPanelOptions>(SwitchPanel)
  .useFieldConfig()
  .setPanelOptions((builder) => {
    addStandardDataReduceOptions(builder);
    const mainCategory = ['Switch options'];

    builder
      .addRadio({
        path: 'displayMode',
        name: 'Display mode',
        description: 'Display Switch / Slider',
        defaultValue: 'switch',
        category: mainCategory,
        settings: {
          options: [
            { value: 'switch', label: 'Switch' },
            { value: 'slider', label: 'Slider' },
          ],
        },
      })
      .addNumberInput({
        name: 'Switch ON value',
        description: 'ON value of switch',
        path: 'switchON',
        defaultValue: 1,
        category: mainCategory,
      })
      .addNumberInput({
        name: 'Switch OFF value',
        description: 'OFF value of switch',
        path: 'switchOFF',
        defaultValue: 100,
        category: mainCategory,
      })
      .addNumberInput({
        name: 'Slider Max value',
        description: 'Max value of slider',
        path: 'sliderMax',
        defaultValue: 100,
        category: mainCategory,
      })
      .addNumberInput({
        name: 'Slider Min value',
        description: 'Min value of slider',
        path: 'sliderMin',
        defaultValue: 0,
        category: mainCategory,
      })
      .addTextInput({
        name: 'client',
        description: 'Client name for downlink',
        path: 'client',
        defaultValue: 'none',
        category: mainCategory,
      });
  })
  .setNoPadding()
  .setPanelChangeHandler(switchPanelChangedHandler)
  .setMigrationHandler(sharedSingleStatMigrationHandler);
