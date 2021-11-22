import { Asset, AssetState } from 'app/types';
import { User } from 'app/core/services/context_srv';

export const getSearchAlarmQuery = (state: AssetState) => state.searchAlarmQuery;
export const getUserAlarmsCount = (state: AssetState) => state.alarms.length;

export const getAsset = (state: AssetState, currentAssetId: any): Asset | null => {
  if (state.asset.id === parseInt(currentAssetId, 10)) {
    return state.asset;
  }

  return null;
};

export const getAlarms = (state: AssetState) => {
  const regex = RegExp(state.searchAlarmQuery, 'i');

  return state.alarms.filter((alarm) => {
    return regex.test(alarm.name);
  });
};

export interface Config {
  signedInUser: User;
}
