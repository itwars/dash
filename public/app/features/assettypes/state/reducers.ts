import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AssetType, AssetTypesState, AssetTypeState } from 'app/types';

export const initialAssetTypesState: AssetTypesState = { assetTypes: [], searchQuery: '', hasFetched: false };

const assetTypesSlice = createSlice({
  name: 'assetTypes',
  initialState: initialAssetTypesState,
  reducers: {
    assetTypesLoaded: (state, action: PayloadAction<AssetType[]>): AssetTypesState => {
      return { ...state, hasFetched: true, assetTypes: action.payload };
    },
    setSearchQuery: (state, action: PayloadAction<string>): AssetTypesState => {
      return { ...state, searchQuery: action.payload };
    },
  },
});

export const { assetTypesLoaded, setSearchQuery } = assetTypesSlice.actions;

export const assetTypesReducer = assetTypesSlice.reducer;

export const initialAssetTypeState: AssetTypeState = {
  assetType: {} as AssetType,
};

const assetTypeSlice = createSlice({
  name: 'assetType',
  initialState: initialAssetTypeState,
  reducers: {
    assetTypeLoaded: (state, action: PayloadAction<AssetType>): AssetTypeState => {
      return { ...state, assetType: action.payload };
    },
  },
});

export const { assetTypeLoaded } = assetTypeSlice.actions;

export const assetTypeReducer = assetTypeSlice.reducer;

export default {
  assetTypes: assetTypesReducer,
  assetType: assetTypeReducer,
};
