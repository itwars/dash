import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Alarm, AlarmsState, AlarmState } from 'app/types';

export const initialAlarmsState: AlarmsState = { alarms: [], searchQuery: '', hasFetched: false };

const alarmsSlice = createSlice({
  name: 'alarms',
  initialState: initialAlarmsState,
  reducers: {
    alarmsLoaded: (state, action: PayloadAction<Alarm[]>): AlarmsState => {
      return { ...state, hasFetched: true, alarms: action.payload };
    },
    setSearchQuery: (state, action: PayloadAction<string>): AlarmsState => {
      return { ...state, searchQuery: action.payload };
    },
  },
});

export const { alarmsLoaded, setSearchQuery } = alarmsSlice.actions;

export const alarmsReducer = alarmsSlice.reducer;

export const initialAlarmState: AlarmState = {
  alarm: {} as Alarm,
};

const alarmSlice = createSlice({
  name: 'alarm',
  initialState: initialAlarmState,
  reducers: {
    alarmLoaded: (state, action: PayloadAction<Alarm>): AlarmState => {
      return { ...state, alarm: action.payload };
    },
  },
});

export const { alarmLoaded } = alarmSlice.actions;

export const alarmReducer = alarmSlice.reducer;

export default {
  alarms: alarmsReducer,
  alarm: alarmReducer,
};
