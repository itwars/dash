import { sharedSingleStatMigrationHandler } from '@grafana/ui';
import { PanelPlugin } from '@grafana/data';
import { ButtonPanelOptions } from './types';
import { ButtonPanel } from './ButtonPanel';
import { switchPanelChangedHandler } from './ButtonMigrations';

export const plugin = new PanelPlugin<ButtonPanelOptions>(ButtonPanel)
  .useFieldConfig()
  .setPanelOptions((builder) => {
    builder
      .addTextInput({
        name: 'Display Label',
        description: 'Display label of button',
        path: 'displayLabel',
        defaultValue: 'none',
      })
      .addTextInput({
        name: 'client',
        description: 'Client name for downlink',
        path: 'client',
        defaultValue: 'none',
      })
      .addTextInput({
        name: 'command',
        description: 'Command for downlink',
        path: 'command',
        defaultValue: 'none',
      });
  })
  .setNoPadding()
  .setPanelChangeHandler(switchPanelChangedHandler)
  .setMigrationHandler(sharedSingleStatMigrationHandler);
