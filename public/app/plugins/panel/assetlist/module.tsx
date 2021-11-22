import { PanelPlugin } from '@grafana/data';

import { AssetOptions } from './types';
import { AssetListPanel } from './AssetListPanel';

export const plugin = new PanelPlugin<AssetOptions>(AssetListPanel).setPanelOptions((builder) => {
  builder.addNumberInput({
    path: 'limit',
    name: 'Limit',
    description: 'Per Page limit',
    defaultValue: 10,
  });
});
