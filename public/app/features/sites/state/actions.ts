import { getBackendSrv } from '@grafana/runtime';

import { AlarmLevel, ThunkResult } from 'app/types';
import { updateNavIndex } from 'app/core/actions';
import { buildNavModel } from './navModel';
import { siteLoaded, sitesLoaded, assetsLoaded, teamsLoaded, userAlarmsLoaded, pageChanged } from './reducers';

export function loadSites(): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get('/api/sites', { perpage: 1000, page: 1 });
    dispatch(sitesLoaded(response.data));
  };
}

export function loadAssets(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/sites/${id}/assets`, { perpage: 1000, page: 1 });
    dispatch(assetsLoaded(response.data));
  };
}

export function loadTeams(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/sites/${id}/teams`, { perpage: 1000, page: 1 });
    dispatch(teamsLoaded(response.data));
  };
}

export function loadUserAlarms(site_id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get('/api/org/useralarms', {
      perpage: 1000,
      page: 1,
      alarm_level: AlarmLevel.Site,
      site_id: site_id,
      asset_id: 0,
    });
    dispatch(userAlarmsLoaded(response.data));
  };
}

export function changePage(page: number, limit: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    dispatch(pageChanged(page));
    dispatch(loadSites());
  };
}

export function loadSite(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/sites/${id}`);
    dispatch(siteLoaded(response));
    dispatch(updateNavIndex(buildNavModel(response)));
  };
}

export function updateSite(
  type: string,
  name: string,
  description: string,
  long: number,
  lat: number,
  serial: string,
  site_app_configs: JSON,
  site_props: JSON
): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const site = getStore().site.site;
    await getBackendSrv().put(`/api/sites/${site.id}`, {
      id: site.id,
      type,
      name,
      description,
      long,
      lat,
      serial,
      site_app_configs,
      site_props,
    });
    dispatch(loadSite(site.id));
  };
}

export function deleteSite(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/sites/${id}`);
    dispatch(loadSites());
  };
}

export function cloneSite(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().post(`/api/sites/${id}/clone`);
    dispatch(loadSites());
  };
}

export function deleteAsset(id: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const site = getStore().site.site;
    await getBackendSrv().delete(`/api/sites/${site.id}/assets/${id}/`);
    dispatch(loadAssets(site.id));
  };
}

export function cloneAsset(id: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const site = getStore().site.site;
    await getBackendSrv().post(`/api/sites/${site.id}/assets/${id}/clone`);
    dispatch(loadAssets(site.id));
  };
}

export function addTeam(id: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const site = getStore().site.site;
    await getBackendSrv().post(`/api/sites/${site.id}/teams`, { team_id: id });
    dispatch(loadTeams(site.id));
  };
}

export function deleteTeam(id: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const site = getStore().site.site;
    await getBackendSrv().delete(`/api/sites/${site.id}/teams/${id}/`);
    dispatch(loadTeams(site.id));
  };
}
