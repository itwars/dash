import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { UserAlarm, UserAlarmsState, UserAlarmState } from 'app/types';

export const initialUserAlarmsState: UserAlarmsState = { userAlarms: [], searchQuery: '', hasFetched: false };

const userAlarmsSlice = createSlice({
  name: 'userAlarms',
  initialState: initialUserAlarmsState,
  reducers: {
    userAlarmsLoaded: (state, action: PayloadAction<UserAlarm[]>): UserAlarmsState => {
      return { ...state, hasFetched: true, userAlarms: action.payload };
    },
    setSearchQuery: (state, action: PayloadAction<string>): UserAlarmsState => {
      return { ...state, searchQuery: action.payload };
    },
  },
});

export const { userAlarmsLoaded, setSearchQuery } = userAlarmsSlice.actions;

export const userAlarmsReducer = userAlarmsSlice.reducer;

export const initialUserAlarmState: UserAlarmState = {
  userAlarm: {} as UserAlarm,
};

const alarmSlice = createSlice({
  name: 'userAlarm',
  initialState: initialUserAlarmState,
  reducers: {
    userAlarmLoaded: (state, action: PayloadAction<UserAlarm>): UserAlarmState => {
      return { ...state, userAlarm: action.payload };
    },
  },
});

export const { userAlarmLoaded } = alarmSlice.actions;

export const userAlarmReducer = alarmSlice.reducer;

export default {
  userAlarms: userAlarmsReducer,
  userAlarm: userAlarmReducer,
};
