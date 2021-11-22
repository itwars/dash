import React, { FC } from 'react';
import { css, cx } from 'emotion';
import { useLocalStorage } from 'react-use';
import { GrafanaTheme } from '@grafana/data';
import { Icon, Spinner, stylesFactory, useTheme } from '@grafana/ui';
import { SiteSection } from '../types';
import { getSectionStorageKey } from '../utils';

interface SiteSectionRowProps {
  editable?: boolean;
  onSectionClick: (section: SiteSection) => void;
  section: SiteSection;
}

export const SiteSectionRow: FC<SiteSectionRowProps> = ({ section, onSectionClick, editable = false }) => {
  const theme = useTheme();
  const styles = getSiteSectionRowStyles(theme, section.selected, editable);
  const setSectionExpanded = useLocalStorage(getSectionStorageKey(section.name), true)[1];

  const onSectionExpand = () => {
    setSectionExpanded(!section.expanded);
    onSectionClick(section);
  };

  return (
    <tr className={styles.wrapper} onClick={onSectionExpand}>
      <td style={{ width: '1%' }} className="link-td">
        <a href={section.url}>
          <div className={styles.icon}>
            <Icon name="map-marker" />
          </div>
        </a>
      </td>
      <td style={{ width: '95%' }} className="link-td">
        <a href={section.url}>{section.name}</a>
      </td>
      <td style={{ width: '5%' }} className="link-td">
        {section.itemsFetching ? <Spinner /> : <Icon name={section.expanded ? 'angle-down' : 'angle-right'} />}
      </td>
    </tr>
  );
};

const getSiteSectionRowStyles = stylesFactory((theme: GrafanaTheme, selected = false, editable: boolean) => {
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
