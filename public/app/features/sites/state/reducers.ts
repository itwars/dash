import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Asset, Site, SitesState, SiteState, UserAlarm, SiteTeam } from 'app/types';

export const initialSitesState: SitesState = { sites: [], page: 1, sitesCount: 0, searchQuery: '', hasFetched: false };

const sitesSlice = createSlice({
  name: 'sites',
  initialState: initialSitesState,
  reducers: {
    sitesLoaded: (state, action: PayloadAction<Site[]>): SitesState => {
      return { ...state, hasFetched: true, sites: action.payload };
    },
    setSearchQuery: (state, action: PayloadAction<string>): SitesState => {
      return { ...state, searchQuery: action.payload };
    },
    pageChanged: (state, action: PayloadAction<number>) => ({
      ...state,
      page: action.payload,
    }),
  },
});

export const { sitesLoaded, setSearchQuery, pageChanged } = sitesSlice.actions;

export const sitesReducer = sitesSlice.reducer;

export const initialSiteState: SiteState = {
  site: {} as Site,
  assets: [] as Asset[],
  teams: [] as SiteTeam[],
  alarms: [] as UserAlarm[],
  searchAssetQuery: '',
  searchTeamQuery: '',
  searchAlarmQuery: '',
};

const siteSlice = createSlice({
  name: 'site',
  initialState: initialSiteState,
  reducers: {
    siteLoaded: (state, action: PayloadAction<Site>): SiteState => {
      return { ...state, site: action.payload };
    },
    assetsLoaded: (state, action: PayloadAction<Asset[]>): SiteState => {
      return { ...state, assets: action.payload };
    },
    teamsLoaded: (state, action: PayloadAction<SiteTeam[]>): SiteState => {
      return { ...state, teams: action.payload };
    },
    userAlarmsLoaded: (state, action: PayloadAction<UserAlarm[]>): SiteState => {
      return { ...state, alarms: action.payload };
    },
    setSearchAssetQuery: (state, action: PayloadAction<string>): SiteState => {
      return { ...state, searchAssetQuery: action.payload };
    },
    setSearchTeamQuery: (state, action: PayloadAction<string>): SiteState => {
      return { ...state, searchTeamQuery: action.payload };
    },
    setSearchAlarmQuery: (state, action: PayloadAction<string>): SiteState => {
      return { ...state, searchAlarmQuery: action.payload };
    },
  },
});

export const {
  siteLoaded,
  assetsLoaded,
  teamsLoaded,
  userAlarmsLoaded,
  setSearchAssetQuery,
  setSearchTeamQuery,
  setSearchAlarmQuery,
} = siteSlice.actions;

export const siteReducer = siteSlice.reducer;

export default {
  sites: sitesReducer,
  site: siteReducer,
};
