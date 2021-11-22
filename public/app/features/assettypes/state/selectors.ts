import { AssetType, AssetTypesState, AssetTypeState } from 'app/types';
import { User } from 'app/core/services/context_srv';

export const getSearchQuery = (state: AssetTypesState) => state.searchQuery;
export const getAssetTypesCount = (state: AssetTypesState) => state.assetTypes.length;

export const getAssetType = (state: AssetTypeState, currentAssetTypeId: any): AssetType | null => {
  if (state.assetType.id === parseInt(currentAssetTypeId, 10)) {
    return state.assetType;
  }

  return null;
};

export const getAssetTypes = (state: AssetTypesState) => {
  const regex = RegExp(state.searchQuery, 'i');

  return state.assetTypes.filter((assetType) => {
    return regex.test(assetType.type);
  });
};

export interface Config {
  signedInUser: User;
}
