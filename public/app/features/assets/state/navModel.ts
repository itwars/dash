import { Asset } from 'app/types';
import { NavModelItem, NavModel } from '@grafana/data';

export function buildNavModel(asset: Asset): NavModelItem {
  const navModel = {
    id: 'asset-' + asset.id,
    subTitle: 'Manage asset',
    url: '',
    text: asset.name,
    breadcrumbs: [{ title: 'Assets', url: `org/sites/edit/${asset.site_id}/assets` }],
    children: [
      {
        active: false,
        icon: 'bell',
        id: `asset-alarms-${asset.id}`,
        text: 'Alarms',
        url: `org/sites/${asset.site_id}/assets/edit/${asset.id}/alarms`,
      },
      {
        active: false,
        icon: 'sliders-v-alt',
        id: `asset-settings-${asset.id}`,
        text: 'Settings',
        url: `org/sites/${asset.site_id}/assets/edit/${asset.id}/settings`,
      },
    ],
  };

  return navModel;
}

export function getAssetLoadingNav(pageName: string): NavModel {
  const main = buildNavModel({
    id: 1,
    site_id: 0,
    type: 'Loading',
    name: 'Loading',
    serial: 'Loading',
    description: 'Loading',
    long: 0.0,
    lat: 0.0,
    asset_controller_configs: {},
    asset_app_configs: {},
    asset_props: {},
    alarm_count: 0,
    url: 'Loading',
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
