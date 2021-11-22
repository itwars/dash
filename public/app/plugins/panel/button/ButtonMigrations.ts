import { sharedSingleStatPanelChangedHandler } from '@grafana/ui';
import { PanelModel } from '@grafana/data';
import { ButtonPanelOptions } from './types';

export const switchPanelChangedHandler = (
  panel: PanelModel<Partial<ButtonPanelOptions>> | any,
  prevPluginId: string,
  prevOptions: any
) => {
  const options = sharedSingleStatPanelChangedHandler(panel, prevPluginId, prevOptions) as ButtonPanelOptions;

  return options;
};
