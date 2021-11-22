import { NavModelItem, NavModel } from '@grafana/data';

export function buildNavModel(name: string, alarm_id: number, site_id: number, asset_id: number): NavModelItem {
  let alarms_url = `org/useralarms`;
  let label = `org`;
  site_id = Number.isNaN(site_id) ? 0 : site_id;
  asset_id = Number.isNaN(asset_id) ? 0 : asset_id;
  if (site_id !== 0 && asset_id !== 0) {
    label = `asset`;
    alarms_url = `org/sites/${site_id}/assets/edit/${asset_id}/alarms`;
  } else if (site_id !== 0 && asset_id === 0) {
    label = `site`;
    alarms_url = `org/sites/edit/${site_id}/alarms`;
  }

  const navModel = {
    id: 'useralarms-' + alarm_id,
    subTitle: 'Manage alarm settings',
    url: '',
    text: name,
    breadcrumbs: [{ title: 'Alarms', url: alarms_url }],
    children: [
      {
        active: false,
        icon: 'sliders-v-alt',
        id: `useralarm-settings-${alarm_id}`,
        text: 'Settings',
        url: `${label}/useralarms/edit/${alarm_id}/settings`,
      },
    ],
  };

  return navModel;
}

export function getUserAlarmLoadingNav(pageName: string, name: string, site_id: number, asset_id: number): NavModel {
  const main = buildNavModel(name, 1, site_id, asset_id);

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
