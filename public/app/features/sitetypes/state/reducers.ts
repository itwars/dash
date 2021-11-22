import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { SiteType, SiteTypesState, SiteTypeState } from 'app/types';

export const initialSiteTypesState: SiteTypesState = { siteTypes: [], searchQuery: '', hasFetched: false };

const siteTypesSlice = createSlice({
  name: 'siteTypes',
  initialState: initialSiteTypesState,
  reducers: {
    siteTypesLoaded: (state, action: PayloadAction<SiteType[]>): SiteTypesState => {
      return { ...state, hasFetched: true, siteTypes: action.payload };
    },
    setSearchQuery: (state, action: PayloadAction<string>): SiteTypesState => {
      return { ...state, searchQuery: action.payload };
    },
  },
});

export const { siteTypesLoaded, setSearchQuery } = siteTypesSlice.actions;

export const siteTypesReducer = siteTypesSlice.reducer;

export const initialSiteTypeState: SiteTypeState = {
  siteType: {} as SiteType,
};

const siteTypeSlice = createSlice({
  name: 'siteType',
  initialState: initialSiteTypeState,
  reducers: {
    siteTypeLoaded: (state, action: PayloadAction<SiteType>): SiteTypeState => {
      return { ...state, siteType: action.payload };
    },
  },
});

export const { siteTypeLoaded } = siteTypeSlice.actions;

export const siteTypeReducer = siteTypeSlice.reducer;

export default {
  siteTypes: siteTypesReducer,
  siteType: siteTypeReducer,
};
