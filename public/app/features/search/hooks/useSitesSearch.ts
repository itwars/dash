import { useEffect } from 'react';
import { useDebounce } from 'react-use';
import { CustomSearchSrv } from 'app/core/services/customsearch_srv';
import {
  TOGGLE_SITE_SECTION,
  SEARCH_START,
  FETCH_ASSETS,
  FETCH_ASSETS_START,
  FETCH_SITES,
} from '../reducers/actionTypes';
import { SiteSection, UseSiteSearch } from '../types';
import { getParsedSearchQuery } from '../utils';

const searchSrv = new CustomSearchSrv();

export const useSitesSearch: UseSiteSearch = (query, reducer, params = {}) => {
  const { queryParsing } = params;
  const [state, dispatch] = reducer;

  const searchSites = () => {
    dispatch({ type: SEARCH_START });
    const parsedQuery = getParsedSearchQuery(query, queryParsing);
    searchSrv.searchSites(parsedQuery).then((results) => {
      dispatch({ type: FETCH_SITES, payload: results });
    });
  };

  // Set loading state before debounced search
  useEffect(() => {
    dispatch({ type: SEARCH_START });
  }, [query.layout, dispatch]);

  useDebounce(searchSites, 300, [query, queryParsing]);

  const onToggleSiteSection = (section: SiteSection) => {
    if (!section.expanded) {
      dispatch({ type: FETCH_ASSETS_START, payload: section.id });
      searchSrv.searchAssets({ siteId: section.id, page: section.page, perpage: section.perpage }).then((assets) => {
        dispatch({ type: FETCH_ASSETS, payload: { section, assets } });
        dispatch({ type: TOGGLE_SITE_SECTION, payload: section });
      });
    } else {
      dispatch({ type: TOGGLE_SITE_SECTION, payload: section });
    }
  };

  return { state, dispatch, onToggleSiteSection };
};
