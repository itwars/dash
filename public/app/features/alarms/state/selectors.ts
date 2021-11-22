import { Alarm, AlarmsState, AlarmState } from 'app/types';
import { User } from 'app/core/services/context_srv';

export const getSearchQuery = (state: AlarmsState) => state.searchQuery;
export const getAlarmsCount = (state: AlarmsState) => state.alarms.length;

export const getAlarm = (state: AlarmState, currentAlarmId: any): Alarm | null => {
  if (state.alarm.id === parseInt(currentAlarmId, 10)) {
    return state.alarm;
  }

  return null;
};

export const getAlarms = (state: AlarmsState) => {
  const regex = RegExp(state.searchQuery, 'i');

  return state.alarms.filter((alarm) => {
    return regex.test(alarm.name);
  });
};

export interface Config {
  signedInUser: User;
}
