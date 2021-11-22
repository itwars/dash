import { UserAlarm } from './useralarms';

export interface Asset {
  id: number;
  site_id: number;
  type: string;
  name: string;
  serial: string;
  description: string;
  long: number;
  lat: number;
  asset_controller_configs: any;
  asset_app_configs: any;
  asset_props: any;
  alarm_count: number;
  url: string;
}

export interface AssetState {
  asset: Asset;
  alarms: UserAlarm[];
  searchAlarmQuery: string;
}
