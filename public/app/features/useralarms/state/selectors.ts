import { UserAlarm, UserAlarmsState, UserAlarmState } from 'app/types';
import { User } from 'app/core/services/context_srv';

export const getSearchQuery = (state: UserAlarmsState) => state.searchQuery;
export const getUserAlarmsCount = (state: UserAlarmsState) => state.userAlarms.length;

export const getUserAlarm = (state: UserAlarmState, currentAlarmId: any): UserAlarm | null => {
  if (state.userAlarm.alarm_id === parseInt(currentAlarmId, 10)) {
    return state.userAlarm;
  }

  return null;
};

export const getUserAlarms = (state: UserAlarmsState) => {
  const regex = RegExp(state.searchQuery, 'i');

  return state.userAlarms.filter((useralarm) => {
    return regex.test(useralarm.name);
  });
};

export interface Config {
  signedInUser: User;
}
