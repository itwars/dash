import { PanelPlugin } from '@grafana/data';

import { SiteOptions } from './types';
import { SiteListPanel } from './SiteListPanel';

export const plugin = new PanelPlugin<SiteOptions>(SiteListPanel).setPanelOptions((builder) => {
  builder.addNumberInput({
    path: 'limit',
    name: 'Limit',
    description: 'Per Page limit',
    defaultValue: 10,
  });
});
