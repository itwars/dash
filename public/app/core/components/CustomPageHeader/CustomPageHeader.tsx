import React, { FC } from 'react';
import { css } from '@emotion/css';
import { Tab, TabsBar, IconName, useStyles2 } from '@grafana/ui';
import { NavModel, NavModelItem, GrafanaTheme2 } from '@grafana/data';
import { PanelHeaderMenuItem } from 'app/features/dashboard/dashgrid/PanelHeader/PanelHeaderMenuItem';

export interface Props {
  model: NavModel;
}

const SelectNav = ({ children, customCss }: { children: NavModelItem[]; customCss: string }) => {
  if (!children || children.length === 0) {
    return null;
  }

  const defaultSelectedItem = children.find((navItem) => {
    return navItem.active === true;
  });

  return (
    <div className={`gf-form-select-wrapper width-20 ${customCss}`}>
      <div className="dropdown">
        <div className="gf-form-input dropdown-toggle" data-toggle="dropdown">
          {defaultSelectedItem?.text}
        </div>
        <ul className="dropdown-menu dropdown-menu--menu">
          {children.map((navItem: NavModelItem) => {
            if (navItem.hideFromTabs) {
              // TODO: Rename hideFromTabs => hideFromNav
              return null;
            }
            return (
              <PanelHeaderMenuItem
                key={navItem.url}
                iconClassName={navItem.icon}
                text={navItem.text}
                href={navItem.url}
              />
            );
          })}
        </ul>
      </div>
    </div>
  );
};

const Navigation = ({ children }: { children: NavModelItem[] }) => {
  if (!children || children.length === 0) {
    return null;
  }

  return (
    <nav>
      <SelectNav customCss="page-header__select-nav">{children}</SelectNav>
      <TabsBar className="page-header__tabs" hideBorder={true}>
        {children
          .sort((a, b) => ((a.index ? a.index : 0) > (b.index ? b.index : 0) ? 1 : -1))
          .map((child, index) => {
            return (
              !child.hideFromTabs && (
                <Tab
                  label={child.text}
                  active={child.active}
                  key={`${child.url}-${index}`}
                  icon={child.icon as IconName}
                  href={child.url}
                />
              )
            );
          })}
      </TabsBar>
    </nav>
  );
};

export const CustomPageHeader: FC<Props> = ({ model }) => {
  const styles = useStyles2(getStyles);

  if (!model) {
    return null;
  }

  const main = model.main;
  const children = main.children;

  return (
    <div className={styles.headerCanvas}>
      <div className="page-container">
        <div className="page-header">{children && children.length && <Navigation>{children}</Navigation>}</div>
      </div>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  headerCanvas: css`
    background: ${theme.colors.background.canvas};
  `,
});

export default CustomPageHeader;
