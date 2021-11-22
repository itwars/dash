import React, { FC } from 'react';
import { css, cx } from 'emotion';
import { useLocalStorage } from 'react-use';
import { GrafanaTheme } from '@grafana/data';
import { Icon, stylesFactory, useTheme } from '@grafana/ui';
import { TeamSection, SiteSection } from '../types';
import { getSectionStorageKey } from '../utils';

interface TeamSiteSectionRowProps {
  editable?: boolean;
  onSectionClick: (section: TeamSection) => void;
  site: SiteSection;
  team: TeamSection;
}

export const TeamSiteSectionRow: FC<TeamSiteSectionRowProps> = ({ team, site, onSectionClick, editable = false }) => {
  const theme = useTheme();
  const styles = getTeamSiteSectionRowStyles(theme, site.selected, editable);
  const setSectionExpanded = useLocalStorage(getSectionStorageKey(site.name), true)[1];

  const onSectionExpand = () => {
    setSectionExpanded(true);
    onSectionClick(team);
  };

  return (
    <tr className={styles.wrapper} onClick={onSectionExpand}>
      <td style={{ width: '1%' }} className="link-td">
        <a href={site.url}>
          <div className={styles.icon}>
            <Icon name="map-marker" />
          </div>
        </a>
      </td>
      <td style={{ width: '30%' }} className="link-td">
        <a href={site.url}>{site.name}</a>
      </td>
    </tr>
  );
};

const getTeamSiteSectionRowStyles = stylesFactory((theme: GrafanaTheme, selected = false, editable: boolean) => {
  const { sm } = theme.spacing;
  return {
    wrapper: cx(
      css`
        border-bottom: 1px solid ${theme.colors.border1};
        font-size: ${theme.typography.size.base};
        color: ${theme.colors.textWeak};
        &:hover,
        &.selected {
          background: ${theme.colors.tableHoverBg};
        }
        &:hover {
          a {
            opacity: 1;
          }
          background: ${theme.colors.tableHoverBg};
        }
      `,
      'pointer',
      { selected }
    ),
    icon: css`
      padding: 0 ${sm} 0 ${editable ? 0 : sm};
    `,
  };
});
