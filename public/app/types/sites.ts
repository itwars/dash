import { Asset } from './assets';
import { UserAlarm } from './useralarms';

export interface Site {
  id: number;
  type: string;
  name: string;
  description: string;
  long: number;
  lat: number;
  url: string;
  serial: string;
  site_app_configs: any;
  site_props: any;
  alarm_count: number;
  team_count: number;
  asset_count: number;
}

export interface SiteTeam {
  id: number;
  team_name: string;
  avatarUrl: string;
  site_id: number;
  team_id: number;
  email: string;
  memberCount: number;
}

export interface SitesState {
  sites: Site[];
  page: number;
  sitesCount: number;
  searchQuery: string;
  hasFetched: boolean;
}

export interface SitesResponse {
  data: Site[];
  page: number;
  totalCount: number;
}

export interface SiteState {
  site: Site;
  assets: Asset[];
  teams: SiteTeam[];
  alarms: UserAlarm[];
  searchAssetQuery: string;
  searchTeamQuery: string;
  searchAlarmQuery: string;
}
