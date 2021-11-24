import { AnyAction, combineReducers } from 'redux';
import { CleanUp, cleanUpAction } from '../actions/cleanUp';
import sharedReducers from 'app/core/reducers';
import alertingReducers from 'app/features/alerting/state/reducers';
import teamsReducers from 'app/features/teams/state/reducers';
import apiKeysReducers from 'app/features/api-keys/state/reducers';
import foldersReducers from 'app/features/folders/state/reducers';
import dashboardReducers from 'app/features/dashboard/state/reducers';
import exploreReducers from 'app/features/explore/state/main';
import { reducer as pluginsReducer } from 'app/features/plugins/admin/state/reducer';
import dataSourcesReducers from 'app/features/datasources/state/reducers';
import usersReducers from 'app/features/users/state/reducers';
import userReducers from 'app/features/profile/state/reducers';
import organizationReducers from 'app/features/org/state/reducers';
import ldapReducers from 'app/features/admin/state/reducers';
import templatingReducers from 'app/features/variables/state/reducers';
import importDashboardReducers from 'app/features/manage-dashboards/state/reducers';
import panelEditorReducers from 'app/features/dashboard/components/PanelEditor/state/reducers';
import panelsReducers from 'app/features/panel/state/reducers';
import alarmsReducer from 'app/features/alarms/state/reducers';
import assetReducer from 'app/features/assets/state/reducers';
import sitesReducer from 'app/features/sites/state/reducers';
import userAlarmsReducer from 'app/features/useralarms/state/reducers';
import siteTypesReducer from 'app/features/sitetypes/state/reducers';
import assetTypesReducer from 'app/features/assettypes/state/reducers';
import dashboardNavsReducer from 'app/features/dashboard/containers/state/reducers';

const rootReducers = {
  ...sharedReducers,
  ...alertingReducers,
  ...teamsReducers,
  ...apiKeysReducers,
  ...foldersReducers,
  ...dashboardReducers,
  ...exploreReducers,
  ...dataSourcesReducers,
  ...usersReducers,
  ...userReducers,
  ...organizationReducers,
  ...ldapReducers,
  ...templatingReducers,
  ...importDashboardReducers,
  ...panelEditorReducers,
  ...panelsReducers,
  ...alarmsReducer,
  ...assetReducer,
  ...sitesReducer,
  ...userAlarmsReducer,
  ...siteTypesReducer,
  ...assetTypesReducer,
  ...dashboardNavsReducer,
  plugins: pluginsReducer,
};

const addedReducers = {};

export const addReducer = (newReducers: any) => {
  Object.assign(addedReducers, newReducers);
};

export const createRootReducer = () => {
  const appReducer = combineReducers({
    ...rootReducers,
    ...addedReducers,
  });

  return (state: any, action: AnyAction) => {
    if (action.type !== cleanUpAction.type) {
      return appReducer(state, action);
    }

    const { stateSelector } = action.payload as CleanUp<any>;
    const stateSlice = stateSelector(state);
    recursiveCleanState(state, stateSlice);

    return appReducer(state, action);
  };
};

export const recursiveCleanState = (state: any, stateSlice: any): boolean => {
  for (const stateKey in state) {
    if (!state.hasOwnProperty(stateKey)) {
      continue;
    }

    const slice = state[stateKey];
    if (slice === stateSlice) {
      state[stateKey] = undefined;
      return true;
    }

    if (typeof slice === 'object') {
      const cleaned = recursiveCleanState(slice, stateSlice);
      if (cleaned) {
        return true;
      }
    }
  }

  return false;
};
