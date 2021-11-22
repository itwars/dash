import React, { FC, memo } from 'react';
import { css } from '@emotion/css';
import { useTheme2, CustomScrollbar, stylesFactory, IconButton } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { useCustomSearchQuery } from '../hooks/useCustomSearchQuery';
import { useSiteSearch } from '../hooks/useSiteSearch';
import { SearchField } from './SearchField';
import { CustomActionRow } from './CustomActionRow';
import { SearchLayout } from '../types';
import { useTeamSearch } from '../hooks/useTeamSearch';
import { TeamSearchResults } from './TeamSearchResults';
import { SiteSearchResults } from './SiteSearchResults';

export interface Props {
  onCloseSearch: () => void;
}

export const CustomSearch: FC<Props> = memo(({ onCloseSearch }) => {
  const { query, onQueryChange, onLayoutChange } = useCustomSearchQuery({});
  const { results: teamResults, loading: teamLoading, onToggleTeamSection } = useTeamSearch(query);
  const { results: siteResults, loading: siteLoading, onToggleSiteSection } = useSiteSearch(query);

  const theme = useTheme2();
  const styles = getStyles(theme);

  const renderTeams = () => {
    return (
      <CustomScrollbar>
        <TeamSearchResults
          results={teamResults}
          loading={teamLoading}
          editable={false}
          onToggleSection={onToggleTeamSection}
        />
      </CustomScrollbar>
    );
  };

  const renderSites = () => {
    return (
      <CustomScrollbar>
        <SiteSearchResults
          results={siteResults}
          loading={siteLoading}
          editable={false}
          onToggleSection={onToggleSiteSection}
        />
      </CustomScrollbar>
    );
  };

  return (
    <div tabIndex={0} className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.searchField}>
          {query.layout === SearchLayout.Folders ? (
            <SearchField query={query} onChange={onQueryChange} autoFocus clearable />
          ) : (
            <SearchField query={query} onChange={onQueryChange} autoFocus clearable />
          )}
          <div className={styles.closeBtn}>
            <IconButton name="times" surface="panel" onClick={onCloseSearch} size="xxl" tooltip="Close search" />
          </div>
        </div>
        <div className={styles.search}>
          <CustomActionRow
            {...{
              onLayoutChange,
              query,
            }}
          />
          {query.layout === SearchLayout.Folders ? renderSites() : renderTeams()}
        </div>
      </div>
    </div>
  );
});

CustomSearch.displayName = 'CustomSearch';

export default CustomSearch;

const getStyles = stylesFactory((theme: GrafanaTheme2) => {
  return {
    overlay: css`
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      z-index: ${theme.zIndex.sidemenu};
      position: fixed;
      background: ${theme.colors.background.canvas};

      ${theme.breakpoints.up('md')} {
        left: ${theme.components.sidemenu.width}px;
        z-index: ${theme.zIndex.navbarFixed + 1};
      }
    `,
    container: css`
      max-width: 1400px;
      padding: ${theme.spacing(2)};

      height: 100%;
      width: 40%;

      ${theme.breakpoints.up('md')} {
        padding: ${theme.spacing(4)};
      }
    `,
    closeBtn: css`
      right: -5px;
      top: 2px;
      z-index: 1;
      position: absolute;
    `,
    searchField: css`
      position: relative;
    `,
    search: css`
      display: flex;
      flex-direction: column;
      height: 100%;
      padding-bottom: ${theme.spacing(3)};
    `,
  };
});
