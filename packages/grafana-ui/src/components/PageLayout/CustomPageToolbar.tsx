import React, { FC, ReactNode } from 'react';
import { css, cx } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2 } from '../../themes/ThemeContext';
import { IconName } from '../../types';
import { styleMixins } from '../../themes';
import { getFocusStyles } from '../../themes/mixins';

export interface Props {
  pageIcon?: IconName;
  title: string;
  parent?: string;
  onGoBack?: () => void;
  titleHref?: string;
  parentHref?: string;
  leftItems?: ReactNode[];
  children?: ReactNode;
  className?: string;
  isFullscreen?: boolean;
}

/** @alpha */
export const CustomPageToolbar: FC<Props> = React.memo(({ children, leftItems, isFullscreen, className }) => {
  const styles = useStyles2(getStyles);

  /**
   * .page-toolbar css class is used for some legacy css view modes (TV/Kiosk) and
   * media queries for mobile view when toolbar needs left padding to make room
   * for mobile menu icon. This logic hopefylly can be changed when we move to a full react
   * app and change how the app side menu & mobile menu is rendered.
   */
  const mainStyle = cx(
    'page-toolbar',
    styles.toolbar,
    {
      ['page-toolbar--fullscreen']: isFullscreen,
    },
    className
  );

  return (
    <div className={mainStyle}>
      <div className={styles.navbarSpacer}></div>
      {leftItems?.map((child, index) => (
        <div className={styles.leftActionItem} key={index}>
          {child}
        </div>
      ))}

      <div className={styles.spacer} />
      {React.Children.toArray(children)
        .filter(Boolean)
        .map((child, index) => {
          return (
            <div className={styles.actionWrapper} key={index}>
              {child}
            </div>
          );
        })}
    </div>
  );
});

CustomPageToolbar.displayName = 'CustomPageToolbar';

const getStyles = (theme: GrafanaTheme2) => {
  const { spacing, typography } = theme;

  const focusStyle = getFocusStyles(theme);
  const titleStyles = css`
    font-size: ${typography.size.lg};
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    margin: 0;
    max-width: 240px;
    border-radius: 2px;

    @media ${styleMixins.mediaUp(theme.v1.breakpoints.xl)} {
      max-width: unset;
    }
  `;

  return {
    toolbar: css`
      align-items: center;
      background: ${theme.colors.background.canvas};
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      padding: ${theme.spacing(1.5, 2)};
    `,
    spacer: css`
      flex-grow: 1;
    `,
    pageIcon: css`
      display: none;
      @media ${styleMixins.mediaUp(theme.v1.breakpoints.md)} {
        display: flex;
        padding-right: ${theme.spacing(1)};
        align-items: center;
      }
    `,
    titleWrapper: css`
      display: flex;
      align-items: center;
      min-width: 0;
      overflow: hidden;
    `,
    navElement: css`
      display: flex;
    `,
    h1Styles: css`
      margin: 0;
      line-height: inherit;
      display: flex;
    `,
    parentIcon: css`
      margin-left: ${theme.spacing(0.5)};
    `,
    titleText: titleStyles,
    titleLink: css`
      &:focus-visible {
        ${focusStyle}
      }
    `,
    titleDivider: css`
      padding: ${spacing(0, 0.5, 0, 0.5)};
    `,
    parentLink: css`
      display: none;
      @media ${styleMixins.mediaUp(theme.v1.breakpoints.md)} {
        display: unset;
      }
    `,
    actionWrapper: css`
      padding: ${spacing(0.5, 0, 0.5, 1)};
    `,
    leftActionItem: css`
      display: none;
      @media ${styleMixins.mediaUp(theme.v1.breakpoints.md)} {
        align-items: center;
        display: flex;
        padding-left: ${spacing(0.5)};
      }
    `,
    navbarSpacer: css`
      flex-grow: 100;
    `,
  };
};