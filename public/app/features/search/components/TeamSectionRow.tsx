import React, { FC } from 'react';
import { css, cx } from '@emotion/css';
import { useLocalStorage } from 'react-use';
import { GrafanaTheme } from '@grafana/data';
import { Icon, Spinner, stylesFactory, useTheme } from '@grafana/ui';
import { TeamSection } from '../types';
import { getSectionStorageKey } from '../utils';

interface TeamSectionRowProps {
  editable?: boolean;
  onSectionClick: (section: TeamSection) => void;
  section: TeamSection;
}

export const TeamSectionRow: FC<TeamSectionRowProps> = ({ section, onSectionClick, editable = false }) => {
  const theme = useTheme();
  const styles = getTeamSectionRowStyles(theme, section.selected, editable);
  const setSectionExpanded = useLocalStorage(getSectionStorageKey(section.name), true)[1];

  const onSectionExpand = () => {
    setSectionExpanded(!section.expanded);
    onSectionClick(section);
  };

  return (
    <tr className={styles.wrapper} onClick={onSectionExpand}>
      <td style={{ width: '5%' }} className="text-center link-td">
        <a>
          <img className="search-table__avatar" src={section.avatarUrl} />
        </a>
      </td>
      <td style={{ width: '85%' }} className="link-td">
        <a>{section.name}</a>
      </td>
      <td style={{ width: '5%' }} className="link-td">
        {section.itemsFetching ? <Spinner /> : <Icon name={section.expanded ? 'angle-down' : 'angle-right'} />}
      </td>
    </tr>
  );
};

const getTeamSectionRowStyles = stylesFactory((theme: GrafanaTheme, selected = false, editable: boolean) => {
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