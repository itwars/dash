export interface AssetType {
  id: number;
  type: string;
  asset_controller_configs: any;
  asset_app_configs: any;
  asset_props: any;
}

export interface AssetTypesState {
  assetTypes: AssetType[];
  searchQuery: string;
  hasFetched: boolean;
}

export interface AssetTypeState {
  assetType: AssetType;
}
