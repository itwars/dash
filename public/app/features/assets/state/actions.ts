import { getBackendSrv } from '@grafana/runtime';

import { AlarmLevel, ThunkResult } from 'app/types';
import { updateNavIndex } from 'app/core/actions';
import { buildNavModel } from './navModel';
import { assetLoaded, userAlarmsLoaded } from './reducers';

export function loadAsset(id: number, siteId: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/sites/${siteId}/assets/${id}`);
    dispatch(assetLoaded(response));
    dispatch(updateNavIndex(buildNavModel(response)));
  };
}

export function loadUserAlarms(site_id: number, asset_id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get('/api/org/useralarms', {
      perpage: 1000,
      page: 1,
      alarm_level: AlarmLevel.Asset,
      site_id: site_id,
      asset_id: asset_id,
    });
    dispatch(userAlarmsLoaded(response.data));
  };
}

export function updateAsset(
  type: string,
  name: string,
  serial: string,
  description: string,
  long: number,
  lat: number,
  asset_controller_configs: JSON,
  asset_app_configs: JSON,
  asset_props: JSON
): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const asset = getStore().asset.asset;
    await getBackendSrv().put(`/api/sites/${asset.site_id}/assets/${asset.id}`, {
      id: asset.id,
      type,
      name,
      serial,
      description,
      long,
      lat,
      asset_controller_configs,
      asset_app_configs,
      asset_props,
    });
    dispatch(loadAsset(asset.id, asset.site_id));
  };
}
