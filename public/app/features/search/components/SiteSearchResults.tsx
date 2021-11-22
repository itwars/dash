import React, { FC } from 'react';
import { css } from 'emotion';
import { GrafanaTheme } from '@grafana/data';
import { stylesFactory, useTheme, Spinner } from '@grafana/ui';
import { SiteSection, OnToggleSiteChecked } from '../types';
import { SiteSectionRow } from './SiteSectionRow';
import { AssetSectionRow } from './AssetSectionRow';

export interface Props {
  editable?: boolean;
  loading?: boolean;
  onToggleChecked?: OnToggleSiteChecked;
  onToggleSection: (section: SiteSection) => void;
  results: SiteSection[];
}

export const SiteSearchResults: FC<Props> = ({ editable, loading, onToggleChecked, onToggleSection, results }) => {
  const theme = useTheme();
  const styles = getSectionStyles(theme);
  const renderFolders = () => {
    return (
      <div>
        <table className="search-table search-table--hover expanded">
          <tbody>{results.map((section) => renderSite(section))}</tbody>
        </table>
      </div>
    );
  };

  const renderSite = (section: SiteSection) => {
    return (
      <>
        <SiteSectionRow onSectionClick={onToggleSection} {...{ onToggleChecked, editable, section }} />
        {section.expanded && renderAssets(section)}
      </>
    );
  };

  const renderAssets = (site: SiteSection) => {
    return (
      <tr>
        <td></td>
        <td colSpan={3}>
          <table className="search-table search-table--hover">
            <tbody>
              {site.assets.map((asset) => (
                <AssetSectionRow
                  key={asset.id}
                  onSectionClick={onToggleSection}
                  {...{ onToggleChecked, editable, asset, site }}
                />
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
    return <div className={styles.noResults}>No sites matching your query were found.</div>;
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
