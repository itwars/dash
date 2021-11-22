import React, { FC } from 'react';
import { css } from 'emotion';
import { GrafanaTheme } from '@grafana/data';
import { stylesFactory, useTheme, Spinner } from '@grafana/ui';
import { TeamSection } from '../types';
import { TeamSectionRow } from './TeamSectionRow';
import { TeamSiteSectionRow } from './TeamSiteSectionRow';

export interface Props {
  editable?: boolean;
  loading?: boolean;
  onToggleSection: (section: TeamSection) => void;
  results: TeamSection[];
}

export const TeamSearchResults: FC<Props> = ({ editable, loading, onToggleSection, results }) => {
  const theme = useTheme();
  const styles = getSectionStyles(theme);

  const renderFolders = () => {
    return (
      <div>
        <table className="search-table search-table--hover expanded">
          <tbody>{results.map((section) => renderTeam(section))}</tbody>
        </table>
      </div>
    );
  };

  const renderTeam = (section: TeamSection) => {
    return (
      <>
        <TeamSectionRow key={section.id} onSectionClick={onToggleSection} {...{ editable, section }} />
        {section.expanded && renderSites(section)}
      </>
    );
  };

  const renderSites = (team: TeamSection) => {
    return (
      <tr>
        <td></td>
        <td colSpan={2}>
          <table className="search-table search-table--hover">
            <tbody>
              {team.sites.map((site) => (
                <TeamSiteSectionRow key={site.id} onSectionClick={onToggleSection} {...{ editable, site, team }} />
              ))}
            </tbody>
          </table>
        </td>
      </tr>
    );
  };

  if (loading) {
    return <Spinner className={styles.spinner} />;
  } else if (!results || !results.length) {
    return <div className={styles.noResults}>No teams matching your query were found.</div>;
  }

  return <div className={styles.resultsContainer}>{renderFolders()}</div>;
};

const getSectionStyles = stylesFactory((theme: GrafanaTheme) => {
  const { md } = theme.spacing;

  return {
    wrapper: css`
      display: flex;
      flex-direction: column;
    `,
    section: css`
      display: flex;
      flex-direction: column;
      background: ${theme.colors.panelBg};
      border-bottom: solid 1px ${theme.colors.border2};
    `,
    sectionItems: css`
      margin: 0 24px 0 32px;
    `,
    spinner: css`
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100px;
    `,
    resultsContainer: css`
      position: relative;
      flex-grow: 10;
      margin-bottom: ${md};
      background: ${theme.colors.bg1};
      border: 1px solid ${theme.colors.border1};
      border-radius: 3px;
      height: 100%;
    `,
    noResults: css`
      padding: ${md};
      background: ${theme.colors.bg2};
      font-style: italic;
      margin-top: ${theme.spacing.md};
    `,
    listModeWrapper: css`
      position: relative;
      height: 100%;
      padding: ${md};
    `,
    icon: css`
      padding: 0 8x 0 8x;
    `,
  };
});
