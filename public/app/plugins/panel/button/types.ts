import { SingleStatBaseOptions } from '@grafana/ui';

// Structure copied from angular
export interface ButtonPanelOptions extends SingleStatBaseOptions {
  displayLabel: string;
  client: string;
  command: string;
}
