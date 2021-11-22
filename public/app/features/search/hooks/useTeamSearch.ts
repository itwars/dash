import { useReducer } from 'react';
import { SearchQuery } from '../types';
import { teamsSearchState, TeamsSearchState, searchTeamReducer } from '../reducers/teamSearch';
import { useTeamsSearch } from './useTeamsSearch';

export const useTeamSearch = (query: SearchQuery) => {
  const reducer = useReducer(searchTeamReducer, teamsSearchState);
  const {
    state: { teams: results, loading },
    onToggleTeamSection,
  } = useTeamsSearch<TeamsSearchState>(query, reducer, { queryParsing: true });

  return {
    results,
    loading,
    onToggleTeamSection,
  };
};
