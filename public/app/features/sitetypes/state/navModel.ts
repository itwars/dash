import { SiteType } from 'app/types';
import { NavModelItem, NavModel } from '@grafana/data';

export function buildNavModel(siteType: SiteType): NavModelItem {
  const navModel = {
    id: 'sitetypes-' + siteType.id,
    subTitle: 'Manage site-type settings',
    url: '',
    text: siteType.type,
    breadcrumbs: [{ title: 'Site Types', url: 'admin/sitetypes' }],
    children: [
      {
        active: false,
        icon: 'sliders-v-alt',
        id: `sitetype-settings-${siteType.id}`,
        text: 'Settings',
        url: `admin/sitetypes/edit/${siteType.id}/settings`,
      },
    ],
  };

  return navModel;
}

export function getSiteTypeLoadingNav(pageName: string): NavModel {
  const main = buildNavModel({
    id: 1,
    type: 'Loading',
    site_app_configs: {},
    site_props: {},
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
