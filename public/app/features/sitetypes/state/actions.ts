import { getBackendSrv } from '@grafana/runtime';

import { ThunkResult } from 'app/types';
import { updateNavIndex } from 'app/core/actions';
import { buildNavModel } from './navModel';
import { siteTypeLoaded, siteTypesLoaded } from './reducers';

export function loadSiteTypes(): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get('/api/sitetypes', { perpage: 1000, page: 1 });
    dispatch(siteTypesLoaded(response.data));
  };
}

export function loadSiteType(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/sitetypes/${id}`);
    dispatch(siteTypeLoaded(response));
    dispatch(updateNavIndex(buildNavModel(response)));
  };
}

export function updateSiteType(type: string, site_app_configs: JSON, site_props: JSON): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const siteType = getStore().siteType.siteType;
    await getBackendSrv().put(`/api/sitetypes/${siteType.id}`, { id: siteType.id, type, site_app_configs, site_props });
    dispatch(loadSiteType(siteType.id));
  };
}

export function deleteSiteType(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/sitetypes/${id}`);
    dispatch(loadSiteTypes());
  };
}
