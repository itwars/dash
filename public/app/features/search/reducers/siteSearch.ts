import { SearchItemType, SearchAction, SiteSection } from '../types';
import { getLookup } from '../utils';
import { TOGGLE_SITE_SECTION, SEARCH_START, FETCH_ASSETS, FETCH_ASSETS_START, FETCH_SITES } from './actionTypes';

export interface SitesSearchState {
  sites: SiteSection[];
  loading: boolean;
  selectedIndex: number;
  initialLoading: boolean;
}

export const sitesSearchState: SitesSearchState = {
  sites: [],
  loading: true,
  initialLoading: true,
  selectedIndex: 0,
};

export const searchSiteReducer = (state: SitesSearchState, action: SearchAction) => {
  switch (action.type) {
    case SEARCH_START:
      if (!state.loading) {
        return { ...state, loading: true };
      }
      return state;
    case FETCH_SITES: {
      const sites = action.payload;
      return {
        ...state,
        sites: sites.map((site: any) => ({
          ...site,
          assets: [],
          ItemType: SearchItemType.DashFolder,
          page: 1,
          perpage: 100,
          itemsFetching: false,
        })),
        loading: false,
        initialLoading: false,
      };
    }
    case TOGGLE_SITE_SECTION: {
      const section = action.payload;
      const lookupField = getLookup(section.name);
      return {
        ...state,
        sites: state.sites.map((result: SiteSection) => {
          if (section[lookupField] === result[lookupField]) {
            return { ...result, expanded: !result.expanded };
          }
          return result;
        }),
      };
    }
    case FETCH_ASSETS: {
      const { section, assets } = action.payload;
      return {
        ...state,
        sites: state.sites.map((site: any) => {
          if (section.id === site.id) {
            return {
              ...site,
              assets: assets.map((asset: any) => ({
                ...asset,
                ItemType: SearchItemType.DashDB,
              })),
              itemsFetching: false,
            };
          }
          return site;
        }),
      };
    }
    case FETCH_ASSETS_START: {
      const id = action.payload;
      if (id) {
        return {
          ...state,
          sites: state.sites.map((site) => (site.id === id ? { ...site, itemsFetching: true } : site)),
        };
      }
      return state;
    }
    default:
      return state;
  }
};
