import React, { FC } from 'react';
import { css, cx } from '@emotion/css';
import { useLocalStorage } from 'react-use';
import { GrafanaTheme } from '@grafana/data';
import { Icon, stylesFactory, useTheme } from '@grafana/ui';
import { AssetSection, SiteSection } from '../types';
import { getSectionStorageKey } from '../utils';

interface AssetSectionRowProps {
  editable?: boolean;
  onSectionClick: (section: SiteSection) => void;
  asset: AssetSection;
  site: SiteSection;
}

export const AssetSectionRow: FC<AssetSectionRowProps> = ({ site, asset, onSectionClick, editable = false }) => {
  const theme = useTheme();
  const styles = getAssetSectionRowStyles(theme, asset.selected, editable);
  const setSectionExpanded = useLocalStorage(getSectionStorageKey(asset.name), true)[1];

  const onSectionExpand = () => {
    setSectionExpanded(true);
    onSectionClick(site);
  };

  return (
    <tr className={styles.wrapper} onClick={onSectionExpand}>
      <td style={{ width: '1%' }} className="link-td">
        <a href={asset.url}>
          <div className={styles.icon}>
            <Icon name="rss" />
          </div>
        </a>
      </td>
      <td style={{ width: '30%' }} className="link-td">
        <a href={asset.url}>{asset.name}</a>
      </td>
      <td style={{ width: '30%' }} className="link-td">
        <a href={asset.url}>{asset.serial}</a>
      </td>
    </tr>
  );
};

const getAssetSectionRowStyles = stylesFactory((theme: GrafanaTheme, selected = false, editable: boolean) => {
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
