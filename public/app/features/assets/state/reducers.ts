import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Asset, AssetState, UserAlarm } from 'app/types';

export const initialAssetState: AssetState = {
  asset: {} as Asset,
  alarms: [] as UserAlarm[],
  searchAlarmQuery: '',
};

const assetSlice = createSlice({
  name: 'asset',
  initialState: initialAssetState,
  reducers: {
    assetLoaded: (state, action: PayloadAction<Asset>): AssetState => {
      return { ...state, asset: action.payload };
    },
    userAlarmsLoaded: (state, action: PayloadAction<UserAlarm[]>): AssetState => {
      return { ...state, alarms: action.payload };
    },
    setSearchAlarmQuery: (state, action: PayloadAction<string>): AssetState => {
      return { ...state, searchAlarmQuery: action.payload };
    },
  },
});

export const { assetLoaded, userAlarmsLoaded, setSearchAlarmQuery } = assetSlice.actions;

export const assetReducer = assetSlice.reducer;

export default {
  asset: assetReducer,
};
