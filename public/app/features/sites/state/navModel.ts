import { Site } from 'app/types';
import { NavModelItem, NavModel } from '@grafana/data';

export function buildNavModel(site: Site): NavModelItem {
  const navModel = {
    id: 'site-' + site.id,
    subTitle: 'Manage site',
    url: '',
    text: site.name,
    breadcrumbs: [{ title: 'Sites', url: 'org/sites' }],
    children: [
      {
        active: false,
        icon: 'rss',
        id: `site-assets-${site.id}`,
        text: 'Assets',
        url: `org/sites/edit/${site.id}/assets`,
      },
      {
        active: false,
        icon: 'object-group',
        id: `site-teams-${site.id}`,
        text: 'Teams',
        url: `org/sites/edit/${site.id}/teams`,
      },
      {
        active: false,
        icon: 'bell',
        id: `site-alarms-${site.id}`,
        text: 'Alarms',
        url: `org/sites/edit/${site.id}/alarms`,
      },
      {
        active: false,
        icon: 'sliders-v-alt',
        id: `site-settings-${site.id}`,
        text: 'Settings',
        url: `org/sites/edit/${site.id}/settings`,
      },
    ],
  };

  return navModel;
}

export function getSiteLoadingNav(pageName: string): NavModel {
  const main = buildNavModel({
    id: 1,
    type: 'Loading',
    name: 'Loading',
    description: 'Loading',
    url: 'Loading',
    long: 0.0,
    lat: 0.0,
    serial: 'Loading',
    site_app_configs: {},
    site_props: {},
    alarm_count: 0,
    team_count: 0,
    asset_count: 0,
  });

  let node: NavModelItem;

  for (const child of main.children!) {
    if (child.id!.indexOf(pageName) > 0) {
      child.active = true;
      node = child;
      break;
    }
  }

  return {
    main: main,
    node: node!,
  };
}
