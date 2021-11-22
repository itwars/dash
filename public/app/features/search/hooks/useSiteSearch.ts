import { useReducer } from 'react';
import { SearchQuery } from '../types';
import { sitesSearchState, SitesSearchState, searchSiteReducer } from '../reducers/siteSearch';
import { useSitesSearch } from './useSitesSearch';

export const useSiteSearch = (query: SearchQuery) => {
  const reducer = useReducer(searchSiteReducer, sitesSearchState);
  const {
    state: { sites: results, loading },
    onToggleSiteSection,
  } = useSitesSearch<SitesSearchState>(query, reducer, { queryParsing: true });
  return {
    results,
    loading,
    onToggleSiteSection,
  };
};
