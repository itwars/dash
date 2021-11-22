export interface SiteType {
  id: number;
  type: string;
  site_app_configs: any;
  site_props: any;
}

export interface SiteTypesState {
  siteTypes: SiteType[];
  searchQuery: string;
  hasFetched: boolean;
}

export interface SiteTypeState {
  siteType: SiteType;
}
