import { SearchItemType, SearchAction, TeamSection } from '../types';
import { getLookup } from '../utils';
import { TOGGLE_TEAM_SECTION, SEARCH_START, FETCH_TEAMS, FETCH_SITES_START, FETCH_SITES } from './actionTypes';

export interface TeamsSearchState {
  teams: TeamSection[];
  loading: boolean;
  selectedIndex: number;
  initialLoading: boolean;
}

export const teamsSearchState: TeamsSearchState = {
  teams: [],
  loading: true,
  initialLoading: true,
  selectedIndex: 0,
};

export const searchTeamReducer = (state: TeamsSearchState, action: SearchAction) => {
  switch (action.type) {
    case SEARCH_START:
      if (!state.loading) {
        return { ...state, loading: true };
      }
      return state;
    case FETCH_TEAMS: {
      const teams = action.payload;
      return {
        ...state,
        teams: teams.map((team: any) => ({
          ...team,
          sites: [],
          ItemType: SearchItemType.DashFolder,
          page: 1,
          perpage: 100,
          itemsFetching: false,
        })),
        loading: false,
        initialLoading: false,
      };
    }
    case TOGGLE_TEAM_SECTION: {
      const section = action.payload;
      const lookupField = getLookup(section.name);
      return {
        ...state,
        teams: state.teams.map((result: TeamSection) => {
          if (section[lookupField] === result[lookupField]) {
            return { ...result, expanded: !result.expanded };
          }
          return result;
        }),
      };
    }
    case FETCH_SITES: {
      const { section, sites } = action.payload;
      return {
        ...state,
        teams: state.teams.map((team: any) => {
          if (section.id === team.id) {
            return {
              ...team,
              sites: sites.map((site: any) => ({
                ...site,
                ItemType: SearchItemType.DashDB,
              })),
              itemsFetching: false,
            };
          }
          return team;
        }),
      };
    }
    case FETCH_SITES_START: {
      const id = action.payload;
      if (id) {
        return {
          ...state,
          teams: state.teams.map((team) => (team.id === id ? { ...team, itemsFetching: true } : team)),
        };
      }
      return state;
    }
    default:
      return state;
  }
};
