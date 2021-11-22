import { getBackendSrv } from '@grafana/runtime';

import { ThunkResult } from 'app/types';
import { updateNavIndex } from 'app/core/actions';
import { buildNavModel } from './navModel';
import { userAlarmLoaded, userAlarmsLoaded } from './reducers';

export function loadUserAlarms(alarm_level: number, site_id: number, asset_id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get('/api/org/useralarms', {
      perpage: 1000,
      page: 1,
      alarm_level: alarm_level,
      site_id: site_id,
      asset_id: asset_id,
    });
    dispatch(userAlarmsLoaded(response.data));
  };
}

export function loadUserAlarm(id: number, alarm_level: number, site_id: number, asset_id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/org/useralarms/${id}`, {
      alarm_level: alarm_level,
      site_id: site_id,
      asset_id: asset_id,
    });
    dispatch(userAlarmLoaded(response));
    dispatch(updateNavIndex(buildNavModel(response.name, response.alarm_id, site_id, asset_id)));
  };
}

export function updateUserAlarm(
  alarm_level: number,
  site_id: number,
  asset_id: number,
  for_duration: number,
  enabled: boolean,
  context: JSON
): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const alarm = getStore().userAlarm.userAlarm;
    await getBackendSrv().put(`/api/org/useralarms/${alarm.alarm_id}`, {
      alarm_level,
      site_id,
      asset_id,
      for_duration,
      enabled,
      context,
    });
    dispatch(loadUserAlarm(alarm.alarm_id, alarm_level, site_id, asset_id));
  };
}
