import { getBackendSrv } from '@grafana/runtime';

import { ThunkResult } from 'app/types';
import { updateNavIndex } from 'app/core/actions';
import { buildNavModel } from './navModel';
import { assetTypeLoaded, assetTypesLoaded } from './reducers';

export function loadAssetTypes(): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get('/api/assettypes', { perpage: 1000, page: 1 });
    dispatch(assetTypesLoaded(response.data));
  };
}

export function loadAssetType(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/assettypes/${id}`);
    dispatch(assetTypeLoaded(response));
    dispatch(updateNavIndex(buildNavModel(response)));
  };
}

export function updateAssetType(
  type: string,
  asset_app_configs: JSON,
  asset_props: JSON,
  asset_controller_configs: JSON
): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const assetType = getStore().assetType.assetType;
    await getBackendSrv().put(`/api/assettypes/${assetType.id}`, {
      id: assetType.id,
      type,
      asset_app_configs,
      asset_props,
      asset_controller_configs,
    });
    dispatch(loadAssetType(assetType.id));
  };
}

export function deleteAssetType(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/assettypes/${id}`);
    dispatch(loadAssetTypes());
  };
}
