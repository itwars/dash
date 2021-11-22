export interface UserAlarm {
  alarm_id: number;
  name: string;
  alarm_level: number;
  for_duration: number;
  context: any;
  enabled: boolean;
}

export interface UserAlarmsState {
  userAlarms: UserAlarm[];
  searchQuery: string;
  hasFetched: boolean;
}

export interface UserAlarmState {
  userAlarm: UserAlarm;
}
