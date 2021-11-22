import React, { FC } from 'react';
import { css } from '@emotion/css';
import { HorizontalGroup, RadioButtonGroup, stylesFactory, useTheme } from '@grafana/ui';
import { GrafanaTheme } from '@grafana/data';
import { SearchQuery, SearchLayout } from '../types';

export const layoutOptions = [
  { value: SearchLayout.Folders, icon: 'map-marker', ariaLabel: 'Search by sites' },
  { value: SearchLayout.List, icon: 'users-alt', ariaLabel: 'Search by teams' },
];

interface Props {
  onLayoutChange: (layout: SearchLayout) => void;
  query: SearchQuery;
  hideLayout?: boolean;
}

export const CustomActionRow: FC<Props> = ({ onLayoutChange, query, hideLayout }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <div className={styles.actionRow}>
      <div className={styles.rowContainer}>
        <HorizontalGroup spacing="md" width="auto">
          {!hideLayout ? (
            <RadioButtonGroup options={layoutOptions} onChange={onLayoutChange} value={query.layout} />
          ) : null}
        </HorizontalGroup>
      </div>
    </div>
  );
};

CustomActionRow.displayName = 'CustomActionRow';

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    actionRow: css`
      display: none;

      @media only screen and (min-width: ${theme.breakpoints.md}) {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: ${theme.spacing.lg} 0;
        width: 100%;
      }
    `,
    rowContainer: css`
      margin-right: ${theme.spacing.md};
    `,
    checkboxWrapper: css`
      label {
        line-height: 1.2;
      }
    `,
  };
});
