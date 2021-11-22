import { AssetType } from 'app/types';
import { NavModelItem, NavModel } from '@grafana/data';

export function buildNavModel(assetType: AssetType): NavModelItem {
  const navModel = {
    id: 'assettypes-' + assetType.id,
    subTitle: 'Manage asset-type settings',
    url: '',
    text: assetType.type,
    breadcrumbs: [{ title: 'Asset Types', url: 'admin/assettypes' }],
    children: [
      {
        active: false,
        icon: 'sliders-v-alt',
        id: `assettype-settings-${assetType.id}`,
        text: 'Settings',
        url: `admin/assettypes/edit/${assetType.id}/settings`,
      },
    ],
  };

  return navModel;
}

export function getAssetTypeLoadingNav(pageName: string): NavModel {
  const main = buildNavModel({
    id: 1,
    type: 'Loading',
    asset_app_configs: {},
    asset_props: {},
    asset_controller_configs: {},
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
