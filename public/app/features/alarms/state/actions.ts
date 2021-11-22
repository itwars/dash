import { getBackendSrv } from '@grafana/runtime';

import { ThunkResult } from 'app/types';
import { updateNavIndex } from 'app/core/actions';
import { buildNavModel } from './navModel';
import { alarmLoaded, alarmsLoaded } from './reducers';

export function loadAlarms(): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get('/api/admin/alarms', { perpage: 1000, page: 1 });
    dispatch(alarmsLoaded(response.data));
  };
}

export function loadAlarm(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/admin/alarms/${id}`);
    dispatch(alarmLoaded(response));
    dispatch(updateNavIndex(buildNavModel(response)));
  };
}

export function updateAlarm(
  name: string,
  description: string,
  alerting_msg: string,
  ok_msg: string,
  severity: number,
  permission_level: number,
  alarm_level: number,
  for_duration: number,
  manual_reset: boolean,
  context: JSON
): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const alarm = getStore().alarm.alarm;
    await getBackendSrv().put(`/api/admin/alarms/${alarm.id}`, {
      id: alarm.id,
      name,
      description,
      alerting_msg,
      ok_msg,
      severity,
      permission_level,
      alarm_level,
      for_duration,
      manual_reset,
      context,
    });
    dispatch(loadAlarm(alarm.id));
  };
}

export function deleteAlarm(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/admin/alarms/${id}`);
    dispatch(loadAlarms());
  };
}
