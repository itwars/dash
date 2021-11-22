import { useReducer } from 'react';
import { debounce } from 'lodash';
import { locationService } from '@grafana/runtime';
import { defaultSearchQuery, searchQueryReducer } from '../reducers/searchQueryReducer';
import { LAYOUT_CHANGE, QUERY_CHANGE } from '../reducers/actionTypes';
import { SearchQuery, SearchLayout } from '../types';
import { hasCustomFilters, parseRouteParams } from '../utils';

const updateLocation = debounce((query) => locationService.partial(query), 300);

export const useCustomSearchQuery = (defaults: Partial<SearchQuery>) => {
  const queryParams = parseRouteParams(locationService.getSearchObject());
  const initialState = { ...defaultSearchQuery, ...defaults, ...queryParams };
  const [query, dispatch] = useReducer(searchQueryReducer, initialState);

  const onQueryChange = (query: string) => {
    dispatch({ type: QUERY_CHANGE, payload: query });
    updateLocation({ query });
  };

  const onLayoutChange = (layout: SearchLayout) => {
    dispatch({ type: LAYOUT_CHANGE, payload: layout });
    if (layout === SearchLayout.Folders) {
      updateLocation({ layout, sort: null });
      return;
    }
    updateLocation({ layout });
  };

  return {
    query,
    hasFilters: hasCustomFilters(query),
    onQueryChange,
    onLayoutChange,
  };
};
