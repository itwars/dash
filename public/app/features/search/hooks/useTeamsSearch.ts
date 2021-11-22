import { useEffect } from 'react';
import { useDebounce } from 'react-use';
import { CustomSearchSrv } from 'app/core/services/customsearch_srv';
import {
  TOGGLE_TEAM_SECTION,
  SEARCH_START,
  FETCH_TEAMS,
  FETCH_SITES_START,
  FETCH_SITES,
} from '../reducers/actionTypes';
import { TeamSection, UseTeamSearch } from '../types';
import { getParsedSearchQuery } from '../utils';

const searchSrv = new CustomSearchSrv();

export const useTeamsSearch: UseTeamSearch = (query, reducer, params = {}) => {
  const { queryParsing } = params;
  const [state, dispatch] = reducer;

  const searchTeams = () => {
    dispatch({ type: SEARCH_START });
    const parsedQuery = getParsedSearchQuery(query, queryParsing);
    searchSrv.searchTeams(parsedQuery).then((results) => {
      dispatch({ type: FETCH_TEAMS, payload: results });
    });
  };

  // Set loading state before debounced search
  useEffect(() => {
    dispatch({ type: SEARCH_START });
  }, [query.layout, dispatch]);

  useDebounce(searchTeams, 300, [query, queryParsing]);

  const onToggleTeamSection = (section: TeamSection) => {
    if (!section.expanded) {
      dispatch({ type: FETCH_SITES_START, payload: section.id });
      searchSrv.searchTeamSites({ teamId: section.id, page: section.page, perpage: section.perpage }).then((sites) => {
        dispatch({ type: FETCH_SITES, payload: { section, sites } });
        dispatch({ type: TOGGLE_TEAM_SECTION, payload: section });
      });
    } else {
      dispatch({ type: TOGGLE_TEAM_SECTION, payload: section });
    }
  };

  return { state, dispatch, onToggleTeamSection };
};
