import { Alarm } from 'app/types';
import { NavModelItem, NavModel } from '@grafana/data';

export function buildNavModel(alarm: Alarm): NavModelItem {
  const navModel = {
    id: 'alarms-' + alarm.id,
    subTitle: 'Manage alarm settings',
    url: '',
    text: alarm.name,
    breadcrumbs: [{ title: 'Alarms', url: 'admin/alarms' }],
    children: [
      {
        active: false,
        icon: 'sliders-v-alt',
        id: `alarm-settings-${alarm.id}`,
        text: 'Settings',
        url: `admin/alarms/edit/${alarm.id}/settings`,
      },
    ],
  };

  return navModel;
}

export function getAlarmLoadingNav(pageName: string): NavModel {
  const main = buildNavModel({
    id: 1,
    name: 'Loading',
    description: 'Loading',
    alerting_msg: 'Loading',
    ok_msg: 'Loading',
    severity: 0,
    permission_level: 0,
    alarm_level: 0,
    for_duration: 0,
    manual_reset: false,
    context: {},
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
