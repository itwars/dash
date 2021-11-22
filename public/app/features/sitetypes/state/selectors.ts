import { SiteType, SiteTypesState, SiteTypeState } from 'app/types';
import { User } from 'app/core/services/context_srv';

export const getSearchQuery = (state: SiteTypesState) => state.searchQuery;
export const getSiteTypesCount = (state: SiteTypesState) => state.siteTypes.length;

export const getSiteType = (state: SiteTypeState, currentSiteTypeId: any): SiteType | null => {
  if (state.siteType.id === parseInt(currentSiteTypeId, 10)) {
    return state.siteType;
  }

  return null;
};

export const getSiteTypes = (state: SiteTypesState) => {
  const regex = RegExp(state.searchQuery, 'i');

  return state.siteTypes.filter((siteType) => {
    return regex.test(siteType.type);
  });
};

export interface Config {
  signedInUser: User;
}
