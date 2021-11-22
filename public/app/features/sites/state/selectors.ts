import { Site, SitesState, SiteState } from 'app/types';
import { User } from 'app/core/services/context_srv';

export const getSearchQuery = (state: SitesState) => state.searchQuery;
export const getSearchAssetQuery = (state: SiteState) => state.searchAssetQuery;
export const getSearchTeamQuery = (state: SiteState) => state.searchTeamQuery;
export const getSearchAlarmQuery = (state: SiteState) => state.searchAlarmQuery;

export const getSitesCount = (state: SitesState) => state.sites.length;
export const getAssetsCount = (state: SiteState) => state.assets.length;
export const getTeamsCount = (state: SiteState) => state.teams.length;
export const getUserAlarmsCount = (state: SiteState) => state.alarms.length;

export const getSite = (state: SiteState, currentSiteId: any): Site | null => {
  if (state.site.id === parseInt(currentSiteId, 10)) {
    return state.site;
  }

  return null;
};

export const getSites = (state: SitesState) => {
  const regex = RegExp(state.searchQuery, 'i');

  return state.sites.filter((site) => {
    return regex.test(site.name);
  });
};

export const getAssets = (state: SiteState) => {
  const regex = RegExp(state.searchAssetQuery, 'i');

  return state.assets.filter((asset) => {
    return regex.test(asset.serial) || regex.test(asset.name);
  });
};

export const getTeams = (state: SiteState) => {
  const regex = RegExp(state.searchTeamQuery, 'i');

  return state.teams.filter((team) => {
    return regex.test(team.team_name);
  });
};

export const getAlarms = (state: SiteState) => {
  const regex = RegExp(state.searchAlarmQuery, 'i');

  return state.alarms.filter((alarm) => {
    return regex.test(alarm.name);
  });
};

export interface Config {
  signedInUser: User;
}
