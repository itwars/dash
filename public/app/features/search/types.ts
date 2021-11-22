import { Dispatch } from 'react';
import { Action } from 'redux';
import { SelectableValue } from '@grafana/data';
import { FolderInfo } from '../../types';

export enum DashboardSearchItemType {
  DashDB = 'dash-db',
  DashHome = 'dash-home',
  DashFolder = 'dash-folder',
}

export enum SearchItemType {
  DashDB = 'dash-db',
  DashHome = 'dash-home',
  DashFolder = 'dash-folder',
}

export interface SiteSection {
  id: number;
  name: string;
  description: string;
  type: string;
  itemType: SearchItemType;
  alarmCount: number;
  icon?: string;
  itemsFetching?: boolean;
  expanded?: boolean;
  selected?: boolean;
  url: string;
  assets: AssetSection[];
  page: number;
  perpage: number;
}

export interface TeamSection {
  id: number;
  name: string;
  itemType: SearchItemType;
  itemsFetching?: boolean;
  expanded?: boolean;
  selected?: boolean;
  avatarUrl: string;
  sites: SiteSection[];
  page: number;
  perpage: number;
}

export interface AssetSection {
  id: number;
  name: string;
  serial: string;
  description: string;
  type: string;
  alarmCount: number;
  itemType: SearchItemType;
  icon?: string;
  selected?: boolean;
  url: string;
}
export interface QueryResult {
  page: number;
  perPage: number;
  totalCount: number;
  data: any[];
  teams: any[];
}

export interface SearchQuery {
  query: string;
  page: number;
  perpage: number;
  folderIds: number[];
  layout: SearchLayout;
}

export interface DashboardSection {
  id: number;
  uid?: string;
  title: string;
  expanded?: boolean;
  url: string;
  icon?: string;
  score?: number;
  checked?: boolean;
  items: DashboardSectionItem[];
  toggle?: (section: DashboardSection) => Promise<DashboardSection>;
  selected?: boolean;
  type: DashboardSearchItemType;
  slug?: string;
  itemsFetching?: boolean;
}

export interface DashboardSectionItem {
  checked?: boolean;
  folderId?: number;
  folderTitle?: string;
  folderUid?: string;
  folderUrl?: string;
  id: number;
  isStarred: boolean;
  selected?: boolean;
  tags: string[];
  title: string;
  type: DashboardSearchItemType;
  uid?: string;
  uri: string;
  url: string;
  sortMeta?: number;
  sortMetaName?: string;
}

export interface DashboardSearchHit extends DashboardSectionItem, DashboardSection {}

export interface DashboardTag {
  term: string;
  count: number;
}

export interface SearchAction extends Action {
  payload?: any;
}

export interface UidsToDelete {
  folders: string[];
  dashboards: string[];
}

export interface DashboardQuery {
  query: string;
  tag: string[];
  starred: boolean;
  skipRecent: boolean;
  skipStarred: boolean;
  folderIds: number[];
  sort: SelectableValue | null;
  // Save sorting data between layouts
  prevSort: SelectableValue | null;
  layout: SearchLayout;
}

export type SearchReducer<S> = [S, Dispatch<SearchAction>];
interface UseSearchParams {
  queryParsing?: boolean;
  searchCallback?: (folderUid: string | undefined) => any;
  folderUid?: string;
}

export type UseSearch = <S>(
  query: DashboardQuery,
  reducer: SearchReducer<S>,
  params: UseSearchParams
) => { state: S; dispatch: Dispatch<SearchAction>; onToggleSection: (section: DashboardSection) => void };

export type UseSiteSearch = <S>(
  query: SearchQuery,
  reducer: SearchReducer<S>,
  params: UseSearchParams
) => {
  state: S;
  dispatch: Dispatch<SearchAction>;
  onToggleSiteSection: (section: SiteSection) => void;
};

export type UseTeamSearch = <S>(
  query: SearchQuery,
  reducer: SearchReducer<S>,
  params: UseSearchParams
) => {
  state: S;
  dispatch: Dispatch<SearchAction>;
  onToggleTeamSection: (section: TeamSection) => void;
};

export type OnToggleChecked = (item: DashboardSectionItem | DashboardSection) => void;
export type OnDeleteItems = (folders: string[], dashboards: string[]) => void;
export type OnMoveItems = (selectedDashboards: DashboardSectionItem[], folder: FolderInfo | null) => void;
export type OnToggleSiteChecked = (item: SiteSection) => void;
export type OnToggleTeamChecked = (item: TeamSection) => void;

export enum SearchLayout {
  List = 'list',
  Folders = 'folders',
}

export interface SearchQueryParams {
  query?: string | null;
  sort?: string | null;
  starred?: boolean | null;
  tag?: string[] | null;
  layout?: SearchLayout | null;
  folder?: string | null;
  page?: number | null;
  perpage?: number | null;
}
