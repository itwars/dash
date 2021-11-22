import { sharedSingleStatPanelChangedHandler } from '@grafana/ui';
import { PanelModel } from '@grafana/data';
import { SwitchPanelOptions } from './types';

export const switchPanelChangedHandler = (
  panel: PanelModel<Partial<SwitchPanelOptions>> | any,
  prevPluginId: string,
  prevOptions: any
) => {
  const options = sharedSingleStatPanelChangedHandler(panel, prevPluginId, prevOptions) as SwitchPanelOptions;

  return options;
};
